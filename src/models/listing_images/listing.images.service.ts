import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError, ValidationError } from '../../errors/errors'
import type {
  CreateListingImagesInput,
  UpdateListingImagesInput,
} from '../listing_images/listing.images.schema'

export interface CreateListingImagesSchemaDTO
  extends CreateListingImagesInput {}

export interface UpdateListingImagesSchemaDTO
  extends UpdateListingImagesInput {}

export class ListingImagesService {
  async createListingImage(data: CreateListingImagesSchemaDTO) {
    const lista = await prisma.listing.findUnique({
      where: { id: data.listing_id },
    })

    if (!lista) throw new NotFoundError('Erro ao encontrar a listagem')

    if (!data.url || !data.position) {
      throw new ValidationError('Dados faltando')
    }

    try {
      const listingImages = await prisma.listing_image.create({
        data: {
          url: data.url,
          position: data.position,
        },
      })

      return listingImages
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a imagem', err)
    }
  }
  async getListingImages(id: string) {
    const listing = await prisma.listing_images.findUnique({
      where: { id },
    })

    if (!listing) {
      throw new NotFoundError('Erro ao encontrar a imagem')
    }

    return listing
  }

  async updateListingImages(data: UpdateListingImagesInput, id: string) {
    const listing = await prisma.listing_images.findUnique({
      where: { id },
    })

    if (!listing) {
      throw new NotFoundError('Erro ao encontrar a imagem')
    }

    try {
      const listing = await prisma.listing_images.update({
        where: { id },
        data: {
          ...(data.url !== undefined && { url: data.url }),
          ...(data.position !== undefined && { position: data.position }),
        },
      })

      return listing
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a imagem', err)
    }
  }

  async deleteListingImages(id: string) {
    const deletedImagem = await prisma.listing.delete({
      where: { id },
    })

    if (!deletedImagem) {
      throw new ValidationError('Erro ao deletar a imagem')
    }

    return { message: 'Sucesso ao deletar a imagem' }
  }
}

export const listingImagesService = new ListingImagesService()
