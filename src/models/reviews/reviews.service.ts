import { prisma } from '../../../prisma/prismaClient'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../errors/errors'
import type { CreateReviewInput, UpdateReviewInput } from './reviews.schema'

export interface CreateReviewDTO extends CreateReviewInput {}
export interface UpdateReviewDTO extends UpdateReviewInput {}

export class ReviewsService {
  async createReview(data: CreateReviewDTO) {
    if (data.seller_id === data.reviewer_id) {
      throw new ValidationError('Um usuário não pode avaliar a si mesmo', null)
    }

    const seller = await prisma.user.findUnique({
      where: { id: data.seller_id },
    })
    if (!seller) throw new NotFoundError('Vendedor', data.seller_id)

    const reviewer = await prisma.user.findUnique({
      where: { id: data.reviewer_id },
    })
    if (!reviewer) throw new NotFoundError('Avaliador', data.reviewer_id)

    if (data.listing_id) {
      const listing = await prisma.listing.findUnique({
        where: { id: data.listing_id },
      })
      if (!listing) throw new NotFoundError('Anúncio', data.listing_id)

      const existing = await prisma.review.findUnique({
        where: {
          listing_id_reviewer_id: {
            listing_id: data.listing_id,
            reviewer_id: data.reviewer_id,
          },
        },
      })
      if (existing) throw new ConflictError('Você já avaliou este anúncio')
    }

    try {
      const review = await prisma.review.create({
        data: {
          seller_id: data.seller_id,
          reviewer_id: data.reviewer_id,
          listing_id: data.listing_id,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          seller: { select: { id: true, name: true, avatar_url: true } },
          reviewer: { select: { id: true, name: true, avatar_url: true } },
          listing: { select: { id: true, title: true } },
        },
      })

      return review
    } catch (err: any) {
      throw new ValidationError('Erro ao criar avaliação', err)
    }
  }

  async getReviewById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, avatar_url: true } },
        reviewer: { select: { id: true, name: true, avatar_url: true } },
        listing: { select: { id: true, title: true } },
      },
    })

    if (!review) throw new NotFoundError('Avaliação', id)

    return review
  }

  async getReviewsBySeller(seller_id: string) {
    const seller = await prisma.user.findUnique({ where: { id: seller_id } })
    if (!seller) throw new NotFoundError('Vendedor', seller_id)

    return prisma.review.findMany({
      where: { seller_id },
      include: {
        reviewer: { select: { id: true, name: true, avatar_url: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async updateReview(id: string, data: UpdateReviewDTO) {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundError('Avaliação', id)

    try {
      return await prisma.review.update({
        where: { id },
        data: {
          ...(data.rating !== undefined && { rating: data.rating }),
          ...(data.comment !== undefined && { comment: data.comment }),
        },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar avaliação', err)
    }
  }

  async deleteReview(id: string) {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundError('Avaliação', id)

    try {
      await prisma.review.delete({ where: { id } })
    } catch (err: any) {
      throw new ValidationError('Erro ao deletar avaliação', err)
    }
  }
}

export const reviewsService = new ReviewsService()
