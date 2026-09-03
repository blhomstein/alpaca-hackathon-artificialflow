# FlowGraph AI

## Project overview

FlowGraph AI is a paper-trading prototype for the Alpaca AI Trading Agents Hackathon. It turns Alpaca news (or a clearly labelled replay event) into a structured event, confirms the move with market data, selects a defined-risk option debit spread, applies deterministic risk checks, and records the decision, order state, and P&L for the UI.

This project tests a capital-flow hypothesis; it does not claim proven profitability.

## Current hackathon scope

The one-day scope is the smallest demonstrable path from news or replay through extraction, market confirmation, option spread selection, risk approval, Alpaca paper-order submission, monitoring, and an explainable UI. Historical component backlogs remain in `docs/system-backlog/`; the active critical path is the [Hackathon Execution Board](docs/TASKS.md).

The repository currently includes the frontend and a durable Alpaca news ingestor with PostgreSQL storage, deduplication, recovery, tests, and a read-only health endpoint. Remaining submission work is tracked explicitly on the execution board.

## Developer responsibilities

- **Dev A — Intelligence and Product:** event extraction and validation, candidate generation, replay/demo data, decision and rejection UI, README/submission copy, and video.
- **Dev B — Trading and Execution:** Alpaca connectivity and market data, option spread construction, deterministic risk, paper execution, monitoring, exits, P&L, and kill switch.
- Integration tasks still have one named primary owner on the [execution board](docs/TASKS.md), even when both developers pair on verification.

## Local setup

Requires Node.js 20+, pnpm, and PostgreSQL.

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Start the durable news worker separately with `pnpm news:ingest`. Run the current component tests with `pnpm test`.

Optional news settings are `NEWS_SYMBOL_UNIVERSE` (comma separated), `NEWS_HISTORICAL_START` (RFC 3339), `NEWS_RAW_RETENTION_DAYS` (default `30`), and `NEWS_STALE_AFTER_MS` (default `300000`). News health is exposed read-only at `/api/health/news`.

## Required environment variables

Copy `.env.example` to a local `.env` and supply:

- `APCA_API_KEY_ID` and `APCA_API_SECRET_KEY` for the dedicated Alpaca paper account.
- `ALPACA_TRADING_URL=https://paper-api.alpaca.markets` and `ALPACA_DATA_URL=https://data.alpaca.markets`.
- `DATABASE_URL` for PostgreSQL.
- `GEMINI_KEY` for the LLM provider used by event extraction.

Never commit `.env` or credentials.

## Paper-trading warning

All order paths must target Alpaca paper trading. Paper fills and live paper P&L are not real-money results and may be optimistic. Replay or simulated decisions and P&L must be labelled `SIMULATED` and displayed separately from live paper results.

## Execution board

Use [docs/TASKS.md](docs/TASKS.md) as the handoff source of truth for ownership, dependencies, acceptance criteria, checkpoints, and cut scope.
