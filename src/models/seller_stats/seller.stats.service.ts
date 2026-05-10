import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type {
  CreateSellerStatsInput,
  UpdateSellerStatsInput,
} from './seller.stas.schema'

export interface CreateSellerStatsSchemaDTO extends CreateSellerStatsInput {}
export interface UpdateSellerStatsSchemaDTO extends UpdateSellerStatsInput {}

export class SellerStatsService {
  async createSellerStats(data: CreateSellerStatsSchemaDTO) {
    const findUser = await prisma.user.findUnique({
      where: { id: data.user_id },
    })

    if (!findUser) throw new NotFoundError('ID do usuario inválido')

    try {
      const sellerStats = await prisma.seller_stats.create({
        data: {
          ...data,
        },
      })

      return sellerStats
    } catch (err: any) {
      throw new ValidationError('Erro ao criar os stats', err)
    }
  }

  async getSellerStatsById(id: string) {
    const sellerStats = await prisma.seller_stats.findUnique({
      where: { user_id: id },
    })

    if (!sellerStats) throw new NotFoundError('Erro ao encontrar os stats')

    return sellerStats
  }

  async updateSellerStats(data: UpdateSellerStatsInput, id: string) {
    const findSellerStats = await prisma.seller_stats.findUnique({
      where: { user_id: id },
    })

    if (!findSellerStats) throw new NotFoundError('Erro ao encontrar os stats')

    try {
      const sellerStats = await prisma.seller_stats.update({
        where: { user_id: id },
        data: {
          ...(data.active_listings !== undefined && {
            active_listings: data.active_listings,
          }),
          ...(data.avg_rating !== undefined && { avg_rating: data.avg_rating }),
          ...(data.review_count !== undefined && {
            review_count: data.review_count,
          }),
          ...(data.sold_count !== undefined && { sold_count: data.sold_count }),
          ...(data.total_listings !== undefined && {
            total_listings: data.total_listings,
          }),
        },
      })

      return sellerStats
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar os stats', err)
    }
  }

  async deleteSellerStats(id: string) {
    const findSellerStats = await prisma.seller_stats.findUnique({
      where: { user_id: id },
    })

    if (!findSellerStats) throw new NotFoundError('Erro ao encontrar os stats')

    try {
      await prisma.seller_stats.delete({
        where: { user_id: id },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao deletar os stats', err)
    }
  }
}

export const sellerStatsService = new SellerStatsService()
