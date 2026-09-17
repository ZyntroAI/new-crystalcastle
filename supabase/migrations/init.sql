CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  source_type TEXT DEFAULT 'text',
  source_name TEXT,
  page_number INTEGER,
  total_pages INTEGER,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  total_pages INTEGER,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_embedding ON public.documents
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION public.search_documents(
  query_embedding vector(768),
  match_threshold double precision DEFAULT 0.72,
  match_count integer DEFAULT 5
) RETURNS TABLE (id UUID, content TEXT, metadata JSONB, similarity double precision)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding LIMIT match_count;
END;
$$;
