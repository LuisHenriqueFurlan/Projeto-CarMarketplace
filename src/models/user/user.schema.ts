import { z } from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'O nome é obrigatório')
    .max(80, 'O nome pode ter no máximo 80 caracteres'),
  email: z
    .string()
    .max(255, 'Email excede a quantidade máxima de caracteres')
    .check(z.email('Formato de email inválido')),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  cep: z.string().max(9, 'CEP inválido').optional(),
  phone: z.string().max(16, 'Telefone inválido').optional(),
  avatar_url: z.string().check(z.url('Avatar deve ser uma URL válida')).optional(),
  verified: z.boolean().default(false),
})

export const userParamsSchema = z.object({
  id: z.uuid('Formato de id inválido'),
})

export const updateUserSchema = z.object({
  name: z.string().max(80, 'O nome pode ter no máximo 80 caracteres').optional(),
  email: z
    .string()
    .max(255, 'Email excede a quantidade máxima de caracteres')
    .check(z.email('Formato de email inválido'))
    .optional(),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').optional(),
  avatar_url: z.string().check(z.url('Avatar deve ser uma URL válida')).optional(),
  cep: z.string().max(9, 'CEP inválido').optional(),
  phone: z.string().max(16, 'Telefone inválido').optional(),
  verified: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
