import type { FastifyInstance } from 'fastify'
import { reviewsController } from './reviews.controller'

export async function reviewsRoutes(app: FastifyInstance) {
  app.post('/reviews', (request, reply) =>
    reviewsController.createReview(request, reply)
  )

  app.get('/reviews/:id', (request, reply) =>
    reviewsController.getReviewById(request, reply)
  )

  app.get('/reviews/seller/:seller_id', (request, reply) =>
    reviewsController.getReviewsBySeller(request, reply)
  )

  app.patch('/reviews/:id', (request, reply) =>
    reviewsController.updateReview(request, reply)
  )

  app.delete('/reviews/:id', (request, reply) =>
    reviewsController.deleteReview(request, reply)
  )
}
