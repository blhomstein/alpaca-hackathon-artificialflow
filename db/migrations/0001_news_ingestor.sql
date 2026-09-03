BEGIN;

CREATE TABLE IF NOT EXISTS normalized_news (
  id uuid PRIMARY KEY,
  schema_version integer NOT NULL CHECK (schema_version > 0),
  provider text NOT NULL,
  source text,
  provider_article_id text,
  headline text NOT NULL CHECK (length(headline) > 0),
  summary text,
  content text,
  content_type text CHECK (content_type IN ('text/html', 'text/plain')),
  author text,
  url text,
  source_symbols text[] NOT NULL,
  candidate_symbols text[] NOT NULL,
  source_created_at timestamptz NOT NULL,
  source_updated_at timestamptz,
  received_at timestamptz NOT NULL,
  raw_payload_hash text NOT NULL CHECK (raw_payload_hash ~ '^[0-9a-f]{64}$'),
  raw_canonicalization text NOT NULL CHECK (raw_canonicalization = 'jcs-v1'),
  raw_payload_ref text NOT NULL UNIQUE
);

CREATE UNIQUE INDEX IF NOT EXISTS normalized_news_provider_id_uq
  ON normalized_news (provider, provider_article_id)
  WHERE provider_article_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS normalized_news_raw_hash_uq
  ON normalized_news (raw_payload_hash);
CREATE INDEX IF NOT EXISTS normalized_news_source_created_idx
  ON normalized_news (source_created_at DESC);

CREATE TABLE IF NOT EXISTS news_raw_payloads (
  normalized_news_id uuid PRIMARY KEY REFERENCES normalized_news(id) ON DELETE CASCADE,
  payload jsonb,
  expires_at timestamptz NOT NULL,
  redacted_at timestamptz
);

CREATE TABLE IF NOT EXISTS extraction_jobs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  normalized_news_id uuid NOT NULL UNIQUE REFERENCES normalized_news(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  claimed_at timestamptz,
  completed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);

CREATE TABLE IF NOT EXISTS news_ingestion_cursors (
  stream text PRIMARY KEY,
  cursor_value text NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS news_dead_letters (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider text NOT NULL,
  payload jsonb NOT NULL,
  reason text NOT NULL,
  received_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS news_ingestor_health (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  connected boolean NOT NULL DEFAULT false,
  recovering boolean NOT NULL DEFAULT false,
  last_success_at timestamptz,
  last_source_at timestamptz,
  reconnect_count integer NOT NULL DEFAULT 0 CHECK (reconnect_count >= 0),
  duplicate_count integer NOT NULL DEFAULT 0 CHECK (duplicate_count >= 0),
  malformed_count integer NOT NULL DEFAULT 0 CHECK (malformed_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO news_ingestor_health (singleton) VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

COMMIT;
