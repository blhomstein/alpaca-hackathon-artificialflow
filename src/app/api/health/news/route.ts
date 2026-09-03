import { getPostgresPool } from "@/server/db";
import { PostgresNewsRepository } from "@/server/news/postgres-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const repository = new PostgresNewsRepository(getPostgresPool());
    const staleAfterMs = Number(process.env.NEWS_STALE_AFTER_MS ?? 5 * 60_000);
    return Response.json(await repository.getHealth(new Date(), staleAfterMs), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { status: "disconnected", connected: false, recovering: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

