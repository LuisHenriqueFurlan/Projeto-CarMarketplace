import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type { SendMessageInput, UpdateMessageStatusInput } from './messages.schema'

export interface SendMessageDTO extends SendMessageInput {}
export interface UpdateMessageStatusDTO extends UpdateMessageStatusInput {}

export class MessageService {
  async sendMessage(data: SendMessageDTO) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversation_id },
    })

    if (!conversation) {
      throw new NotFoundError('Conversa', data.conversation_id)
    }

    if (conversation.is_archived) {
      throw new ValidationError('Não é possível enviar mensagens em uma conversa arquivada')
    }

    const sender = await prisma.user.findUnique({
      where: { id: data.sender_id },
    })

    if (!sender) {
      throw new NotFoundError('Usuário', data.sender_id)
    }

    const isParticipant =
      conversation.buyer_id === data.sender_id ||
      conversation.seller_id === data.sender_id

    if (!isParticipant) {
      throw new ValidationError('O remetente não é participante desta conversa')
    }

    try {
      const message = await prisma.message.create({
        data: {
          conversation_id: data.conversation_id,
          sender_id: data.sender_id,
          body: data.body,
        },
        include: { sender: { select: { id: true, name: true, avatar_url: true } } },
      })

      return message
    } catch (err: any) {
      throw new ValidationError('Erro ao enviar mensagem', err)
    }
  }

  async getConversationMessages(conversation_id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversation_id },
    })

    if (!conversation) {
      throw new NotFoundError('Conversa', conversation_id)
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id },
      include: { sender: { select: { id: true, name: true, avatar_url: true } } },
      orderBy: { created_at: 'asc' },
    })

    return messages
  }

  async getMessageById(id: string) {
    const message = await prisma.message.findUnique({
      where: { id },
      include: { sender: { select: { id: true, name: true, avatar_url: true } } },
    })

    if (!message) {
      throw new NotFoundError('Mensagem', id)
    }

    return message
  }

  async updateStatus(id: string, data: UpdateMessageStatusDTO) {
    const message = await prisma.message.findUnique({ where: { id } })

    if (!message) {
      throw new NotFoundError('Mensagem', id)
    }

    try {
      const updated = await prisma.message.update({
        where: { id },
        data: { status: data.status },
      })

      return updated
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar status da mensagem', err)
    }
  }

  async deleteMessage(id: string) {
    const message = await prisma.message.findUnique({ where: { id } })

    if (!message) {
      throw new NotFoundError('Mensagem', id)
    }

    await prisma.message.delete({ where: { id } })

    return { message: 'Mensagem deletada com sucesso' }
  }
}

export const messageService = new MessageService()
