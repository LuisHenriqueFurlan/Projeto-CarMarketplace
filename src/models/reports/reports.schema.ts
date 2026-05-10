import { z } from 'zod'

const reportReasonEnum = z.enum([
  'preco_suspeito',
  'anuncio_duplicado',
  'veiculo_roubado',
  'informacoes_falsas',
  'spam',
  'outro',
])

const reportStatusEnum = z.enum(['pendente', 'em_analise', 'resolvido', 'descartado'])

export const CreateReportSchema = z.object({
  listing_id: z.string().uuid('Deve ser uma UUID válida'),
  reporter_id: z.string().uuid('Deve ser uma UUID válida'),
  reason: reportReasonEnum,
  details: z.string().optional(),
})

export const UpdateReportStatusSchema = z.object({
  status: reportStatusEnum,
  resolved_at: z.string().datetime().optional(),
})

export type CreateReportInput = z.infer<typeof CreateReportSchema>
export type UpdateReportStatusInput = z.infer<typeof UpdateReportStatusSchema>
