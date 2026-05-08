import type { FastifyInstance } from 'fastify'
import { ListingController } from './listing.controller'

const listingController = new ListingController()

export async function ListingRoutes(app: FastifyInstance) {
  app.post('/listings', (request, reply) =>
    listingController.createListing(request, reply)
  )

  app.get('/listings/:id', (request, reply) =>
    listingController.getListingByID(request, reply)
  )

  app.post('/listings/search/title', (request, reply) =>
    listingController.getListingByTitle(request, reply)
  )

  app.post('/listings/search/brand', (request, reply) =>
    listingController.getListingByBrand(request, reply)
  )

  app.post('/listings/search/year', (request, reply) =>
    listingController.getListingByYear(request, reply)
  )

  app.post('/listings/search/category', (request, reply) =>
    listingController.getListingByCategory(request, reply)
  )

  app.post('/listings/search/year', (request, reply) =>
    listingController.getListingByYear(request, reply)
  )

  app.post('/listings/search', (request, reply) =>
    listingController.searchListing(request, reply)
  )

  app.put('/listings/:id', (request, reply) =>
    listingController.updateListing(request, reply)
  )

  app.delete('/listings/:id', (request, reply) =>
    listingController.deleteListing(request, reply)
  )
}
