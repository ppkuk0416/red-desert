import { prisma } from '@red-desert/db'

export async function getBuildDetail(slug: string) {
  return prisma.build.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true },
      },
      skills: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { likes: true, bookmarks: true, comments: true },
      },
      comments: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
  })
}

export async function getAllBuildSlugs(): Promise<string[]> {
  const builds = await prisma.build.findMany({ select: { slug: true } })
  return builds.map((b) => b.slug)
}
