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

  async getUnreadCount(userId: string) {
    const [sellerCount, buyerCount] = await Promise.all([
      // comentários novos nos anúncios do vendedor
      prisma.listing_comment.count({
        where: {
          listing: { seller_id: userId },
          author_id: { not: userId },
          is_read: false,
        },
      }),
      // respostas aos comentários do comprador
      prisma.listing_comment.count({
        where: {
          parent_id: { not: null },
          author_id: { not: userId },
          parent: { author_id: userId },
          is_read: false,
        },
      }),
    ])
    return sellerCount + buyerCount
  }

  async markAllRead(userId: string) {
    await Promise.all([
      prisma.listing_comment.updateMany({
        where: {
          listing: { seller_id: userId },
          author_id: { not: userId },
          is_read: false,
        },
        data: { is_read: true },
      }),
      prisma.listing_comment.updateMany({
        where: {
          parent_id: { not: null },
          author_id: { not: userId },
          parent: { author_id: userId },
          is_read: false,
        },
        data: { is_read: true },
      }),
    ])
  }

  async getNotifications(
    userId: string,
    options: {
      page: number
      per_page: number
      from?: Date
      to?: Date
      unread_only?: boolean
    }
  ) {
    const dateFilter = options.from || options.to
      ? {
          created_at: {
            ...(options.from ? { gte: options.from } : {}),
            ...(options.to ? { lte: options.to } : {}),
          },
        }
      : {}

    const baseExtra = {
      ...(options.unread_only ? { is_read: false } : {}),
      ...dateFilter,
    }

    const include = {
      author: { select: { id: true, name: true, avatar_url: true } },
      listing: { select: { id: true, title: true } },
      parent: { select: { body: true } },
    }

    const [sellerComments, buyerReplies] = await Promise.all([
      prisma.listing_comment.findMany({
        where: { listing: { seller_id: userId }, author_id: { not: userId }, ...baseExtra },
        orderBy: { created_at: 'desc' },
        include,
      }),
      prisma.listing_comment.findMany({
        where: {
          parent_id: { not: null },
          author_id: { not: userId },
          parent: { author_id: userId },
          ...baseExtra,
        },
        orderBy: { created_at: 'desc' },
        include,
      }),
    ])

    const all = [...sellerComments, ...buyerReplies]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const skip = (options.page - 1) * options.per_page
    const paginated = all.slice(skip, skip + options.per_page)
    const total = all.length

    return {
      notifications: paginated.map(c => ({
        id: c.id,
        listing_id: c.listing_id,
        listing_title: (c as any).listing?.title ?? '',
        body: c.body,
        author: (c as any).author,
        is_read: c.is_read,
        created_at: c.created_at,
        notification_type: c.parent_id ? 'reply' : 'comment',
        parent_body: c.parent_id ? (c as any).parent?.body : undefined,
      })),
      total,
      page: options.page,
      pages: Math.ceil(total / options.per_page),
    }
  }
}

export const commentsService = new CommentsService()
