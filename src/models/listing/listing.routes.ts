import type { FastifyInstance } from 'fastify'
import { ListingController } from './listing.controller'

const listingController = new ListingController()

export async function ListingRoutes(app: FastifyInstance) {
  app.get('/listings', (request, reply) =>
    listingController.getListing(request, reply)
  )

  app.get('/listings/user/:id', (request, reply) =>
    listingController.getListingByUser(request, reply)
  )

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

  app.post('/listings/search', (request, reply) =>
    listingController.searchListing(request, reply)
  )

  app.post('/listings/:id/view', (request, reply) =>
    listingController.incrementView(request, reply)
  )

  app.put('/listings/:id', (request, reply) =>
    listingController.updateListing(request, reply)
  )

  app.delete('/listings/:id', (request, reply) =>
    listingController.deleteListing(request, reply)
  )
}
