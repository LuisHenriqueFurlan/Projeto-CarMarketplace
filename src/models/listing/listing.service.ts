import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type { CreateListingInput, UpdateListingInput } from './listing.schema'

export interface CreateListingDTO extends CreateListingInput {}
export interface UpdateListingDTO extends UpdateListingInput {}

export class ListingService {
  async createListing(data: CreateListingDTO) {
    const findUser = data.user_id

    const user = await prisma.user.findUnique({
      where: { findUser },
    })

    if (!user) throw new NotFoundError('Não foi possível encontrar o usuário')

    try {
      const list = await prisma.listing.create({
        data: {
          user_id: data.user_id,
          title: data.title,
          category: data.category,
          price: data.price,
          condition: data.condition,
          year_model: data.year_model,
          year_manuf: data.year_manuf,
          brand: data.brand,
          model: data.model,
          description: data.description,
          status: data.status,
          color: data.color,
          fuel: data.fuel,
          trasmission: data.transmission,
          km: data.km,
          doors: data.doors,
          engine_cc: data.engine_cc,
          license_plate: data.license_plate,
          fipe_code: data.fipe_code,
          price_negotiable: data.price_negotiable,
          accepts_trade: data.accepts_trade,
          city: data.city,
          state: data.state,
          cep: data.cep,
          featured: data.featured,
          featured_until: data.featured_until,
          expires_at: data.expires_at,
          published_at: data.published_at,
        },
      })

      return list
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a listagem', err)
    }
  }

  async getListingByID(id: string) {
    const list = await prisma.listing.findUnique({
      where: { id },
      include: { listing_images: { orderBy: { position: 'asc' } } },
    })

    if (!list) {
      throw new NotFoundError('Listagem', id)
    }

    return list
  }

  async getListingByTitle(title: string) {
    const list = await prisma.listing.findMany({
      where: { title: { contains: title, mode: 'insensitive' } },
    })

    if (list.length === 0) {
      throw new NotFoundError('Listagem')
    }

    return list
  }

  async getListingByBrand(brand: string) {
    const list = await prisma.listing.findMany({
      where: { brand: { contains: brand, mode: 'insensitive' } },
    })

    if (list.length === 0) {
      throw new NotFoundError('Listagem')
    }

    return list
  }

  async getListingByYear(year: number) {
    const list = await prisma.listing.findMany({
      where: { year_model: year },
    })

    if (list.length === 0) {
      throw new NotFoundError('Listagem')
    }

    return list
  }

  async getListingByCategory(category: string) {
    const list = await prisma.listing.findMany({
      where: { category: category as any },
    })

    if (list.length === 0) {
      throw new NotFoundError('Listagem')
    }

    return list
  }

  async searchListings(filters: {
    title?: string
    brand?: string
    year?: number
    category?: string
    condition?: string
  }) {
    return prisma.listing.findMany({
      where: {
        ...(filters.title && {
          title: { contains: filters.title, mode: 'insensitive' },
        }),
        ...(filters.brand && {
          brand: { contains: filters.brand, mode: 'insensitive' },
        }),
        ...(filters.category && { category: filters.category as any }),
        ...(filters.year && { year_model: filters.year }),
        ...(filters.condition && { condition: filters.condition as any }),
      },
      include: { listing_images: { orderBy: { position: 'asc' }, take: 1 } },
    })
  }

  async updateListing(data: UpdateListingDTO, id: string) {
    const getList = await prisma.listing.findUnique({ where: { id } })

    if (!getList) {
      throw new NotFoundError('Listagem', id)
    }

    try {
      const list = await prisma.listing.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.condition !== undefined && { condition: data.condition }),
          ...(data.year_model !== undefined && { year_model: data.year_model }),
          ...(data.year_manuf !== undefined && { year_manuf: data.year_manuf }),
          ...(data.brand !== undefined && { brand: data.brand }),
          ...(data.model !== undefined && { model: data.model }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.fuel !== undefined && { fuel: data.fuel }),
          ...(data.transmission !== undefined && {
            trasmission: data.transmission,
          }),
          ...(data.km !== undefined && { km: data.km }),
          ...(data.doors !== undefined && { doors: data.doors }),
          ...(data.engine_cc !== undefined && { engine_cc: data.engine_cc }),
          ...(data.license_plate !== undefined && {
            license_plate: data.license_plate,
          }),
          ...(data.fipe_code !== undefined && { fipe_code: data.fipe_code }),
          ...(data.price_negotiable !== undefined && {
            price_negotiable: data.price_negotiable,
          }),
          ...(data.accepts_trade !== undefined && {
            accepts_trade: data.accepts_trade,
          }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.cep !== undefined && { cep: data.cep }),
          ...(data.featured !== undefined && { featured: data.featured }),
          ...(data.featured_until !== undefined && {
            featured_until: data.featured_until,
          }),
          ...(data.expires_at !== undefined && { expires_at: data.expires_at }),
          ...(data.published_at !== undefined && {
            published_at: data.published_at,
          }),
          updated_at: new Date(),
        },
      })

      return list
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a listagem', err)
    }
  }

  async deleteListing(id: string) {
    const list = await prisma.listing.findUnique({ where: { id } })

    if (!list) {
      throw new NotFoundError('Listagem', id)
    }

    await prisma.listing.delete({ where: { id } })

    return { message: 'Listagem deletada com sucesso' }
  }
}

export const listingService = new ListingService()
