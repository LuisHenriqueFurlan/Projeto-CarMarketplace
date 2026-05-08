import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  reviewsService,
  type CreateReviewDTO,
  type UpdateReviewDTO,
} from './reviews.service'

export class ReviewsController {
  async createReview(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateReviewDTO

    const review = await reviewsService.createReview(data)

    return reply.status(201).send({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: review,
    })
  }

  async getReviewById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const review = await reviewsService.getReviewById(id)

    return reply.status(200).send({
      success: true,
      message: 'Avaliação encontrada com sucesso',
      data: review,
    })
  }

  async getReviewsBySeller(request: FastifyRequest, reply: FastifyReply) {
    const { seller_id } = request.params as { seller_id: string }

    const reviews = await reviewsService.getReviewsBySeller(seller_id)

    return reply.status(200).send({
      success: true,
      message: 'Avaliações encontradas com sucesso',
      data: reviews,
    })
  }

  async updateReview(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = request.body as UpdateReviewDTO

    const review = await reviewsService.updateReview(id, data)

    return reply.status(200).send({
      success: true,
      message: 'Avaliação atualizada com sucesso',
      data: review,
    })
  }

  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await reviewsService.deleteReview(id)

    return reply.status(200).send({
      success: true,
      message: 'Avaliação deletada com sucesso',
    })
  }
}

export const reviewsController = new ReviewsController()
