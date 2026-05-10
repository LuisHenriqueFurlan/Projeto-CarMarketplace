import { z } from 'zod'

export const createListingSchema = z.object({
  seller_id: z.uuid('UUID inválido'),
  title: z.string().max(200, 'O titulo não deve passar de 200 caracteres'),
  category: z.enum(['sedans', 'motos', 'caminhoes', 'vans', 'pickups', 'suvs', 'classicos', 'outros']),
  price: z.number(),
  condition: z.enum(['novo', 'seminovo', 'usado']),
  year_model: z.number(),
  year_manuf: z.number().optional(),
  brand: z.string().max(80, 'O nome da marca não pode passar de 80 caracteres'),
  model: z.string().max(120, 'O nome do modelo não pode passar de 120 caracteres'),
  description: z.string().optional(),
  status: z.enum(['ativo', 'pausado', 'vendido', 'expirado', 'removido']).default('ativo'),
  color: z.string().max(50, 'A cor não deve passar de 50 caracteres').optional(),
  fuel: z.enum(['flex', 'gasolina', 'etanol', 'diesel', 'eletrico', 'hibrido']),
  transmission: z.enum(['manual', 'automatico', 'cvt', 'automatizado']),
  km: z.number().optional(),
  doors: z.number().optional(),
  engine_cc: z.number().optional(),
  license_plate: z.string().max(10, 'A numeração da placa não deve passar de 10 caracteres').optional(),
  fipe_code: z.string().max(20, 'O código da FIPE não deve passar de 20 caracteres').optional(),
  price_negotiable: z.boolean().default(true),
  accepts_trade: z.boolean().default(false),
  city: z.string().max(100, 'O nome da cidade não deve passar de 100 caracteres'),
  state: z.string().length(2, 'A UF deve ter exatamente 2 caracteres'),
  cep: z.string().length(8, 'CEP inválido').optional(),
  featured: z.boolean().default(false),
  featured_until: z.date().optional(),
  expires_at: z.date().optional(),
  published_at: z.date().optional(),
})

export const listingParamsSchema = z.object({
  id: z.uuid('o ID deve ser um UUID válido'),
})

export const updateListingSchema = z.object({
  title: z.string().max(200, 'O titulo não deve passar de 200 caracteres').optional(),
  category: z.enum(['sedans', 'motos', 'caminhoes', 'vans', 'pickups', 'suvs', 'classicos', 'outros']).optional(),
  price: z.number().optional(),
  condition: z.enum(['novo', 'seminovo', 'usado']).optional(),
  year_model: z.number().optional(),
  year_manuf: z.number().optional(),
  brand: z.string().max(80, 'O nome da marca não pode passar de 80 caracteres').optional(),
  model: z.string().max(120, 'O nome do modelo não pode passar de 120 caracteres').optional(),
  description: z.string().optional(),
  status: z.enum(['ativo', 'pausado', 'vendido', 'expirado', 'removido']).optional(),
  color: z.string().max(50, 'A cor não deve passar de 50 caracteres').optional(),
  fuel: z.enum(['flex', 'gasolina', 'etanol', 'diesel', 'eletrico', 'hibrido']).optional(),
  transmission: z.enum(['manual', 'automatico', 'cvt', 'automatizado']).optional(),
  km: z.number().optional(),
  doors: z.number().optional(),
  engine_cc: z.number().optional(),
  license_plate: z.string().max(10, 'A numeração da placa não deve passar de 10 caracteres').optional(),
  fipe_code: z.string().max(20, 'O código da FIPE não deve passar de 20 caracteres').optional(),
  price_negotiable: z.boolean().optional(),
  accepts_trade: z.boolean().optional(),
  city: z.string().max(100, 'O nome da cidade não deve passar de 100 caracteres').optional(),
  state: z.string().length(2, 'A UF deve ter exatamente 2 caracteres').optional(),
  cep: z.string().length(8, 'CEP inválido').optional(),
  featured: z.boolean().optional(),
  featured_until: z.date().optional(),
  expires_at: z.date().optional(),
  published_at: z.date().optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
