import { prisma } from '../../../prisma/prismaClient'
import { ConflictError, NotFoundError, ValidationError } from '../../errors/errors'
import type { AddFavoriteInput } from './favorites.schema'

export interface AddFavoriteDTO extends AddFavoriteInput {}

export class FavoriteService {
  async addFavorite(data: AddFavoriteDTO) {
    const user = await prisma.user.findUnique({
      where: { id: data.user_id },
    })

    if (!user) {
      throw new NotFoundError('Usuário', data.user_id)
    }

    const listing = await prisma.listing.findUnique({
      where: { id: data.listing_id },
    })

    if (!listing) {
      throw new NotFoundError('Listagem', data.listing_id)
    }

    const existing = await prisma.favorites.findUnique({
      where: {
        user_id_listing_id: {
          user_id: data.user_id,
          listing_id: data.listing_id,
        },
      },
    })

    if (existing) {
      throw new ConflictError('Listagem já favoritada pelo usuário')
    }

    try {
      const favorite = await prisma.favorites.create({
        data: {
          user_id: data.user_id,
          listing_id: data.listing_id,
        },
        include: {
          listing: true,
        },
      })

      return favorite
    } catch (err: any) {
      throw new ValidationError('Erro ao adicionar favorito', err)
    }
  }

  async removeFavorite(user_id: string, listing_id: string) {
    const existing = await prisma.favorites.findUnique({
      where: {
        user_id_listing_id: { user_id, listing_id },
      },
    })

    if (!existing) {
      throw new NotFoundError('Favorito')
    }

    try {
      await prisma.favorites.delete({
        where: {
          user_id_listing_id: { user_id, listing_id },
        },
      })

      return { message: 'Favorito removido com sucesso' }
    } catch (err: any) {
      throw new ValidationError('Erro ao remover favorito', err)
    }
  }

  async getUserFavorites(user_id: string) {
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    })

    if (!user) {
      throw new NotFoundError('Usuário', user_id)
    }

    const favorites = await prisma.favorites.findMany({
      where: { user_id },
      include: {
        listing: {
          include: {
            listing_images: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return favorites
  }

  async checkFavorite(user_id: string, listing_id: string) {
    const favorite = await prisma.favorites.findUnique({
      where: {
        user_id_listing_id: { user_id, listing_id },
      },
    })

    return { favorited: !!favorite }
  }
}

export const favoriteService = new FavoriteService()
