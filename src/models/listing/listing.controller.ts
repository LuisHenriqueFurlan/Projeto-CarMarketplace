import type { FastifyRequest, FastifyReply } from 'fastify'
import { MissingFieldError } from '../../errors/errors'
import {
  listingService,
  type CreateListingDTO,
  type UpdateListingDTO,
} from './listing.service'

interface SearchFilters {
  title?: string
  brand?: string
  year?: number
  category?: string
  condition?: string
}

export class ListingController {
  async createListing(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateListingDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

    const list = await listingService.createListing(data)

    return reply.status(201).send({
      success: true,
      message: 'Sucesso ao criar a listagem',
      data: list,
    })
  }

  async getListingByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const list = await listingService.getListingByID(id)

    return reply.status(200).send({
      success: true,
      message: 'Listagem encontrada com sucesso',
      data: list,
    })
  }

  async getListingByTitle(request: FastifyRequest, reply: FastifyReply) {
    const { title } = request.body as { title: string }

    const list = await listingService.getListingByTitle(title)

    return reply.status(200).send({
      success: true,
      message: 'Listagens encontradas com sucesso',
      data: list,
    })
  }

  async getListingByBrand(request: FastifyRequest, reply: FastifyReply) {
    const { brand } = request.body as { brand: string }

    const list = await listingService.getListingByBrand(brand)

    return reply.status(200).send({
      success: true,
      message: 'Listagens encontradas com sucesso',
      data: list,
    })
  }

  async getListingByYear(request: FastifyRequest, reply: FastifyReply) {
    const { year } = request.body as { year: number }

    const list = await listingService.getListingByYear(year)

    return reply.status(200).send({
      success: true,
      message: 'Listagens encontradas com sucesso',
      data: list,
    })
  }

  async getListingByCategory(request: FastifyRequest, reply: FastifyReply) {
    const { category } = request.body as { category: string }

    const list = await listingService.getListingByCategory(category)

    return reply.status(200).send({
      success: true,
      message: 'Listagens encontradas com sucesso',
      data: list,
    })
  }

  async searchListing(request: FastifyRequest, reply: FastifyReply) {
    const filters = request.body as SearchFilters

    const list = await listingService.searchListings(filters)

    return reply.status(200).send({
      success: true,
      message: 'Listagens encontradas com sucesso',
      data: list,
    })
  }

  async updateListing(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = request.body as UpdateListingDTO

    const list = await listingService.updateListing(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Listagem atualizada com sucesso',
      data: list,
    })
  }

  async deleteListing(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await listingService.deleteListing(id)

    return reply.status(200).send({
      success: true,
      message: 'Listagem deletada com sucesso',
    })
  }
}
