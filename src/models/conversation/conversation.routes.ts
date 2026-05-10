import type { FastifyInstance } from 'fastify'
import { conversationController } from './conversation.controller'

export async function conversationRoutes(app: FastifyInstance) {
  // Criar usuário
  app.post('/users', async (request, reply) => {
    return conversationController.createConversation(request, reply)
  })

  // Obter usuário por ID
  app.get('/users/:id', async (request, reply) => {
    return conversationController.getConversationById(request, reply)
  })

  // Atualizar usuário
  app.put('/users/:id', async (request, reply) => {
    return conversationController.updateConversation(request, reply)
  })

  // Deletar usuário
  app.delete('/users/:id', async (request, reply) => {
    return conversationController.deleteConversation(request, reply)
  })
}
