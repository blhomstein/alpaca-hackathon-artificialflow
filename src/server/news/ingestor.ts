import type { NewsSource } from "./alpaca-source";
import { MalformedNewsError, normalizeAlpacaNews } from "./normalize";
import type { NewsRepository, PersistNewsResult } from "./repository";
import type { AlpacaNewsPayload, JsonValue } from "./types";

export type NewsIngestorOptions = {
  lockedUniverse: ReadonlySet<string>;
  historicalStart: Date;
  maxReconnectDelayMs?: number;
  initialReconnectDelayMs?: number;
  now?: () => Date;
};

const CURSOR_STREAM = "alpaca-news";

function asJson(payload: AlpacaNewsPayload): JsonValue {
  return payload as { [key: string]: JsonValue };
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(signal.reason ?? new Error("Aborted"));
      },
      { once: true },
    );
  });
}

export class NewsIngestor {
  private readonly now: () => Date;

  constructor(
    private readonly source: NewsSource,
    private readonly repository: NewsRepository,
    private readonly options: NewsIngestorOptions,
  ) {
    this.now = options.now ?? (() => new Date());
  }

  async ingest(
    payload: AlpacaNewsPayload,
    receivedAt = this.now(),
  ): Promise<PersistNewsResult | { outcome: "dead-letter" }> {
    try {
      const record = normalizeAlpacaNews(payload, receivedAt, this.options.lockedUniverse);
      return await this.repository.persistNews({ record, rawPayload: asJson(payload) });
    } catch (error) {
      if (!(error instanceof MalformedNewsError)) throw error;
      await this.repository.persistDeadLetter({
        provider: "alpaca",
        rawPayload: asJson(payload),
        reason: error.message,
        receivedAt: receivedAt.toISOString(),
      });
      return { outcome: "dead-letter" };
    }
  }

  async catchUp(end: Date, signal?: AbortSignal): Promise<void> {
    const cursor = await this.repository.getCursor(CURSOR_STREAM);
    let start = cursor ? new Date(cursor.value) : this.options.historicalStart;
    if (Number.isNaN(start.getTime())) start = this.options.historicalStart;
    let pageToken: string | undefined;

    do {
      const page = await this.source.fetchHistorical({ start, end, pageToken, signal });
      for (const payload of page.items) {
        const receivedAt = this.now();
        try {
          const record = normalizeAlpacaNews(payload, receivedAt, this.options.lockedUniverse);
          await this.repository.persistNews({
            record,
            rawPayload: asJson(payload),
            cursor: {
              stream: CURSOR_STREAM,
              value: record.sourceCreatedAt,
              updatedAt: receivedAt.toISOString(),
            },
          });
        } catch (error) {
          if (!(error instanceof MalformedNewsError)) throw error;
          await this.repository.persistDeadLetter({
            provider: "alpaca",
            rawPayload: asJson(payload),
            reason: error.message,
            receivedAt: receivedAt.toISOString(),
          });
        }
      }
      pageToken = page.nextPageToken ?? undefined;
    } while (pageToken && !signal?.aborted);
  }

  /** Catch up, bridge the socket handoff with an overlapping query, then stay live. */
  async run(signal?: AbortSignal): Promise<void> {
    await this.repository.updateConnection({ connected: false, recovering: true, at: this.now().toISOString() });
    await this.catchUp(this.now(), signal);

    let reconnectDelay = this.options.initialReconnectDelayMs ?? 1_000;
    const maxReconnectDelay = this.options.maxReconnectDelayMs ?? 30_000;
    while (!signal?.aborted) {
      let releaseBuffer!: () => void;
      const bufferGate = new Promise<void>((resolve) => {
        releaseBuffer = resolve;
      });
      let delivery = Promise.resolve();

      try {
        const connection = await this.source.connectLive((payload, receivedAt) => {
          delivery = delivery.then(async () => {
            await bufferGate;
            await this.ingest(payload, receivedAt);
          });
        }, signal);

        // Query an inclusive overlap through the moment the subscription became active.
        // Uniqueness constraints turn overlap into harmless duplicates and close the gap.
        await this.catchUp(connection.connectedAt, signal);
        releaseBuffer();
        await delivery;
        await this.repository.updateConnection({ connected: true, recovering: false, at: this.now().toISOString() });
        reconnectDelay = this.options.initialReconnectDelayMs ?? 1_000;
        await connection.closed;
        if (signal?.aborted) break;
        await this.repository.incrementReconnect(this.now().toISOString());
      } catch {
        releaseBuffer();
        await delivery;
        if (signal?.aborted) break;
        await this.repository.incrementReconnect(this.now().toISOString());
        await delay(reconnectDelay, signal);
        reconnectDelay = Math.min(maxReconnectDelay, reconnectDelay * 2);
        continue;
      }

      await delay(reconnectDelay, signal);
    }

    await this.repository.updateConnection({ connected: false, recovering: false, at: this.now().toISOString() });
  }
}
