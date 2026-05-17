import { prisma } from '../../../prisma/prismaClient'
import { NotFoundError } from '../../errors/errors'

export class CommentsService {
  async getComments(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw new NotFoundError('Listagem', listingId)

    const comments = await prisma.listing_comment.findMany({
      where: { listing_id: listingId, parent_id: null },
      orderBy: { created_at: 'asc' },
      include: {
        author: { select: { id: true, name: true, avatar_url: true } },
        replies: {
          orderBy: { created_at: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatar_url: true } },
          },
        },
      },
    })

    return comments
  }

  async addComment(
    listingId: string,
    authorId: string,
    body: string,
    parentId?: string
  ) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })
    if (!listing) throw new NotFoundError('Listagem', listingId)

    if (parentId) {
      const parent = await prisma.listing_comment.findUnique({
        where: { id: parentId },
      })
      if (!parent) throw new NotFoundError('Comentário', parentId)
    }

    return prisma.listing_comment.create({
      data: {
        listing_id: listingId,
        author_id: authorId,
        body,
        parent_id: parentId ?? null,
      },
      include: {
        author: { select: { id: true, name: true, avatar_url: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar_url: true } },
          },
        },
      },
    })
  }

  async getUnreadCount(sellerId: string) {
    const count = await prisma.listing_comment.count({
      where: {
        listing: { seller_id: sellerId },
        author_id: { not: sellerId },
        is_read: false,
      },
    })
    return count
  }

  async markAllRead(sellerId: string) {
    await prisma.listing_comment.updateMany({
      where: {
        listing: { seller_id: sellerId },
        author_id: { not: sellerId },
        is_read: false,
      },
      data: { is_read: true },
    })
  }

  async getNotifications(
    sellerId: string,
    options: {
      page: number
      per_page: number
      from?: Date
      to?: Date
      unread_only?: boolean
    }
  ) {
    const where = {
      listing: { seller_id: sellerId },
      author_id: { not: sellerId },
      ...(options.unread_only ? { is_read: false } : {}),
      ...(options.from || options.to
        ? {
            created_at: {
              ...(options.from ? { gte: options.from } : {}),
              ...(options.to ? { lte: options.to } : {}),
            },
          }
        : {}),
    }

    const skip = (options.page - 1) * options.per_page
    const [comments, total] = await Promise.all([
      prisma.listing_comment.findMany({
        where,
        skip,
        take: options.per_page,
        orderBy: { created_at: 'desc' },
        include: {
          author: { select: { id: true, name: true, avatar_url: true } },
          listing: { select: { id: true, title: true } },
        },
      }),
      prisma.listing_comment.count({ where }),
    ])

    return {
      notifications: comments.map(c => ({
        id: c.id,
        listing_id: c.listing_id,
        listing_title: (c as any).listing?.title ?? '',
        body: c.body,
        author: (c as any).author,
        is_read: c.is_read,
        created_at: c.created_at,
      })),
      total,
      page: options.page,
      pages: Math.ceil(total / options.per_page),
    }
  }
}

export const commentsService = new CommentsService()
