import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type { CreateListingInput, UpdateListingInput } from './listing.schema'

export interface CreateListingDTO extends CreateListingInput {}
export interface UpdateListingDTO extends UpdateListingInput {}

export class ListingService {
  async createListing(data: CreateListingDTO) {
    const user = await prisma.user.findUnique({
      where: { id: data.seller_id },
    })

    if (!user) throw new NotFoundError('Não foi possível encontrar o usuário')

    try {
      const list = await prisma.listing.create({
        data: {
          seller_id: data.seller_id,
          title: data.title,
          category: data.category as any,
          price: data.price,
          condition: data.condition as any,
          year_model: data.year_model,
          year_manuf: data.year_manuf,
          brand: data.brand,
          model: data.model,
          description: data.description,
          status: data.status as any,
          color: data.color,
          fuel: data.fuel as any,
          transmission: data.transmission as any,
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
          featured_amount: data.featured_amount,
          popular_name: data.popular_name,
          plate: data.plate,
          bullet_proof: data.bullet_proof,
          auction: data.auction,
          security_components: data.security_components as any,
          comfort_components: data.comfort_components as any,
          technology_components: data.technology_components as any,
          mechanic_components: data.mechanic_components as any,
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
      include: {
        listing_images: { orderBy: { position: 'asc' } },
        seller: { select: { name: true, phone: true } },
      },
    })

    if (!list) {
      throw new NotFoundError('Listagem', id)
    }

    const { seller, ...rest } = list

    return {
      ...rest,
      seller_name: seller?.name,
      seller_phone: seller?.phone ?? undefined,
    }
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

  async getListingByUser(page: number = 1, limit: number = 1000, id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) throw new NotFoundError('Erro ao encontrar o usuário')

    try {
      const skip = (page - 1) * limit
      const [listing, total] = await Promise.all([
        prisma.listing.findMany({
          where: { seller_id: user.id },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            listing_images: { take: 1, orderBy: { position: 'asc' } },
          },
        }),
        prisma.listing.count({ where: { seller_id: user.id } }),
      ])

      return {
        data: listing,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (err: any) {
      throw new ValidationError('Erro ao acessar as listagens', err)
    }
  }

  async getListing(filters: {
    page?: number
    limit?: number
    category?: string
    condition?: string
    query?: string
    order_by?: string
    featured?: boolean
    state?: string
    city?: string
    fuel?: string
    brand?: string
    model?: string
    year?: number
    min_year?: number
    max_year?: number
    max_km?: number
    min_price?: number
    max_price?: number
    transmission?: string
    doors?: number
    color?: string
    min_engine_cc?: number
    max_engine_cc?: number
    bullet_proof?: boolean
    auction?: boolean
  } = {}) {
    const {
      page = 1, limit = 12, category, condition, query,
      order_by, featured, state, city, fuel, brand, model, year,
      min_year, max_year, max_km, min_price, max_price, transmission, doors, color,
      min_engine_cc, max_engine_cc, bullet_proof, auction,
    } = filters

    try {
      const skip = (page - 1) * limit

      const where: any = {
        ...(category && { category: category as any }),
        ...(condition && { condition: condition as any }),
        ...(query && { title: { contains: query, mode: 'insensitive' } }),
        ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
        ...(model && { model: { contains: model, mode: 'insensitive' } }),
        ...(year !== undefined
          ? { year_model: year }
          : (min_year !== undefined || max_year !== undefined)
            ? { year_model: { ...(min_year !== undefined && { gte: min_year }), ...(max_year !== undefined && { lte: max_year }) } }
            : {}),
        ...(max_km !== undefined && { km: { lte: max_km } }),
        ...(featured !== undefined && { featured }),
        ...(state && { state }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(fuel && { fuel: fuel as any }),
        ...(transmission && { transmission: transmission as any }),
        ...(doors && { doors }),
        ...(color && { color: { contains: color, mode: 'insensitive' } }),
        ...(bullet_proof !== undefined && { bullet_proof }),
        ...(auction !== undefined && { auction }),
        ...(min_price !== undefined || max_price !== undefined ? {
          price: {
            ...(min_price !== undefined && { gte: min_price }),
            ...(max_price !== undefined && { lte: max_price }),
          }
        } : {}),
        ...(min_engine_cc !== undefined || max_engine_cc !== undefined ? {
          engine_cc: {
            ...(min_engine_cc !== undefined && { gte: min_engine_cc }),
            ...(max_engine_cc !== undefined && { lte: max_engine_cc }),
          }
        } : {}),
      }

      const orderBy: any =
        order_by === 'menor_preco' ? { price: 'asc' } :
        order_by === 'maior_preco' ? { price: 'desc' } :
        order_by === 'relevancia' ? { featured_amount: 'desc' } :
        { created_at: 'desc' }

      const [listing, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: { listing_images: { take: 1, orderBy: { position: 'asc' } } },
        }),
        prisma.listing.count({ where }),
      ])

      return {
        data: listing,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      }
    } catch (err: any) {
      throw new ValidationError('Erro ao buscar as listagens', err)
    }
  }

  async listingBoost(id: string, amount: number) {
    const getListing = await prisma.listing.findUnique({ where: { id } })

    if (!getListing) throw new NotFoundError('Não foi possível encontrar a listagem')

    const featuredUntil = new Date()
    featuredUntil.setDate(featuredUntil.getDate() + 30)

    try {
      const boost = await prisma.listing.update({
        where: { id },
        data: {
          featured: true,
          featured_until: featuredUntil,
          featured_amount: amount,
        },
      })

      return boost
    } catch (err: any) {
      throw new ValidationError('Erro ao impulsionar a listagem', err)
    }
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
          ...(data.category !== undefined && { category: data.category as any }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.condition !== undefined && { condition: data.condition as any }),
          ...(data.year_model !== undefined && { year_model: data.year_model }),
          ...(data.year_manuf !== undefined && { year_manuf: data.year_manuf }),
          ...(data.brand !== undefined && { brand: data.brand }),
          ...(data.model !== undefined && { model: data.model }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.status !== undefined && { status: data.status as any }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.fuel !== undefined && { fuel: data.fuel as any }),
          ...(data.transmission !== undefined && { transmission: data.transmission as any }),
          ...(data.km !== undefined && { km: data.km }),
          ...(data.doors !== undefined && { doors: data.doors }),
          ...(data.engine_cc !== undefined && { engine_cc: data.engine_cc }),
          ...(data.license_plate !== undefined && { license_plate: data.license_plate }),
          ...(data.fipe_code !== undefined && { fipe_code: data.fipe_code }),
          ...(data.price_negotiable !== undefined && { price_negotiable: data.price_negotiable }),
          ...(data.accepts_trade !== undefined && { accepts_trade: data.accepts_trade }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.cep !== undefined && { cep: data.cep }),
          ...(data.featured !== undefined && { featured: data.featured }),
          ...(data.featured_until !== undefined && { featured_until: data.featured_until }),
          ...(data.expires_at !== undefined && { expires_at: data.expires_at }),
          ...(data.published_at !== undefined && { published_at: data.published_at }),
          ...(data.featured_amount !== undefined && { featured_amount: data.featured_amount }),
          ...(data.popular_name !== undefined && { popular_name: data.popular_name }),
          ...(data.plate !== undefined && { plate: data.plate }),
          ...(data.bullet_proof !== undefined && { bullet_proof: data.bullet_proof }),
          ...(data.auction !== undefined && { auction: data.auction }),
          ...(data.security_components !== undefined && { security_components: data.security_components as any }),
          ...(data.comfort_components !== undefined && { comfort_components: data.comfort_components as any }),
          ...(data.technology_components !== undefined && { technology_components: data.technology_components as any }),
          ...(data.mechanic_components !== undefined && { mechanic_components: data.mechanic_components as any }),
          updated_at: new Date(),
        },
      })

      return list
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a listagem', err)
    }
  }

  async incrementView(id: string) {
    await prisma.listing.update({
      where: { id },
      data: { views_count: { increment: 1 } },
    })
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
