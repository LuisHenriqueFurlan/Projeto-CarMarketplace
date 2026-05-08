import { z } from 'zod'

export const addFavoriteSchema = z.object({
  user_id: z.uuid('Deve ser uma UUID válida'),
  listing_id: z.uuid('Deve ser uma UUID válida'),
})

export const favoriteParamsSchema = z.object({
  user_id: z.uuid('Deve ser uma UUID válida'),
  listing_id: z.uuid('Deve ser uma UUID válida'),
})

export const userParamsSchema = z.object({
  user_id: z.uuid('Deve ser uma UUID válida'),
})

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>
