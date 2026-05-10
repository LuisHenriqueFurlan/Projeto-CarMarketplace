import type { FastifyInstance } from 'fastify'
import { authController } from './auth.controller'

const controller = new authController()

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    return controller.login(request, reply)
  })
}
