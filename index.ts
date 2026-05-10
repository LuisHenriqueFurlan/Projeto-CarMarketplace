import { ZodError } from 'zod'
import Fastify from 'fastify'
import type { FastifyError } from 'fastify'
import 'dotenv/config'
import { conversationRoutes } from './src/models/conversation/conversation.routes'
import { ListingRoutes } from './src/models/listing/listing.routes'
import { ListingImagesRoutes } from './src/models/listing_images/listing.images.routes'
import { favoritesRoutes } from './src/models/favorites/favorites.routes'
import { userRoutes } from './src/models/user/user.routes'
import { messagesRoutes } from './src/models/messages/messages.routes'
import { reviewsRoutes } from './src/models/reviews/reviews.routes'
import { sellerStatsRoutes } from './src/models/seller_stats/seller.stats.routes'
import { reportsRoutes } from './src/models/reports/reports.routes'
import { authRoutes } from './src/auth/auth.routes'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import { AppError } from './src/errors/appError'

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HM:HM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

fastify.get('/', (_request, reply) => {
  return reply.send({ status: 'ok', message: 'Servidor funcionando' })
})

fastify.register(userRoutes)
fastify.register(ListingRoutes)
fastify.register(ListingImagesRoutes)
fastify.register(favoritesRoutes)
fastify.register(conversationRoutes)
fastify.register(messagesRoutes)
fastify.register(reviewsRoutes)
fastify.register(sellerStatsRoutes)
fastify.register(reportsRoutes)
fastify.register(authRoutes)

fastify.register(jwt, {
  secret: process.env.JWT_SECRET as string,
})

fastify.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
})

fastify.register(cors, {
  origin: true,
  credentials: true,
})

fastify.setErrorHandler((error: FastifyError | AppError, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: 'Erro de validação',
      details: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    })
  }

  if (error.statusCode === 413) {
    return reply.status(413).send({
      success: false,
      message: 'Imagem grande demais. Utilize uma imagem menor que 20MB.',
    })
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
    })
  }

  fastify.log.error(error)

  return reply.status(500).send({
    success: false,
    message: 'Erro interno do servidor',
  })
})

fastify.listen({ port: 3668, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Servidor rodando em ${address}`)
})
