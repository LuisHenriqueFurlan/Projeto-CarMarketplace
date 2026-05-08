import { z } from 'zod'

export const CreateSellerStatsSchema = z.object({
  user_id: z.uuid('Deve ser uma UUID válida'),
  total_listing: z.number('deve ser enviado um número no campo').default(0),
  active_listing: z.number('deve ser enviado um número no campo').default(0),
  sold_count: z.number('deve ser enviado um número no campo').default(0),
  avg_rating: z.number().min(0).max(9.99).multipleOf(0.01).optional(),
  review_count: z.number('deve ser enviado um número no campo').default(0),
})

export const UpdateSellerStatsSchema = z.object({
  total_listing: z
    .number('deve ser enviado um número no campo')
    .default(0)
    .optional(),
  active_listing: z
    .number('deve ser enviado um número no campo')
    .default(0)
    .optional(),
  sold_count: z
    .number('deve ser enviado um número no campo')
    .default(0)
    .optional(),
  avg_rating: z.number().min(0).max(9.99).multipleOf(0.01).optional(),
  review_count: z
    .number('deve ser enviado um número no campo')
    .default(0)
    .optional(),
})

export type CreateSellerStatsInput = z.infer<typeof CreateSellerStatsSchema>
export type UpdateSellerStatsInput = z.infer<typeof UpdateSellerStatsSchema>
