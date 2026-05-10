-- =============================================================================
-- Funções e Triggers — aplicar APÓS prisma migrate dev
-- Executar: psql $DATABASE_URL -f prisma/migrations/functions.sql
-- =============================================================================

-- Extensões necessárias para as funções abaixo
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- -----------------------------------------------------------------------------
-- fn_set_updated_at
-- Atualiza updated_at automaticamente antes de qualquer UPDATE.
-- Usada por: users, listings, conversations.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- -----------------------------------------------------------------------------
-- fn_update_listing_search_vector
-- Mantém search_vector atualizado para full-text search.
-- Dispara antes de INSERT ou UPDATE nos campos de busca.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_listing_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.title,       ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.brand,       ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.model,       ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.description, ''))), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listings_search_vector
  BEFORE INSERT OR UPDATE OF title, brand, model, description
  ON listings
  FOR EACH ROW EXECUTE FUNCTION fn_update_listing_search_vector();

-- -----------------------------------------------------------------------------
-- fn_sync_seller_listing_stats
-- Mantém seller_stats sincronizado com contagens de listings do vendedor.
-- Dispara após INSERT, UPDATE de status ou DELETE em listings.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sync_seller_listing_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_seller_id UUID;
BEGIN
  v_seller_id := COALESCE(NEW.seller_id, OLD.seller_id);

  INSERT INTO seller_stats (user_id, total_listings, active_listings, sold_count, updated_at)
  SELECT
    v_seller_id,
    COUNT(*)                                    AS total_listings,
    COUNT(*) FILTER (WHERE status = 'ativo')    AS active_listings,
    COUNT(*) FILTER (WHERE status = 'vendido')  AS sold_count,
    NOW()
  FROM listings
  WHERE seller_id = v_seller_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_listings  = EXCLUDED.total_listings,
    active_listings = EXCLUDED.active_listings,
    sold_count      = EXCLUDED.sold_count,
    updated_at      = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_seller_listing_stats
  AFTER INSERT OR UPDATE OF status OR DELETE
  ON listings
  FOR EACH ROW EXECUTE FUNCTION fn_sync_seller_listing_stats();

-- -----------------------------------------------------------------------------
-- fn_sync_seller_review_stats
-- Mantém avg_rating e review_count em seller_stats sincronizados com reviews.
-- Dispara após qualquer INSERT, UPDATE ou DELETE em reviews.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sync_seller_review_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_seller_id UUID;
BEGIN
  v_seller_id := COALESCE(NEW.seller_id, OLD.seller_id);

  UPDATE seller_stats
  SET
    avg_rating   = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE seller_id = v_seller_id),
    review_count = (SELECT COUNT(*)                  FROM reviews WHERE seller_id = v_seller_id),
    updated_at   = NOW()
  WHERE user_id = v_seller_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_seller_review_stats
  AFTER INSERT OR UPDATE OR DELETE
  ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_sync_seller_review_stats();

