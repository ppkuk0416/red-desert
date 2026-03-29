import { prisma } from '@red-desert/db'

export async function getUserProfile(userId: string) {
  return prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      builds: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          character: true,
          weaponPrimary: true,
          playstyle: true,
          upvotes: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
      contributions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          type: true,
          status: true,
          targetId: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          builds: true,
          likes: true,
          contributions: true,
        },
      },
    },
  })
}
