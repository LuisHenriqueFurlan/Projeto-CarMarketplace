import { prisma } from '../../../prisma/prismaClient'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../errors/errors'
import type {
  CreateReportInput,
  UpdateReportStatusInput,
} from './reports.schema'

export interface CreateReportDTO extends CreateReportInput {}
export interface UpdateReportStatusDTO extends UpdateReportStatusInput {}

export class ReportsService {
  async createReport(data: CreateReportDTO) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listing_id },
    })
    if (!listing) throw new NotFoundError('Anúncio', data.listing_id)

    const reporter = await prisma.user.findUnique({
      where: { id: data.reporter_id },
    })
    if (!reporter) throw new NotFoundError('Usuário', data.reporter_id)

    if (listing.user_id === data.reporter_id) {
      throw new ValidationError(
        'Você não pode denunciar o próprio anúncio',
        null
      )
    }

    const existing = await prisma.report.findUnique({
      where: {
        listing_id_reporter_id: {
          listing_id: data.listing_id,
          reporter_id: data.reporter_id,
        },
      },
    })
    if (existing) throw new ConflictError('Você já denunciou este anúncio')

    try {
      const report = await prisma.report.create({
        data: {
          listing_id: data.listing_id,
          reporter_id: data.reporter_id,
          reason: data.reason,
          details: data.details,
        },
        include: {
          listing: { select: { id: true, title: true } },
          reporter: { select: { id: true, name: true } },
        },
      })

      return report
    } catch (err: any) {
      throw new ValidationError('Erro ao criar denúncia', err)
    }
  }

  async getReportById(id: string) {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true } },
        reporter: { select: { id: true, name: true } },
      },
    })

    if (!report) throw new NotFoundError('Denúncia', id)

    return report
  }

  async getReportsByListing(listing_id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listing_id },
    })
    if (!listing) throw new NotFoundError('Anúncio', listing_id)

    return prisma.report.findMany({
      where: { listing_id },
      include: {
        reporter: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async updateReportStatus(id: string, data: UpdateReportStatusDTO) {
    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) throw new NotFoundError('Denúncia', id)

    try {
      return await prisma.report.update({
        where: { id },
        data: {
          status: data.status,
          resolved_at:
            data.status !== 'pendente'
              ? data.resolved_at
                ? new Date(data.resolved_at)
                : new Date()
              : null,
        },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar denúncia', err)
    }
  }

  async deleteReport(id: string) {
    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) throw new NotFoundError('Denúncia', id)

    try {
      await prisma.report.delete({ where: { id } })
    } catch (err: any) {
      throw new ValidationError('Erro ao deletar denúncia', err)
    }
  }
}

export const reportsService = new ReportsService()
