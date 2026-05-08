import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type {
  CreateConversationInput,
  UpdateConversationInput,
} from './conversation.schema'

export interface CreateConversationSchemaDTO extends CreateConversationInput {}
export interface UpdateConversationSchemaDTO extends UpdateConversationInput {}

export class ConversationService {
  async createConversation(data: CreateConversationSchemaDTO) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listing_id },
    })

    if (!listing) {
      throw new NotFoundError('Listagem', data.listing_id)
    }

    const buyer = await prisma.user.findUnique({
      where: { id: data.buyer_id },
    })

    if (!buyer) {
      throw new NotFoundError('Comprador', data.buyer_id)
    }

    const seller = await prisma.user.findUnique({
      where: { id: data.seller_id },
    })

    if (!seller) {
      throw new NotFoundError('Vendedor', data.seller_id)
    }

    try {
      const conversation = await prisma.conversation.create({
        data: {
          listing_id: data.listing_id,
          buyer_id: data.buyer_id,
          seller_id: data.seller_id,
          is_archived: data.is_archived,
        },
      })

      return conversation
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a conversa', err)
    }
  }

  async getConversationById(id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      throw new NotFoundError('Conversa', id)
    }

    return conversation
  }

  async updateConversation(data: UpdateConversationSchemaDTO, id: string) {
    const existing = await prisma.conversation.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Conversa', id)
    }

    try {
      const conversation = await prisma.conversation.update({
        where: { id },
        data: {
          ...(data.is_archived !== undefined && { is_archived: data.is_archived }),
          updated_at: new Date(),
        },
      })

      return conversation
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a conversa', err)
    }
  }

  async deleteConversation(id: string) {
    const existing = await prisma.conversation.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Conversa', id)
    }

    try {
      await prisma.conversation.delete({ where: { id } })

      return { message: 'Conversa deletada com sucesso' }
    } catch (err: any) {
      throw new ValidationError('Erro ao deletar a conversa', err)
    }
  }
}

export const conversationService = new ConversationService()
