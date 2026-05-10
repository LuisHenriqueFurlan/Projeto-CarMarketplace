-- =============================================================================
-- Índices GIN — aplicar APÓS prisma migrate dev
-- O Prisma não suporta GIN com operator class (gin_trgm_ops) nem índices
-- sobre campos Unsupported (tsvector) no schema.prisma.
-- =============================================================================

-- Habilita a extensão de trigrama (caso ainda não esteja ativa)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search no campo search_vector (populado por trigger no banco)
CREATE INDEX IF NOT EXISTS idx_listings_search_vector
  ON listings USING GIN (search_vector);

-- Busca parcial por marca (ex: "toy" encontra "Toyota")
CREATE INDEX IF NOT EXISTS idx_listings_brand_trgm
  ON listings USING GIN (brand gin_trgm_ops);

-- Busca parcial por modelo
CREATE INDEX IF NOT EXISTS idx_listings_model_trgm
  ON listings USING GIN (model gin_trgm_ops);
