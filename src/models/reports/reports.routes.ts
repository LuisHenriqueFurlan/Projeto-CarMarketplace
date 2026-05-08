import type { FastifyInstance } from 'fastify'
import { reportsController } from './reports.controller'

export async function reportsRoutes(app: FastifyInstance) {
  app.post('/reports', (request, reply) =>
    reportsController.createReport(request, reply)
  )

  app.get('/reports/:id', (request, reply) =>
    reportsController.getReportById(request, reply)
  )

  app.get('/reports/listing/:listing_id', (request, reply) =>
    reportsController.getReportsByListing(request, reply)
  )

  app.patch('/reports/:id/status', (request, reply) =>
    reportsController.updateReportStatus(request, reply)
  )

  app.delete('/reports/:id', (request, reply) =>
    reportsController.deleteReport(request, reply)
  )
}
