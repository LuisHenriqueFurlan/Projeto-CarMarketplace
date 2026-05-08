import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  reportsService,
  type CreateReportDTO,
  type UpdateReportStatusDTO,
} from './reports.service'

export class ReportsController {
  async createReport(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateReportDTO

    const report = await reportsService.createReport(data)

    return reply.status(201).send({
      success: true,
      message: 'Denúncia criada com sucesso',
      data: report,
    })
  }

  async getReportById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const report = await reportsService.getReportById(id)

    return reply.status(200).send({
      success: true,
      message: 'Denúncia encontrada com sucesso',
      data: report,
    })
  }

  async getReportsByListing(request: FastifyRequest, reply: FastifyReply) {
    const { listing_id } = request.params as { listing_id: string }

    const reports = await reportsService.getReportsByListing(listing_id)

    return reply.status(200).send({
      success: true,
      message: 'Denúncias encontradas com sucesso',
      data: reports,
    })
  }

  async updateReportStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = request.body as UpdateReportStatusDTO

    const report = await reportsService.updateReportStatus(id, data)

    return reply.status(200).send({
      success: true,
      message: 'Status da denúncia atualizado com sucesso',
      data: report,
    })
  }

  async deleteReport(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await reportsService.deleteReport(id)

    return reply.status(200).send({
      success: true,
      message: 'Denúncia deletada com sucesso',
    })
  }
}

export const reportsController = new ReportsController()
