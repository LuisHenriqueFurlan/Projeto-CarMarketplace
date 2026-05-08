import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  conversationService,
  type CreateConversationSchemaDTO,
  type UpdateConversationSchemaDTO,
} from './conversation.service'

export class ConversationController {
  async createConversation(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateConversationSchemaDTO

    const conversation = await conversationService.createConversation(data)

    return reply.status(201).send({
      success: true,
      message: 'Conversa criada com sucesso',
      data: conversation,
    })
  }

  async getConversationById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const conversation = await conversationService.getConversationById(id)

    return reply.status(200).send({
      success: true,
      message: 'Conversa encontrada com sucesso',
      data: conversation,
    })
  }

  async updateConversation(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as UpdateConversationSchemaDTO
    const { id } = request.params as { id: string }

    const conversation = await conversationService.updateConversation(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Conversa atualizada com sucesso',
      data: conversation,
    })
  }

  async deleteConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await conversationService.deleteConversation(id)

    return reply.status(200).send({
      success: true,
      message: 'Conversa deletada com sucesso',
    })
  }
}

export const conversationController = new ConversationController()
