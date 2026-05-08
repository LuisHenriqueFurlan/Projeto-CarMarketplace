import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  sellerStatsService,
  type CreateSellerStatsSchemaDTO,
  type UpdateSellerStatsSchemaDTO,
} from './seller.stats.service'

export class SellerStatsController {
  async createSellerStats(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateSellerStatsSchemaDTO

    const sellerStats = await sellerStatsService.createSellerStats(data)

    return reply.status(201).send({
      success: true,
      message: 'Sucesso ao criar os stats',
      data: sellerStats,
    })
  }

  async getSellerStats(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const sellerStats = await sellerStatsService.getSellerStatsById(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao eoncontrar os stats',
      data: sellerStats,
    })
  }

  async updateSellerStats(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.body as { id: string }
    const data = request.body as UpdateSellerStatsSchemaDTO

    const sellerStats = await sellerStatsService.updateSellerStats(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao atualizar os stats',
      data: sellerStats,
    })
  }

  async deleteSellerStats(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await sellerStatsService.deleteSellerStats(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao deletar os stats',
    })
  }
}

export const sellerStatsController = new SellerStatsController()
