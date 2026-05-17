import type { FastifyInstance } from 'fastify'
import { conversationController } from './conversation.controller'

export async function conversationRoutes(app: FastifyInstance) {
  app.post('/conversations', async (request, reply) => {
    return conversationController.createConversation(request, reply)
  })

  app.get('/conversations/:id', async (request, reply) => {
    return conversationController.getConversationById(request, reply)
  })

  app.put('/conversations/:id', async (request, reply) => {
    return conversationController.updateConversation(request, reply)
  })

  app.delete('/conversations/:id', async (request, reply) => {
    return conversationController.deleteConversation(request, reply)
  })
}
