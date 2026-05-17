import { z } from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'O nome é obrigatório')
    .max(120, 'O nome pode ter no máximo 120 caracteres'),
  email: z
    .string()
    .max(255, 'Email excede a quantidade máxima de caracteres')
    .check(z.email('Formato de email inválido')),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(11, 'CPF inválido'),
  phone: z.string().max(20, 'Telefone inválido'),
  cep: z.string().length(8, 'CEP inválido').optional(),
  city: z.string().max(100, 'Cidade inválida').optional(),
  state: z.string().length(2, 'UF inválida').optional(),
  avatar_url: z
    .string()
    .check(z.url('Avatar deve ser uma URL válida'))
    .optional(),
  bio: z.string().optional(),
  is_verified: z.boolean().default(false),
})

export const userParamsSchema = z.object({
  id: z.uuid('Formato de id inválido'),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .max(120, 'O nome pode ter no máximo 120 caracteres')
    .optional(),
  email: z
    .string()
    .max(255, 'Email excede a quantidade máxima de caracteres')
    .check(z.email('Formato de email inválido'))
    .optional(),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .optional(),
  phone: z.string().max(20, 'Telefone inválido').optional(),
  cep: z.string().length(8, 'CEP inválido').optional(),
  city: z.string().max(100, 'Cidade inválida').optional(),
  state: z.string().length(2, 'UF inválida').optional(),
  avatar_url: z
    .string()
    .check(z.url('Avatar deve ser uma URL válida'))
    .optional(),
  bio: z.string().optional(),
  is_verified: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
