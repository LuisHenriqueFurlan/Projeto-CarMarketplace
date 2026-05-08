import type { FastifyRequest, FastifyReply } from 'fastify'
import { favoriteService, type AddFavoriteDTO } from './favorites.service'
import { MissingFieldError } from '../../errors/errors'

export class FavoriteController {
  async addFavorite(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as AddFavoriteDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

    const favorite = await favoriteService.addFavorite(data)

    return reply.status(201).send({
      success: true,
      message: 'Listagem favoritada com sucesso',
      data: favorite,
    })
  }

  async removeFavorite(request: FastifyRequest, reply: FastifyReply) {
    const { user_id, listing_id } = request.params as {
      user_id: string
      listing_id: string
    }

    const result = await favoriteService.removeFavorite(user_id, listing_id)

    return reply.status(200).send({
      success: true,
      message: result.message,
    })
  }

  async getUserFavorites(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string }

    const favorites = await favoriteService.getUserFavorites(user_id)

    return reply.status(200).send({
      success: true,
      message: 'Favoritos encontrados com sucesso',
      data: favorites,
    })
  }

  async checkFavorite(request: FastifyRequest, reply: FastifyReply) {
    const { user_id, listing_id } = request.params as {
      user_id: string
      listing_id: string
    }

    const result = await favoriteService.checkFavorite(user_id, listing_id)

    return reply.status(200).send({
      success: true,
      data: result,
    })
  }
}

export const favoriteController = new FavoriteController()
