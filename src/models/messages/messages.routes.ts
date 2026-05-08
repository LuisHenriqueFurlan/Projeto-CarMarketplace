import type { FastifyInstance } from 'fastify'
import { messageController } from './messages.controller'

export async function messagesRoutes(app: FastifyInstance) {
  app.post('/messages', (request, reply) =>
    messageController.sendMessage(request, reply)
  )

  app.get('/messages/conversation/:conversation_id', (request, reply) =>
    messageController.getConversationMessages(request, reply)
  )

  app.get('/messages/:id', (request, reply) =>
    messageController.getMessageById(request, reply)
  )

  app.patch('/messages/:id/status', (request, reply) =>
    messageController.updateStatus(request, reply)
  )

  app.delete('/messages/:id', (request, reply) =>
    messageController.deleteMessage(request, reply)
  )
}
