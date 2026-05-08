-- =============================================================================
-- AutoFácil - Schema do Banco de Dados (PostgreSQL)
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- busca por similaridade de texto

-- =============================================================================
-- TIPOS ENUMERADOS
-- =============================================================================

CREATE TYPE fuel_type AS ENUM (
  'flex',
  'gasolina',
  'etanol',
  'diesel',
  'eletrico',
  'hibrido'
);

CREATE TYPE transmission_type AS ENUM (
  'manual',
  'automatico',
  'cvt',
  'automatizado'
);

CREATE TYPE vehicle_condition AS ENUM (
  'novo',
  'seminovo',
  'usado'
);

CREATE TYPE listing_status AS ENUM (
  'ativo',
  'pausado',
  'vendido',
  'expirado',
  'removido'
);

CREATE TYPE listing_category AS ENUM (
  'sedans',
  'motos',
  'caminhoes',
  'vans',
  'pickups',
  'suvs',
  'classicos',
  'outros'
);

CREATE TYPE message_status AS ENUM (
  'enviada',
  'lida',
  'arquivada'
);

CREATE TYPE report_reason AS ENUM (
  'preco_suspeito',
  'anuncio_duplicado',
  'veiculo_roubado',
  'informacoes_falsas',
  'spam',
  'outro'
);

CREATE TYPE report_status AS ENUM (
  'pendente',
  'em_analise',
  'resolvido',
  'descartado'
);

-- =============================================================================
-- TABELA: users
-- Armazena contas de usuários (compradores e vendedores)
-- =============================================================================

CREATE TABLE users (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120)  NOT NULL,
  email           VARCHAR(255)  NOT NULL,
  password_hash   TEXT          NOT NULL,
  cpf             CHAR(11)      NOT NULL,                 -- somente dígitos
  phone           VARCHAR(20),
  cep             CHAR(8),                                -- somente dígitos
  city            VARCHAR(100),
  state           CHAR(2),
  avatar_url      TEXT,
  bio             TEXT,
  is_verified     BOOLEAN       NOT NULL DEFAULT FALSE,   -- e-mail verificado
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  refresh_token   TEXT,                                   -- JWT refresh token
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_cpf_unique   UNIQUE (cpf),
  CONSTRAINT users_cpf_format   CHECK  (cpf ~ '^\d{11}$'),
  CONSTRAINT users_cep_format   CHECK  (cep IS NULL OR cep ~ '^\d{8}$'),
  CONSTRAINT users_state_format CHECK  (state IS NULL OR state ~ '^[A-Z]{2}$')
);

-- =============================================================================
-- TABELA: listings
-- Anúncios de veículos
-- =============================================================================

CREATE TABLE listings (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200)      NOT NULL,
  description     TEXT,
  category        listing_category  NOT NULL,
  condition       vehicle_condition NOT NULL,
  status          listing_status    NOT NULL DEFAULT 'ativo',

  -- Dados do veículo
  brand           VARCHAR(80)       NOT NULL,
  model           VARCHAR(120)      NOT NULL,
  year_model      SMALLINT          NOT NULL,
  year_manuf      SMALLINT,
  color           VARCHAR(50),
  fuel            fuel_type         NOT NULL,
  transmission    transmission_type NOT NULL,
  km              INTEGER           CHECK (km >= 0),
  doors           SMALLINT          CHECK (doors BETWEEN 2 AND 5),
  engine_cc       INTEGER,          -- cilindradas (null para elétricos)
  license_plate   VARCHAR(10),      -- placa parcial ou completa
  fipe_code       VARCHAR(20),

  -- Preço
  price           NUMERIC(12, 2)    NOT NULL CHECK (price >= 0),
  price_negotiable BOOLEAN          NOT NULL DEFAULT TRUE,
  accepts_trade   BOOLEAN           NOT NULL DEFAULT FALSE,

  -- Localização
  city            VARCHAR(100)      NOT NULL,
  state           CHAR(2)           NOT NULL,
  cep             CHAR(8),

  -- Metadados
  views_count     INTEGER           NOT NULL DEFAULT 0,
  featured        BOOLEAN           NOT NULL DEFAULT FALSE,
  featured_until  TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ       NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  -- Vetor de busca full-text (atualizado por trigger)
  search_vector   TSVECTOR,

  CONSTRAINT listings_year_model_range CHECK (year_model BETWEEN 1900 AND EXTRACT(YEAR FROM NOW()) + 1),
  CONSTRAINT listings_state_format     CHECK (state ~ '^[A-Z]{2}$'),
  CONSTRAINT listings_cep_format       CHECK (cep IS NULL OR cep ~ '^\d{8}$'),
  CONSTRAINT listings_featured_expiry  CHECK (featured = FALSE OR featured_until IS NOT NULL)
);

