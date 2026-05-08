import type { FastifyInstance } from 'fastify'
import { sellerStatsController } from './seller.stats.controller'

export async function sellerStatsRoutes(app: FastifyInstance) {
  app.post('/seller-stats', (request, reply) =>
    sellerStatsController.createSellerStats(request, reply)
  )

  app.get('/seller-stats/:id', (request, reply) =>
    sellerStatsController.getSellerStats(request, reply)
  )

  app.patch('/seller-stats/:id', (request, reply) =>
    sellerStatsController.updateSellerStats(request, reply)
  )

  app.delete('/seller-stats/:id', (request, reply) =>
    sellerStatsController.deleteSellerStats(request, reply)
  )
}
