import type { AlpacaNewsPayload, HistoricalNewsPage } from "./types";

export type LiveConnection = {
  connectedAt: Date;
  closed: Promise<void>;
  close(): void;
};

export interface NewsSource {
  fetchHistorical(input: {
    start: Date;
    end: Date;
    pageToken?: string;
    signal?: AbortSignal;
  }): Promise<HistoricalNewsPage>;
  connectLive(
    onPayload: (payload: AlpacaNewsPayload, receivedAt: Date) => void,
    signal?: AbortSignal,
  ): Promise<LiveConnection>;
}

type SocketLike = {
  addEventListener(type: "open" | "message" | "close" | "error", listener: (event: Event | MessageEvent) => void): void;
  send(data: string): void;
  close(): void;
};

type AlpacaSourceOptions = {
  apiKey: string;
  apiSecret: string;
  fetch?: typeof fetch;
  socketFactory?: (url: string) => SocketLike;
};

function isPayload(value: unknown): value is AlpacaNewsPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class AlpacaNewsSource implements NewsSource {
  private readonly fetchImpl: typeof fetch;
  private readonly socketFactory: (url: string) => SocketLike;

  constructor(private readonly options: AlpacaSourceOptions) {
    this.fetchImpl = options.fetch ?? fetch;
    this.socketFactory =
      options.socketFactory ?? ((url) => new WebSocket(url) as unknown as SocketLike);
  }

  async fetchHistorical(input: {
    start: Date;
    end: Date;
    pageToken?: string;
    signal?: AbortSignal;
  }): Promise<HistoricalNewsPage> {
    const url = new URL("https://data.alpaca.markets/v1beta1/news");
    url.searchParams.set("start", input.start.toISOString());
    url.searchParams.set("end", input.end.toISOString());
    url.searchParams.set("sort", "asc");
    url.searchParams.set("limit", "50");
    url.searchParams.set("include_content", "true");
    if (input.pageToken) url.searchParams.set("page_token", input.pageToken);

    const response = await this.fetchImpl(url, {
      signal: input.signal,
      headers: {
        "APCA-API-KEY-ID": this.options.apiKey,
        "APCA-API-SECRET-KEY": this.options.apiSecret,
      },
    });
    if (!response.ok) throw new Error(`Alpaca historical news request failed (${response.status})`);
    const body = (await response.json()) as { news?: unknown; next_page_token?: unknown };
    if (!Array.isArray(body.news) || !body.news.every(isPayload)) {
      throw new Error("Alpaca historical news response has an invalid shape");
    }
    return {
      items: body.news,
      nextPageToken: typeof body.next_page_token === "string" ? body.next_page_token : null,
    };
  }

  async connectLive(
    onPayload: (payload: AlpacaNewsPayload, receivedAt: Date) => void,
    signal?: AbortSignal,
  ): Promise<LiveConnection> {
    const socket = this.socketFactory("wss://stream.data.alpaca.markets/v1beta1/news");

    return new Promise<LiveConnection>((resolve, reject) => {
      let settled = false;
      let authenticated = false;
      let resolveClosed!: () => void;
      const closed = new Promise<void>((done) => {
        resolveClosed = done;
      });

      const failBeforeReady = (message: string) => {
        if (!settled) {
          settled = true;
          reject(new Error(message));
        }
      };

      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({
          action: "auth",
          key: this.options.apiKey,
          secret: this.options.apiSecret,
        }));
      });
      socket.addEventListener("message", (event) => {
        try {
          const parsed = JSON.parse(String((event as MessageEvent).data)) as unknown;
          const messages = Array.isArray(parsed) ? parsed : [parsed];
          for (const message of messages) {
            if (!isPayload(message)) continue;
            if (message.T === "success" && message.msg === "authenticated" && !authenticated) {
              authenticated = true;
              socket.send(JSON.stringify({ action: "subscribe", news: ["*"] }));
              continue;
            }
            if (message.T === "subscription" && Array.isArray(message.news)) {
              if (!settled) {
                settled = true;
                resolve({ connectedAt: new Date(), closed, close: () => socket.close() });
              }
              continue;
            }
            if (message.T === "error") {
              failBeforeReady("Alpaca rejected the news stream connection");
              socket.close();
              continue;
            }
            if (message.T === "n") onPayload(message, new Date());
          }
        } catch {
          // A malformed provider frame is ignored here; valid news frames are handled individually.
        }
      });
      socket.addEventListener("error", () => failBeforeReady("Alpaca news stream connection failed"));
      socket.addEventListener("close", () => {
        failBeforeReady("Alpaca news stream closed before subscription");
        resolveClosed();
      });
      signal?.addEventListener("abort", () => socket.close(), { once: true });
    });
  }
}
