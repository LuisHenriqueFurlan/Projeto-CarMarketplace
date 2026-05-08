import type { FastifyRequest, FastifyReply } from 'fastify'
import { MissingFieldError } from '../../errors/errors'
import {
  messageService,
  type SendMessageDTO,
  type UpdateMessageStatusDTO,
} from './messages.service'

export class MessageController {
  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as SendMessageDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

    const message = await messageService.sendMessage(data)

    return reply.status(201).send({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: message,
    })
  }

  async getConversationMessages(request: FastifyRequest, reply: FastifyReply) {
    const { conversation_id } = request.params as { conversation_id: string }

    const messages = await messageService.getConversationMessages(conversation_id)

    return reply.status(200).send({
      success: true,
      message: 'Mensagens encontradas com sucesso',
      data: messages,
    })
  }

  async getMessageById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const message = await messageService.getMessageById(id)

    return reply.status(200).send({
      success: true,
      message: 'Mensagem encontrada com sucesso',
      data: message,
    })
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = request.body as UpdateMessageStatusDTO

    const message = await messageService.updateStatus(id, data)

    return reply.status(200).send({
      success: true,
      message: 'Status da mensagem atualizado com sucesso',
      data: message,
    })
  }

  async deleteMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await messageService.deleteMessage(id)

    return reply.status(200).send({
      success: true,
      message: 'Mensagem deletada com sucesso',
    })
  }
}

export const messageController = new MessageController()
