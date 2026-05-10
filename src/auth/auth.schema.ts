import { z } from 'zod'

export const CreateLoginSchema = z.object({
  email: z.email('Deve ser um email válido'),
  password: z.string().min(8, 'A senha deve ter no minímo 8 caracteres'),
})

export type CreateLoginInput = z.infer<typeof CreateLoginSchema>
