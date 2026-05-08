import { z } from 'zod'

export const createListingImagesSchema = z.object({
  listing_id: z.uuid('ID de lista inválido'),
  url: z.string('A url deve ser uma string válida').url(),
  position: z.number(),
})

export const listingImagesParamsSchema = z.object({
  id: z.uuid('formato de id invalido'),
})

export const updateListingImagesSchema = z.object({
  url: z.string('A url deve ser uma string valida').url(),
  position: z.number(),
})

export type CreateListingImagesInput = z.infer<typeof createListingImagesSchema>
export type UpdateListingImagesInput = z.infer<typeof updateListingImagesSchema>
