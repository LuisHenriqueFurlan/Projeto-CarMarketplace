import type { FastifyInstance } from 'fastify'
import { favoriteController } from './favorites.controller'

export async function favoritesRoutes(app: FastifyInstance) {
  app.post('/favorites', (request, reply) =>
    favoriteController.addFavorite(request, reply)
  )

  app.delete('/favorites/:user_id/:listing_id', (request, reply) =>
    favoriteController.removeFavorite(request, reply)
  )

  app.get('/favorites/:user_id', (request, reply) =>
    favoriteController.getUserFavorites(request, reply)
  )

  app.get('/favorites/:user_id/:listing_id/check', (request, reply) =>
    favoriteController.checkFavorite(request, reply)
  )
}