-- -----------------------------------------------------------------------------
-- fn_init_seller_stats
-- Cria uma linha em seller_stats para cada novo usuário cadastrado.
-- Garante que o vendedor já tenha stats zerados desde o registro.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_init_seller_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO seller_stats (user_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_init_seller_stats
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION fn_init_seller_stats();

-- -----------------------------------------------------------------------------
-- fn_increment_listing_views
-- Incrementa views_count de um anúncio. Chamada pela API em GET /listings/:id.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_increment_listing_views(p_listing_id UUID)
RETURNS VOID LANGUAGE sql AS $$
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = p_listing_id;
$$;

-- -----------------------------------------------------------------------------
-- fn_expire_listings
-- Marca como 'expirado' os anúncios cujo expires_at já passou.
-- Deve ser executada por um job agendado (ex: pg_cron diariamente às 03:00).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_expire_listings()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE listings
  SET status = 'expirado'
  WHERE status = 'ativo'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- -----------------------------------------------------------------------------
-- fn_renew_listing
-- Renova um anúncio por mais 90 dias. Só funciona para o dono do anúncio.
-- Retorna TRUE se renovou, FALSE se o anúncio não foi encontrado/autorizado.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_renew_listing(p_listing_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  UPDATE listings
  SET
    status     = 'ativo',
    expires_at = NOW() + INTERVAL '90 days',
    updated_at = NOW()
  WHERE id        = p_listing_id
    AND seller_id = p_user_id
    AND status IN ('ativo', 'expirado', 'pausado');

  RETURN FOUND;
END;
$$;

-- -----------------------------------------------------------------------------
-- fn_search_listings
-- Busca de anúncios com filtros e paginação. Usada em GET /listings.
-- Suporta full-text search, filtros por categoria, estado, preço, etc.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_search_listings(
  p_query        TEXT       DEFAULT NULL,
  p_category     TEXT       DEFAULT NULL,
  p_state        CHAR(2)    DEFAULT NULL,
  p_condition    TEXT       DEFAULT NULL,
  p_brand        TEXT       DEFAULT NULL,
  p_min_price    NUMERIC    DEFAULT NULL,
  p_max_price    NUMERIC    DEFAULT NULL,
  p_min_year     SMALLINT   DEFAULT NULL,
  p_max_year     SMALLINT   DEFAULT NULL,
  p_max_km       INTEGER    DEFAULT NULL,
  p_fuel         TEXT       DEFAULT NULL,
  p_transmission TEXT       DEFAULT NULL,
  p_order_by     TEXT       DEFAULT 'recente',
  p_page         INTEGER    DEFAULT 1,
  p_per_page     INTEGER    DEFAULT 20
)
RETURNS TABLE (
  id               UUID,
  title            VARCHAR(200),
  category         listing_category,
  condition        vehicle_condition,
  status           listing_status,
  brand            VARCHAR(80),
  model            VARCHAR(120),
  year_model       SMALLINT,
  color            VARCHAR(50),
  fuel             fuel_type,
  transmission     transmission_type,
  km               INTEGER,
  price            NUMERIC(12,2),
  price_negotiable BOOLEAN,
  accepts_trade    BOOLEAN,
  city             VARCHAR(100),
  state            CHAR(2),
  views_count      INTEGER,
  featured         BOOLEAN,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ,
  cover_image      TEXT,
  seller_name      VARCHAR(120),
  seller_rating    NUMERIC(3,2),
  total_count      BIGINT
) LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT
      l.*,
      li.url        AS cover_image,
      u.name        AS seller_name,
      ss.avg_rating AS seller_rating,
      CASE
        WHEN p_query IS NOT NULL
        THEN ts_rank(l.search_vector,
                     to_tsquery('portuguese', unaccent(
                       regexp_replace(trim(p_query), '\s+', ' & ', 'g')
                     )))
        ELSE 0
      END AS rank
    FROM listings l
    LEFT JOIN LATERAL (
      SELECT url FROM listing_images
      WHERE listing_id = l.id AND position = 0
      LIMIT 1
    ) li ON TRUE
    LEFT JOIN users u         ON u.id = l.seller_id
    LEFT JOIN seller_stats ss ON ss.user_id = l.seller_id
    WHERE
      l.status = 'ativo'
      AND (p_category    IS NULL OR l.category    = p_category::listing_category)
      AND (p_state       IS NULL OR l.state       = p_state)
      AND (p_condition   IS NULL OR l.condition   = p_condition::vehicle_condition)
      AND (p_brand       IS NULL OR l.brand       ILIKE '%' || p_brand || '%')
      AND (p_min_price   IS NULL OR l.price       >= p_min_price)
      AND (p_max_price   IS NULL OR l.price       <= p_max_price)
      AND (p_min_year    IS NULL OR l.year_model  >= p_min_year)
      AND (p_max_year    IS NULL OR l.year_model  <= p_max_year)
      AND (p_max_km      IS NULL OR l.km          <= p_max_km)
      AND (p_fuel        IS NULL OR l.fuel        = p_fuel::fuel_type)
      AND (p_transmission IS NULL OR l.transmission = p_transmission::transmission_type)
      AND (p_query IS NULL OR l.search_vector @@ to_tsquery('portuguese',
            unaccent(regexp_replace(trim(p_query), '\s+', ' & ', 'g'))))
  ),
  counted AS (
    SELECT *, COUNT(*) OVER () AS total_count FROM base
  )
  SELECT
    id, title, category, condition, status, brand, model,
    year_model, color, fuel, transmission, km, price,
    price_negotiable, accepts_trade, city, state,
    views_count, featured, published_at, created_at,
    cover_image, seller_name, seller_rating, total_count
  FROM counted
  ORDER BY
    CASE WHEN p_order_by = 'menor_preco' THEN price END ASC,
    CASE WHEN p_order_by = 'maior_preco' THEN price END DESC,
    CASE WHEN p_order_by = 'relevancia'  THEN rank  END DESC,
    featured DESC,
    created_at DESC
  LIMIT  p_per_page
  OFFSET (p_page - 1) * p_per_page;
$$;

-- -----------------------------------------------------------------------------
-- fn_get_listing_detail
-- Retorna o detalhe completo de um anúncio com dados do vendedor e imagens.
-- Usada em GET /listings/:id.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_listing_detail(p_listing_id UUID)
RETURNS TABLE (
  id               UUID,
  title            VARCHAR(200),
  description      TEXT,
  category         listing_category,
  condition        vehicle_condition,
  status           listing_status,
  brand            VARCHAR(80),
  model            VARCHAR(120),
  year_model       SMALLINT,
  year_manuf       SMALLINT,
  color            VARCHAR(50),
  fuel             fuel_type,
  transmission     transmission_type,
  km               INTEGER,
  doors            SMALLINT,
  engine_cc        INTEGER,
  price            NUMERIC(12,2),
  price_negotiable BOOLEAN,
  accepts_trade    BOOLEAN,
  city             VARCHAR(100),
  state            CHAR(2),
  views_count      INTEGER,
  featured         BOOLEAN,
  created_at       TIMESTAMPTZ,
  seller_id        UUID,
  seller_name      VARCHAR(120),
  seller_phone     VARCHAR(20),
  seller_avatar    TEXT,
  seller_rating    NUMERIC(3,2),
  seller_reviews   INTEGER,
  seller_since     TIMESTAMPTZ,
  seller_listings  INTEGER,
  images           JSON
) LANGUAGE sql STABLE AS $$
  SELECT
    l.id, l.title, l.description, l.category, l.condition, l.status,
    l.brand, l.model, l.year_model, l.year_manuf, l.color,
    l.fuel, l.transmission, l.km, l.doors, l.engine_cc,
    l.price, l.price_negotiable, l.accepts_trade,
    l.city, l.state, l.views_count, l.featured, l.created_at,
    u.id            AS seller_id,
    u.name          AS seller_name,
    u.phone         AS seller_phone,
    u.avatar_url    AS seller_avatar,
    ss.avg_rating   AS seller_rating,
    ss.review_count AS seller_reviews,
    u.created_at    AS seller_since,
    ss.active_listings AS seller_listings,
    (
      SELECT json_agg(
        json_build_object('id', li.id, 'url', li.url, 'position', li.position)
        ORDER BY li.position
      )
      FROM listing_images li WHERE li.listing_id = l.id
    ) AS images
  FROM listings l
  JOIN  users u        ON u.id = l.seller_id
  LEFT JOIN seller_stats ss ON ss.user_id = l.seller_id
  WHERE l.id = p_listing_id;
$$;

-- -----------------------------------------------------------------------------
-- fn_get_seller_listings
-- Retorna os anúncios de um vendedor com paginação e filtro por status.
-- Usada em GET /users/:id/listings.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_seller_listings(
  p_seller_id UUID,
  p_status    TEXT    DEFAULT NULL,
  p_page      INTEGER DEFAULT 1,
  p_per_page  INTEGER DEFAULT 20
)
RETURNS TABLE (
  id          UUID,
  title       VARCHAR(200),
  category    listing_category,
  status      listing_status,
  price       NUMERIC(12,2),
  brand       VARCHAR(80),
  model       VARCHAR(120),
  year_model  SMALLINT,
  views_count INTEGER,
  cover_image TEXT,
  created_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT
      l.id, l.title, l.category, l.status, l.price,
      l.brand, l.model, l.year_model, l.views_count, l.created_at,
      li.url AS cover_image,
      COUNT(*) OVER () AS total_count
    FROM listings l
    LEFT JOIN LATERAL (
      SELECT url FROM listing_images
      WHERE listing_id = l.id AND position = 0
      LIMIT 1
    ) li ON TRUE
    WHERE l.seller_id = p_seller_id
      AND (p_status IS NULL OR l.status = p_status::listing_status)
  )
  SELECT * FROM base
  ORDER BY created_at DESC
  LIMIT  p_per_page
  OFFSET (p_page - 1) * p_per_page;
$$;
