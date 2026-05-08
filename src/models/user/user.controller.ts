import type { FastifyRequest, FastifyReply } from 'fastify'
import { MissingFieldError } from '../../errors/errors'
import {
  userService,
  type CreateUserSchemaDTO,
  type UpdateUserSchemaDTO,
} from './user.service'

export interface ParamsInterface {
  id: string
}

export class UserController {
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateUserSchemaDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

    const user = await userService.createUser(data)

    return reply.status(201).send({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user,
    })
  }

  async getUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsInterface

    const user = await userService.getUserByID(id)

    return reply.status(200).send({
      success: true,
      message: 'Usuário encontrado com sucesso',
      data: user,
    })
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as UpdateUserSchemaDTO
    const { id } = request.params as ParamsInterface

    const user = await userService.updateUser(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user,
    })
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamsInterface

    const result = await userService.deleteUser(id)

    return reply.status(200).send({
      success: true,
      message: result.message,
    })
  }
}

export const userController = new UserController()
