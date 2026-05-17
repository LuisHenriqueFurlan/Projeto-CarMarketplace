import bcrypt from 'bcrypt'
import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type { CreateUserInput, UpdateUserInput } from './user.schema'

const BCRYPT_ROUNDS = 10

export interface CreateUserSchemaDTO extends CreateUserInput {}
export interface UpdateUserSchemaDTO extends UpdateUserInput {}

interface PrismaUniqueError {
  code: string
  meta?: { target?: string[] }
}

export class UserService {
  async createUser(data: CreateUserSchemaDTO) {
    try {
      const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password_hash,
          cpf: data.cpf,
          phone: data.phone,
          cep: data.cep,
          city: data.city,
          state: data.state,
          avatar_url: data.avatar_url,
          bio: data.bio,
          is_verified: data.is_verified ?? false,
        },
      })

      return user
    } catch (error) {
      const err = error as PrismaUniqueError
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0]
        if (field === 'email') throw new ValidationError('Email já registrado')
        if (field === 'cpf') throw new ValidationError('CPF já registrado')
      }
      throw error
    }
  }

  async getUserByID(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundError('Usuário', id)
    }

    return user
  }

  async updateUser(data: UpdateUserSchemaDTO, id: string) {
    const existing = await prisma.user.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Usuário', id)
    }

    try {
      const updateData: Record<string, unknown> = {}
      if (data.name) updateData.name = data.name
      if (data.email) updateData.email = data.email
      if (data.cep) updateData.cep = data.cep
      if (data.phone) updateData.phone = data.phone
      if (data.city) updateData.city = data.city
      if (data.state) updateData.state = data.state
      if (data.avatar_url) updateData.avatar_url = data.avatar_url
      if (data.bio) updateData.bio = data.bio
      if (data.is_verified !== undefined)
        updateData.is_verified = data.is_verified
      if (data.password) {
        updateData.password_hash = await bcrypt.hash(
          data.password,
          BCRYPT_ROUNDS
        )
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      })

      return user
    } catch (error) {
      const err = error as PrismaUniqueError
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0]
        if (field === 'email') throw new ValidationError('Email já em uso')
        if (field === 'cpf') throw new ValidationError('CPF já em uso')
      }
      throw error
    }
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundError('Usuário', id)
    }

    await prisma.user.delete({ where: { id } })

    return { message: 'Usuário deletado com sucesso' }
  }
}

export const userService = new UserService()
