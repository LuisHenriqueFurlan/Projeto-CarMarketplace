import { z } from 'zod'

export const CreateReviewSchema = z.object({
  seller_id: z.string().uuid('Deve ser uma UUID válida'),
  reviewer_id: z.string().uuid('Deve ser uma UUID válida'),
  listing_id: z.string().uuid('Deve ser uma UUID válida').optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
})

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>
