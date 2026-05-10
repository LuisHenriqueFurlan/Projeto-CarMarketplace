import { prisma } from '../../prisma/prismaClient'
import { ValidationError } from '../errors/errors'
import bcrypt from 'bcrypt'

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) throw new ValidationError('E-mail ou senha inválidos')

    const passwordCorreta = await bcrypt.compare(password, user.password_hash)

    if (!passwordCorreta) throw new ValidationError('E-mail ou senha inválidos')

    return user
  }
}

export const authService = new AuthService()
