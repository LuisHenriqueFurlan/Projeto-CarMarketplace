import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversation_id: z.uuid('Deve ser uma UUID válida'),
  sender_id: z.uuid('Deve ser uma UUID válida'),
  body: z.string().min(1, 'A mensagem não pode ser vazia'),
})

export const updateMessageStatusSchema = z.object({
  status: z.enum(['enviada', 'lida', 'arquivada']),
})

export const messageParamsSchema = z.object({
  id: z.uuid('Deve ser uma UUID válida'),
})

export const conversationMessagesParamsSchema = z.object({
  conversation_id: z.uuid('Deve ser uma UUID válida'),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>
