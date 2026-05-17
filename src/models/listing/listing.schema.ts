import { z } from 'zod'

import {
  comfort_components,
  fuel_type,
  listing_category,
  listing_status,
  mechanic_components,
  security_components,
  technology_components,
  transmission_type,
  vehicle_condition,
} from '../../../generated/prisma/enums'

const vals = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]]

export const createListingSchema = z.object({
  seller_id: z.uuid('UUID inválido'),
  title: z.string().max(200, 'O titulo não deve passar de 200 caracteres'),
  category: z.enum(vals(listing_category)),
  price: z.number(),
  condition: z.enum(vals(vehicle_condition)),
  year_model: z.number(),
  year_manuf: z.number().optional(),
  brand: z.string().max(80, 'O nome da marca não pode passar de 80 caracteres'),
  model: z
    .string()
    .max(120, 'O nome do modelo não pode passar de 120 caracteres'),
  description: z.string().optional(),
  status: z.enum(vals(listing_status)).default(listing_status.ATIVO),
  color: z
    .string()
    .max(50, 'A cor não deve passar de 50 caracteres')
    .optional(),
  fuel: z.enum(vals(fuel_type)),
  transmission: z.enum(vals(transmission_type)),
  km: z.number().optional(),
  doors: z.number().optional(),
  engine_cc: z.number().optional(),
  license_plate: z
    .string()
    .max(10, 'A numeração da placa não deve passar de 10 caracteres')
    .optional(),
  fipe_code: z
    .string()
    .max(20, 'O código da FIPE não deve passar de 20 caracteres')
    .optional(),
  price_negotiable: z.boolean().default(true),
  accepts_trade: z.boolean().default(false),
  city: z
    .string()
    .max(100, 'O nome da cidade não deve passar de 100 caracteres'),
  state: z.string().length(2, 'A UF deve ter exatamente 2 caracteres'),
  cep: z.string().length(8, 'CEP inválido').optional(),
  featured: z.boolean().default(false),
  featured_until: z.date().optional(),
  expires_at: z.date().optional(),
  published_at: z.date().optional(),
  featured_amount: z.number().min(0).default(0),
  popular_name: z.string().max(20).optional(),
  plate: z.string().max(7),
  bullet_proof: z.boolean().default(false),
  auction: z.boolean().default(false),
  security_components: z.array(z.nativeEnum(security_components)),
  comfort_components: z.array(z.nativeEnum(comfort_components)),
  technology_components: z.array(z.nativeEnum(technology_components)),
  mechanic_components: z.array(z.nativeEnum(mechanic_components)),
})

export const listingParamsSchema = z.object({
  id: z.uuid('o ID deve ser um UUID válido'),
})

export const updateListingSchema = z.object({
  title: z
    .string()
    .max(200, 'O titulo não deve passar de 200 caracteres')
    .optional(),
  category: z.enum(vals(listing_category)).optional(),
  price: z.number().optional(),
  condition: z.enum(vals(vehicle_condition)).optional(),
  year_model: z.number().optional(),
  year_manuf: z.number().optional(),
  brand: z
    .string()
    .max(80, 'O nome da marca não pode passar de 80 caracteres')
    .optional(),
  model: z
    .string()
    .max(120, 'O nome do modelo não pode passar de 120 caracteres')
    .optional(),
  description: z.string().optional(),
  status: z.enum(vals(listing_status)).optional(),
  color: z
    .string()
    .max(50, 'A cor não deve passar de 50 caracteres')
    .optional(),
  fuel: z.enum(vals(fuel_type)).optional(),
  transmission: z.enum(vals(transmission_type)).optional(),
  km: z.number().optional(),
  doors: z.number().optional(),
  engine_cc: z.number().optional(),
  license_plate: z
    .string()
    .max(10, 'A numeração da placa não deve passar de 10 caracteres')
    .optional(),
  fipe_code: z
    .string()
    .max(20, 'O código da FIPE não deve passar de 20 caracteres')
    .optional(),
  price_negotiable: z.boolean().optional(),
  accepts_trade: z.boolean().optional(),
  city: z
    .string()
    .max(100, 'O nome da cidade não deve passar de 100 caracteres')
    .optional(),
  state: z
    .string()
    .length(2, 'A UF deve ter exatamente 2 caracteres')
    .optional(),
  cep: z.string().length(8, 'CEP inválido').optional(),
  featured: z.boolean().optional(),
  featured_until: z.date().optional(),
  featured_amount: z.number().min(0).optional(),
  expires_at: z.date().optional(),
  published_at: z.date().optional(),
  popular_name: z.string().max(20).optional(),
  plate: z.string().max(7).optional(),
  bullet_proof: z.boolean().default(false).optional(),
  auction: z.boolean().default(false).optional(),
  security_components: z.array(z.enum(vals(security_components))).optional(),
  comfort_components: z.array(z.enum(vals(comfort_components))).optional(),
  technology_components: z.array(z.enum(vals(technology_components))).optional(),
  mechanic_components: z.array(z.enum(vals(mechanic_components))).optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
