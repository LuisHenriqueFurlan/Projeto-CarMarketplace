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

  async getListingByUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { page, limit } = request.query as { page?: string; limit?: string }

    const listing = await listingService.getListingByUser(
      page ? Number(page) : 1,
      limit ? Number(limit) : 1000,
      id
    )

    return reply.status(200).send({
      message: 'Sucesso ao buscar as listagens',
      data: listing,
      success: true,
    })
  }

  async getListing(request: FastifyRequest, reply: FastifyReply) {
    const q = request.query as any

    const listing = await listingService.getListing({
      page: q.page ? Number(q.page) : 1,
      limit: q.per_page ? Number(q.per_page) : 12,
      category: q.category,
      condition: q.condition,
      query: q.query,
      order_by: q.order_by,
      featured: q.featured === 'true' ? true : undefined,
      state: q.state,
      city: q.city,
      fuel: q.fuel,
      brand: q.brand,
      model: q.model,
      year: q.year ? Number(q.year) : undefined,
      min_year: q.min_year ? Number(q.min_year) : undefined,
      max_year: q.max_year ? Number(q.max_year) : undefined,
      max_km: q.max_km ? Number(q.max_km) : undefined,
      min_price: q.min_price ? Number(q.min_price) : undefined,
      max_price: q.max_price ? Number(q.max_price) : undefined,
      transmission: q.transmission,
      doors: q.doors ? Number(q.doors) : undefined,
      color: q.color,
      min_engine_cc: q.min_engine_cc ? Number(q.min_engine_cc) : undefined,
      max_engine_cc: q.max_engine_cc ? Number(q.max_engine_cc) : undefined,
      bullet_proof: q.bullet_proof === 'true' ? true : q.bullet_proof === 'false' ? false : undefined,
      auction: q.auction === 'true' ? true : q.auction === 'false' ? false : undefined,
    })

    return reply.status(200).send({
      success: true,
      data: listing,
      message: 'Sucesso ao buscar as listagens',
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

  async incrementView(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await listingService.incrementView(id)
    return reply.status(200).send({ success: true })
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