-- =============================================================================
-- TABELA: listing_images
-- Imagens dos anúncios (1 anúncio → N imagens)
-- =============================================================================

CREATE TABLE listing_images (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  position    SMALLINT    NOT NULL DEFAULT 0,   -- 0 = capa
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT listing_images_position_unique UNIQUE (listing_id, position)
);

-- =============================================================================
-- TABELA: favorites
-- Anúncios salvos por usuários
-- =============================================================================

CREATE TABLE favorites (
  user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, listing_id)
);

-- =============================================================================
-- TABELA: conversations
-- Conversa entre comprador e vendedor sobre um anúncio
-- =============================================================================

CREATE TABLE conversations (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  seller_id   UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  is_archived BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT conversations_unique UNIQUE (listing_id, buyer_id),
  CONSTRAINT conversations_no_self_chat CHECK (buyer_id <> seller_id)
);

-- =============================================================================
-- TABELA: messages
-- Mensagens dentro de uma conversa
-- =============================================================================

CREATE TABLE messages (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID            NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID            NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  body            TEXT            NOT NULL,
  status          message_status  NOT NULL DEFAULT 'enviada',
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABELA: reviews
-- Avaliações de vendedores feitas após uma negociação
-- =============================================================================

CREATE TABLE reviews (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  reviewer_id UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  listing_id  UUID        REFERENCES listings(id)          ON DELETE SET NULL,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMES TAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT reviews_unique_per_listing UNIQUE (listing_id, reviewer_id),
  CONSTRAINT reviews_no_self_review     CHECK  (seller_id <> reviewer_id)
);

-- =============================================================================
-- TABELA: seller_stats (view materializada — atualizada por trigger)
-- Cache de estatísticas do vendedor para evitar agregações frequentes
-- =============================================================================

CREATE TABLE seller_stats (
  user_id         UUID          PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_listings  INTEGER       NOT NULL DEFAULT 0,
  active_listings INTEGER       NOT NULL DEFAULT 0,
  sold_count      INTEGER       NOT NULL DEFAULT 0,
  avg_rating      NUMERIC(3, 2),
  review_count    INTEGER       NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABELA: reports
-- Denúncias de anúncios suspeitos/irregulares
-- =============================================================================

CREATE TABLE reports (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID          NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id UUID          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  reason      report_reason NOT NULL,
  details     TEXT,
  status      report_status NOT NULL DEFAULT 'pendente',
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT reports_unique_per_user UNIQUE (listing_id, reporter_id)
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- users
CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_cpf        ON users (cpf);
CREATE INDEX idx_users_state      ON users (state);
CREATE INDEX idx_users_is_active  ON users (is_active) WHERE is_active = TRUE;

-- listings — filtros mais comuns da página /anuncios
CREATE INDEX idx_listings_seller_id  ON listings (seller_id);
CREATE INDEX idx_listings_status     ON listings (status);
CREATE INDEX idx_listings_category   ON listings (category);
CREATE INDEX idx_listings_state      ON listings (state);
CREATE INDEX idx_listings_price      ON listings (price);
CREATE INDEX idx_listings_year_model ON listings (year_model);
CREATE INDEX idx_listings_brand      ON listings (brand);
CREATE INDEX idx_listings_condition  ON listings (condition);
CREATE INDEX idx_listings_featured   ON listings (featured, featured_until) WHERE featured = TRUE;
CREATE INDEX idx_listings_created_at ON listings (created_at DESC);
CREATE INDEX idx_listings_expires_at ON listings (expires_at) WHERE status = 'ativo';

-- Índice composto para o filtro principal (estado + categoria + status + preço)
CREATE INDEX idx_listings_browse ON listings (state, category, status, price)
  WHERE status = 'ativo';

-- Full-text search
CREATE INDEX idx_listings_search_vector ON listings USING GIN (search_vector);

-- Índice trigrama para busca parcial em brand e model
CREATE INDEX idx_listings_brand_trgm ON listings USING GIN (brand gin_trgm_ops);
CREATE INDEX idx_listings_model_trgm ON listings USING GIN (model gin_trgm_ops);

-- listing_images
CREATE INDEX idx_listing_images_listing_id ON listing_images (listing_id, position);

-- favorites
CREATE INDEX idx_favorites_user_id    ON favorites (user_id);
CREATE INDEX idx_favorites_listing_id ON favorites (listing_id);

-- conversations
CREATE INDEX idx_conversations_buyer_id  ON conversations (buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations (seller_id);
CREATE INDEX idx_conversations_listing   ON conversations (listing_id);

-- messages
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id       ON messages (sender_id);
CREATE INDEX idx_messages_status          ON messages (status) WHERE status = 'enviada';

-- reviews
CREATE INDEX idx_reviews_seller_id   ON reviews (seller_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews (reviewer_id);

-- reports
CREATE INDEX idx_reports_listing_id ON reports (listing_id);
CREATE INDEX idx_reports_status     ON reports (status) WHERE status = 'pendente';

-- =============================================================================
-- FUNÇÕES E TRIGGERS
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Função utilitária: atualiza coluna updated_at automaticamente
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Função: atualiza o vetor de busca full-text de um anúncio
-- Chamada via trigger sempre que title, description, brand ou model mudam
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Função: mantém seller_stats sincronizado com listings
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Função: mantém seller_stats sincronizado com reviews (rating médio)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Função: incrementa views_count de forma eficiente (sem UPDATE por row lock)
-- Chamada pela API em GET /listings/:id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_increment_listing_views(p_listing_id UUID)
RETURNS VOID LANGUAGE sql AS $$
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = p_listing_id;
$$;

-- ----------------------------------------------------------------------------
-- Função: busca de anúncios com filtros (usada na rota GET /listings)
-- Retorna resultados paginados
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_search_listings(
  p_query       TEXT       DEFAULT NULL,  -- texto livre
  p_category    TEXT       DEFAULT NULL,
  p_state       CHAR(2)    DEFAULT NULL,
  p_condition   TEXT       DEFAULT NULL,
  p_brand       TEXT       DEFAULT NULL,
  p_min_price   NUMERIC    DEFAULT NULL,
  p_max_price   NUMERIC    DEFAULT NULL,
  p_min_year    SMALLINT   DEFAULT NULL,
  p_max_year    SMALLINT   DEFAULT NULL,
  p_max_km      INTEGER    DEFAULT NULL,
  p_fuel        TEXT       DEFAULT NULL,
  p_transmission TEXT      DEFAULT NULL,
  p_order_by    TEXT       DEFAULT 'recente',  -- recente | menor_preco | maior_preco | relevancia
  p_page        INTEGER    DEFAULT 1,
  p_per_page    INTEGER    DEFAULT 20
)
RETURNS TABLE (
  id              UUID,
  title           VARCHAR(200),
  category        listing_category,
  condition       vehicle_condition,
  status          listing_status,
  brand           VARCHAR(80),
  model           VARCHAR(120),
  year_model      SMALLINT,
  color           VARCHAR(50),
  fuel            fuel_type,
  transmission    transmission_type,
  km              INTEGER,
  price           NUMERIC(12,2),
  price_negotiable BOOLEAN,
  accepts_trade   BOOLEAN,
  city            VARCHAR(100),
  state           CHAR(2),
  views_count     INTEGER,
  featured        BOOLEAN,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ,
  cover_image     TEXT,         -- URL da imagem de capa (position = 0)
  seller_name     VARCHAR(120),
  seller_rating   NUMERIC(3,2),
  total_count     BIGINT        -- total de resultados (para paginação)
) LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT
      l.*,
      li.url                          AS cover_image,
      u.name                          AS seller_name,
      ss.avg_rating                   AS seller_rating,
      CASE
        WHEN p_query IS NOT NULL
        THEN ts_rank(l.search_vector,
                     to_tsquery('portuguese', unaccent(
                       regexp_replace(trim(p_query), '\s+', ' & ', 'g')
                     )))
        ELSE 0
      END                             AS rank
    FROM listings l
    LEFT JOIN LATERAL (
      SELECT url FROM listing_images
      WHERE listing_id = l.id AND position = 0
      LIMIT 1
    ) li ON TRUE
    LEFT JOIN users u        ON u.id = l.seller_id
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
    CASE WHEN p_order_by = 'menor_preco'  THEN price       END ASC,
    CASE WHEN p_order_by = 'maior_preco'  THEN price       END DESC,
    CASE WHEN p_order_by = 'relevancia'   THEN rank        END DESC,
    featured DESC,
    created_at DESC
  LIMIT  p_per_page
  OFFSET (p_page - 1) * p_per_page;
$$;

-- ----------------------------------------------------------------------------
-- Função: retorna detalhe completo de um anúncio (GET /listings/:id)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_listing_detail(p_listing_id UUID)
RETURNS TABLE (
  -- listing
  id              UUID,
  title           VARCHAR(200),
  description     TEXT,
  category        listing_category,
  condition       vehicle_condition,
  status          listing_status,
  brand           VARCHAR(80),
  model           VARCHAR(120),
  year_model      SMALLINT,
  year_manuf      SMALLINT,
  color           VARCHAR(50),
  fuel            fuel_type,
  transmission    transmission_type,
  km              INTEGER,
  doors           SMALLINT,
  engine_cc       INTEGER,
  price           NUMERIC(12,2),
  price_negotiable BOOLEAN,
  accepts_trade   BOOLEAN,
  city            VARCHAR(100),
  state           CHAR(2),
  views_count     INTEGER,
  featured        BOOLEAN,
  created_at      TIMESTAMPTZ,
  -- seller
  seller_id       UUID,
  seller_name     VARCHAR(120),
  seller_phone    VARCHAR(20),
  seller_avatar   TEXT,
  seller_rating   NUMERIC(3,2),
  seller_reviews  INTEGER,
  seller_since    TIMESTAMPTZ,
  seller_listings INTEGER,
  -- imagens (array JSON)
  images          JSON
) LANGUAGE sql STABLE AS $$
  SELECT
    l.id, l.title, l.description, l.category, l.condition, l.status,
    l.brand, l.model, l.year_model, l.year_manuf, l.color,
    l.fuel, l.transmission, l.km, l.doors, l.engine_cc,
    l.price, l.price_negotiable, l.accepts_trade,
    l.city, l.state, l.views_count, l.featured, l.created_at,
    -- seller
    u.id          AS seller_id,
    u.name        AS seller_name,
    u.phone       AS seller_phone,
    u.avatar_url  AS seller_avatar,
    ss.avg_rating AS seller_rating,
    ss.review_count AS seller_reviews,
    u.created_at  AS seller_since,
    ss.active_listings AS seller_listings,
    -- imagens como JSON array
    (
      SELECT json_agg(json_build_object('id', li.id, 'url', li.url, 'position', li.position)
             ORDER BY li.position)
      FROM listing_images li WHERE li.listing_id = l.id
    ) AS images
  FROM listings l
  JOIN users u        ON u.id = l.seller_id
  LEFT JOIN seller_stats ss ON ss.user_id = l.seller_id
  WHERE l.id = p_listing_id;
$$;

-- ----------------------------------------------------------------------------
-- Função: expira anúncios cujo expires_at já passou
-- Executar via pg_cron ou job agendado (ex: diariamente às 03:00)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Função: renova um anúncio por mais 90 dias (PUT /listings/:id/renew)
-- Só pode ser chamada pelo dono do anúncio
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Função: retorna anúncios de um vendedor com contagens por status
-- (usada em GET /users/:id/listings)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_seller_listings(
  p_seller_id UUID,
  p_status    TEXT    DEFAULT NULL,
  p_page      INTEGER DEFAULT 1,
  p_per_page  INTEGER DEFAULT 20
)
RETURNS TABLE (
  id           UUID,
  title        VARCHAR(200),
  category     listing_category,
  status       listing_status,
  price        NUMERIC(12,2),
  brand        VARCHAR(80),
  model        VARCHAR(120),
  year_model   SMALLINT,
  views_count  INTEGER,
  cover_image  TEXT,
  created_at   TIMESTAMPTZ,
  total_count  BIGINT
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

-- =============================================================================
-- DADOS INICIAIS (seed)
-- =============================================================================

-- Garante que seller_stats exista para todo usuário novo
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

-- =============================================================================
-- COMENTÁRIOS NAS TABELAS (documentação inline)
-- =============================================================================

COMMENT ON TABLE users            IS 'Contas de usuários (compradores e vendedores)';
COMMENT ON TABLE listings         IS 'Anúncios de veículos';
COMMENT ON TABLE listing_images   IS 'Imagens de um anúncio (position=0 é a capa)';
COMMENT ON TABLE favorites        IS 'Anúncios salvos/favoritados por usuários';
COMMENT ON TABLE conversations    IS 'Conversa entre comprador e vendedor sobre um anúncio';
COMMENT ON TABLE messages         IS 'Mensagens dentro de uma conversa';
COMMENT ON TABLE reviews          IS 'Avaliações de vendedores';
COMMENT ON TABLE seller_stats     IS 'Cache de estatísticas do vendedor (atualizado por trigger)';
COMMENT ON TABLE reports          IS 'Denúncias de anúncios suspeitos';

COMMENT ON COLUMN listings.search_vector   IS 'Vetor full-text — atualizado automaticamente por trigger';
COMMENT ON COLUMN listings.fipe_code       IS 'Código FIPE para referência de preço de mercado';
COMMENT ON COLUMN listings.featured_until  IS 'Data de expiração do destaque (featured=TRUE)';
COMMENT ON COLUMN users.cpf               IS 'CPF do usuário, somente dígitos (11 chars)';
COMMENT ON COLUMN users.refresh_token     IS 'JWT refresh token armazenado para invalidação segura';
