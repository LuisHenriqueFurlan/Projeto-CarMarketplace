import { z } from 'zod'

export const CreateConversationSchema = z.object({
  listing_id: z.uuid('Deve ser uma UUID válida'),
  buyer_id: z.uuid('Deve ser uma UUID válida'),
  seller_id: z.uuid('Deve ser uma UUID válida'),
  is_archived: z.boolean().default(false),
})

export const UpdateConversationSchema = z.object({
  is_archived: z.boolean().default(false).optional(),
})

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>
export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>
