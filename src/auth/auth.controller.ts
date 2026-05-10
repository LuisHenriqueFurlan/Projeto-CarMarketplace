import type { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from './auth.service'
import type { CreateLoginInput } from './auth.schema'

interface CreateLoginSchemaDTO extends CreateLoginInput {}

export class authController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as CreateLoginSchemaDTO

    const login = await authService.login(email, password)

    const token = request.server.jwt.sign(
      { id: login.id, email: login.email },
      { expiresIn: '7d' }
    )

    return reply.status(200).send({ token })
  }
}
