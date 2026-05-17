-- CreateEnum
CREATE TYPE "fuel_type" AS ENUM ('FLEX', 'GASOLINA', 'ETANOL', 'DIESEL', 'ELETRICO', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "transmission_type" AS ENUM ('MANUAL', 'AUTOMATICO', 'CVT', 'AUTOMATIZADO');

-- CreateEnum
CREATE TYPE "vehicle_condition" AS ENUM ('NOVO', 'SEMINOVO', 'USADO');

-- CreateEnum
CREATE TYPE "listing_status" AS ENUM ('ATIVO', 'PAUSADO', 'VENDIDO', 'EXPIRADO', 'REMOVIDO');

-- CreateEnum
CREATE TYPE "listing_category" AS ENUM ('SEDANS', 'MOTOS', 'CAMINHOES', 'VANS', 'PICKUPS', 'SUVS', 'CLASSICOS', 'OUTROS');

-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('ENVIADA', 'LIDA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "report_reason" AS ENUM ('PRECO_SUSPEITO', 'ANUNCIO_DUPLICADO', 'VEICULO_ROUBADO', 'INFORMACOES_FALSAS', 'SPAM', 'OUTRO');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "shift_type" AS ENUM ('MANUAL', 'AUTOMATICO');

-- CreateEnum
CREATE TYPE "security_components" AS ENUM ('ABS', 'DISTRIBUICAO_FRENAGEM', 'ASSISTENTE_FRENAGEM', 'CONTROLE_ESTABILIDADE', 'CONTROLE_TRACAO', 'ASSISTENTE_RAMPA', 'CRUISE_ADAPTATIVO', 'FRENAGEM_AUTONOMA', 'MONITOR_PONTO_CEGO', 'ASSISTENTE_FAIXA', 'AVISO_COLISAO_FRONTAL', 'AVISO_TRAFEGO_TRASEIRO', 'AIRBAG_FRONTAL', 'AIRBAG_LATERAL', 'AIRBAG_CORTINA', 'AIRBAG_JOELHO', 'CAMERA_RE', 'CAMERA_360', 'SENSOR_ESTACIONAMENTO', 'ESTACIONAMENTO_AUTONOMO', 'ISOFIX', 'CINTO_PRETENSIONADOR', 'IMOBILIZADOR', 'ALARME', 'ENTRADA_SEM_CHAVE', 'RASTREADOR', 'MONITOR_PRESSAO_PNEUS', 'PNEU_RUN_FLAT');

-- CreateEnum
CREATE TYPE "comfort_components" AS ENUM ('AR_CONDICIONADO', 'AR_CONDICIONADO_DIGITAL', 'AR_CONDICIONADO_DUAL_ZONE', 'AR_CONDICIONADO_TRI_ZONE', 'BANCO_AQUECIDO', 'BANCO_VENTILADO', 'BANCO_MASSAGEADOR', 'BANCO_ELETRICO', 'BANCO_MEMORIA', 'BANCO_COURO', 'VOLANTE_AQUECIDO', 'VOLANTE_MULTIMIDIA', 'VOLANTE_REGULAGEM_ELETRICA', 'TETO_SOLAR', 'TETO_PANORAMICO', 'VIDRO_ELETRICO', 'VIDRO_ELETRICO_TRASEIRO', 'RETROVISOR_ELETRICO', 'RETROVISOR_FOTOCROMATICO', 'ESPELHO_INTERNO_FOTOCROMATICO', 'CHAVE_PRESENCIAL', 'PARTIDA_BOTAO', 'PORTA_MALAS_ELETRICO', 'PORTA_MALAS_HANDS_FREE', 'CARREGADOR_WIRELESS', 'TOMADA_USB', 'TOMADA_110V', 'SISTEMA_SOM_PREMIUM', 'PAINEL_DIGITAL', 'HEAD_UP_DISPLAY', 'NAVEGACAO_GPS', 'CONTROLE_CRUZEIRO', 'PEDAL_ASSISTIDO', 'SUSPENSAO_ADAPTATIVA', 'ILUMINACAO_AMBIENTE', 'CORTINA_ELETRICA_TRASEIRA');

-- CreateEnum
CREATE TYPE "technology_components" AS ENUM ('CENTRAL_MULTIMIDIA', 'TELA_TOUCHSCREEN', 'APPLE_CARPLAY', 'ANDROID_AUTO', 'BLUETOOTH', 'WIFI_BORDO', 'ENTRADA_USB', 'ENTRADA_HDMI', 'CARREGADOR_WIRELESS', 'PAINEL_DIGITAL', 'HEAD_UP_DISPLAY', 'NAVEGACAO_GPS', 'RECONHECIMENTO_VOZ', 'ASSISTENTE_VIRTUAL', 'CAMERA_RE', 'CAMERA_360', 'SENSOR_ESTACIONAMENTO', 'PILOTO_AUTOMATICO', 'ATUALIZACAO_OTA', 'TELEMETRIA', 'CONTROLE_REMOTO_APP', 'PARTIDA_REMOTA', 'MONITORAMENTO_MOTORISTA', 'RECONHECIMENTO_FACIAL', 'RECONHECIMENTO_PLACA', 'SUSPENSAO_ADAPTATIVA', 'FAROL_ADAPTATIVO', 'FAROL_LED', 'FAROL_LASER', 'CONEXAO_4G', 'CONEXAO_5G', 'PONTO_ACESSO_WIFI', 'SISTEMA_SOM_PREMIUM', 'SUBWOOFER', 'AMPLIFICADOR', 'TELA_TRASEIRA', 'ESPELHO_RETROVISOR_CAMERA');

-- CreateEnum
CREATE TYPE "mechanic_components" AS ENUM ('MOTOR_ASPIRADO', 'MOTOR_TURBO', 'MOTOR_BITURBO', 'MOTOR_HIBRIDO', 'MOTOR_HIBRIDO_PLUG_IN', 'MOTOR_ELETRICO', 'MOTOR_FLEX', 'MOTOR_DIESEL', 'MOTOR_GNV', 'CAMBIO_MANUAL', 'CAMBIO_AUTOMATICO', 'CAMBIO_CVT', 'CAMBIO_DUPLA_EMBREAGEM', 'CAMBIO_SEMI_AUTOMATICO', 'TRACAO_DIANTEIRA', 'TRACAO_TRASEIRA', 'TRACAO_INTEGRAL', 'TRACAO_4X4', 'TRACAO_4X4_REDUCAO', 'DIRECAO_HIDRAULICA', 'DIRECAO_ELETRICA', 'DIRECAO_ELETRO_HIDRAULICA', 'SUSPENSAO_INDEPENDENTE', 'SUSPENSAO_MULTILINK', 'SUSPENSAO_MOLA', 'SUSPENSAO_AR', 'FREIO_DISCO_DIANTEIRO', 'FREIO_DISCO_TRASEIRO', 'FREIO_TAMBOR_TRASEIRO', 'DIFERENCIAL_ELETRONICO', 'DIFERENCIAL_MECANICO', 'BLOQUEIO_DIFERENCIAL', 'ESCAPE_ESPORTIVO', 'FILTRO_PARTICULAS', 'START_STOP', 'RECUPERACAO_ENERGIA', 'BATERIA_LITIO', 'CARREGAMENTO_RAPIDO', 'CARREGAMENTO_WIRELESS', 'MODO_CONDUCAO');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "cpf" CHAR(11) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "cep" CHAR(8),
    "city" VARCHAR(100),
    "state" CHAR(2),
    "avatar_url" TEXT,
    "bio" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" "listing_category" NOT NULL,
    "condition" "vehicle_condition" NOT NULL,
    "status" "listing_status" NOT NULL DEFAULT 'ATIVO',
    "brand" VARCHAR(80) NOT NULL,
    "model" VARCHAR(120) NOT NULL,
    "year_model" SMALLINT NOT NULL,
    "year_manuf" SMALLINT,
    "color" VARCHAR(50),
    "fuel" "fuel_type" NOT NULL,
    "transmission" "transmission_type" NOT NULL,
    "km" INTEGER,
    "doors" SMALLINT,
    "engine_cc" INTEGER,
    "license_plate" VARCHAR(10),
    "fipe_code" VARCHAR(20),
    "price" DECIMAL(12,2) NOT NULL,
    "price_negotiable" BOOLEAN NOT NULL DEFAULT true,
    "accepts_trade" BOOLEAN NOT NULL DEFAULT false,
    "city" VARCHAR(100) NOT NULL,
    "state" CHAR(2) NOT NULL,
    "cep" CHAR(8),
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "popular_name" VARCHAR(20),
    "plate" VARCHAR(7) NOT NULL,
    "bullet_proof" BOOLEAN NOT NULL DEFAULT false,
    "auction" BOOLEAN NOT NULL DEFAULT false,
    "observation" VARCHAR,
    "security_components" "security_components"[],
    "comfort_components" "comfort_components"[],
    "technology_components" "technology_components"[],
    "mechanic_components" "mechanic_components"[],
    "search_vector" tsvector
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "position" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","listing_id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "status" "message_status" NOT NULL DEFAULT 'ENVIADA',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "seller_stats" (
    "user_id" UUID NOT NULL,
    "total_listings" INTEGER NOT NULL DEFAULT 0,
    "active_listings" INTEGER NOT NULL DEFAULT 0,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_stats_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "listing_id" UUID,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "reason" "report_reason" NOT NULL,
    "details" TEXT,
    "status" "report_status" NOT NULL DEFAULT 'PENDENTE',
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "listing_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "parent_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "idx_users_state" ON "users"("state");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_cpf" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "idx_users_is_active" ON "users"("is_active") WHERE (is_active = TRUE);

-- CreateIndex
CREATE UNIQUE INDEX "listings_id_key" ON "listings"("id");

-- CreateIndex
CREATE INDEX "idx_listings_created_at" ON "listings"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_listings_seller_id" ON "listings"("seller_id");

-- CreateIndex
CREATE INDEX "idx_listings_status" ON "listings"("status");

-- CreateIndex
CREATE INDEX "idx_listings_category" ON "listings"("category");

-- CreateIndex
CREATE INDEX "idx_listings_state" ON "listings"("state");

-- CreateIndex
CREATE INDEX "idx_listings_price" ON "listings"("price");

-- CreateIndex
CREATE INDEX "idx_listings_year_model" ON "listings"("year_model");

-- CreateIndex
CREATE INDEX "idx_listings_brand" ON "listings"("brand");

-- CreateIndex
CREATE INDEX "idx_listing_popular_name" ON "listings"("popular_name");

-- CreateIndex
CREATE INDEX "idx_listing_plate" ON "listings"("plate");

-- CreateIndex
CREATE INDEX "idx_listings_featured" ON "listings"("featured", "featured_until") WHERE (featured = TRUE);

-- CreateIndex
CREATE INDEX "idx_listings_expires_at" ON "listings"("expires_at") WHERE (status = 'ATIVO');

-- CreateIndex
CREATE INDEX "idx_listings_browse" ON "listings"("state", "category", "status", "price") WHERE (status = 'ATIVO');

-- CreateIndex
CREATE UNIQUE INDEX "listing_images_id_key" ON "listing_images"("id");

-- CreateIndex
CREATE INDEX "idx_listing_images_listing_id" ON "listing_images"("listing_id", "position");

-- CreateIndex
CREATE INDEX "idx_favorites_user_id" ON "favorites"("user_id");

-- CreateIndex
CREATE INDEX "idx_favorites_listing_id" ON "favorites"("listing_id");

-- CreateIndex
CREATE INDEX "idx_conversations_buyer_id" ON "conversations"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_conversations_seller_id" ON "conversations"("seller_id");

-- CreateIndex
CREATE INDEX "idx_conversations_listing" ON "conversations"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_id_key" ON "messages"("id");

-- CreateIndex
CREATE INDEX "idx_messages_conversation_id" ON "messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_messages_sender_id" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_messages_status" ON "messages"("status") WHERE (status = 'ENVIADA');

-- CreateIndex
CREATE UNIQUE INDEX "reviews_id_key" ON "reviews"("id");

-- CreateIndex
CREATE INDEX "idx_reviews_seller_id" ON "reviews"("seller_id");

-- CreateIndex
CREATE INDEX "idx_reviews_reviewer_id" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_listing_id_reviewer_id_key" ON "reviews"("listing_id", "reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_id_key" ON "reports"("id");

-- CreateIndex
CREATE INDEX "idx_reports_listing_id" ON "reports"("listing_id");

-- CreateIndex
CREATE INDEX "idx_reports_status" ON "reports"("status") WHERE (status = 'PENDENTE');

-- CreateIndex
CREATE UNIQUE INDEX "reports_listing_id_reporter_id_key" ON "reports"("listing_id", "reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_comments_id_key" ON "listing_comments"("id");

-- CreateIndex
CREATE INDEX "idx_listing_comments_listing_id" ON "listing_comments"("listing_id");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_stats" ADD CONSTRAINT "seller_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_comments" ADD CONSTRAINT "listing_comments_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_comments" ADD CONSTRAINT "listing_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_comments" ADD CONSTRAINT "listing_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "listing_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
