import type { FastifyInstance } from 'fastify'
import { commentsController } from './comments.controller'

export async function CommentsRoutes(app: FastifyInstance) {
  app.get('/listings/:id/comments', (req, reply) =>
    commentsController.getComments(req, reply)
  )

  app.post('/listings/:id/comments', (req, reply) =>
    commentsController.addComment(req, reply)
  )

  app.get('/notifications/unread', (req, reply) =>
    commentsController.getUnreadCount(req, reply)
  )

  app.post('/notifications/mark-read', (req, reply) =>
    commentsController.markAllRead(req, reply)
  )

  app.get('/notifications', (req, reply) =>
    commentsController.getNotifications(req, reply)
  )
}
