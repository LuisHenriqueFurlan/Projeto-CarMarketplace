import type { FastifyRequest, FastifyReply } from 'fastify'
import { commentsService } from './comments.service'
import { ValidationError } from '../../errors/errors'

function getTokenPayload(request: FastifyRequest): { id: string } | null {
  try {
    const auth = request.headers.authorization
    if (!auth) return null
    const token = auth.replace('Bearer ', '')
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    )
    return payload
  } catch {
    return null
  }
}

export class CommentsController {
  async getComments(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const comments = await commentsService.getComments(id)
    return reply.status(200).send({ success: true, data: comments })
  }

  async addComment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { body, parent_id } = request.body as {
      body: string
      parent_id?: string
    }

    const user = getTokenPayload(request)
    if (!user) return reply.status(401).send({ message: 'Não autorizado' })

    const comment = await commentsService.addComment(
      id,
      user.id,
      body,
      parent_id
    )
    return reply.status(201).send({ success: true, data: comment })
  }

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    const user = getTokenPayload(request)
    if (!user) return reply.status(401).send({ message: 'Não autorizado' })

    const count = await commentsService.getUnreadCount(user.id)
    return reply.status(200).send({ success: true, data: { count } })
  }

  async markAllRead(request: FastifyRequest, reply: FastifyReply) {
    const user = getTokenPayload(request)
    if (!user) return reply.status(401).send({ message: 'Não autorizado' })

    await commentsService.markAllRead(user.id)
    return reply.status(200).send({ success: true })
  }

  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const user = getTokenPayload(request)
    if (!user) throw new ValidationError('Usuário não autenticado')
    const { page, per_page, from, to, unread_only } = request.query as {
      page: string
      per_page: string
      from?: string
      to?: string
      unread_only?: string
    }

    const notifications = await commentsService.getNotifications(user.id, {
      page: parseInt(page ?? '1', 10),
      per_page: parseInt(per_page ?? '10', 10),
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      unread_only: unread_only === 'true',
    })

    return reply.status(200).send({
      message: 'Sucesso ao listar as notificações',
      success: true,
      data: notifications,
    })
  }
}

export const commentsController = new CommentsController()
