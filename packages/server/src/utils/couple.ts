import prisma from '../config/database.js'

// 获取用户的伴侣ID，如果没有伴侣返回null
export async function getPartnerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coupleId: true },
  })
  if (!user?.coupleId) return null

  const couple = await prisma.couple.findUnique({
    where: { id: user.coupleId },
  })
  if (!couple) return null

  return couple.user1Id === userId ? couple.user2Id : couple.user1Id
}

// 获取用户和伴侣的ID列表（如果没有伴侣则只返回自己）
export async function getCoupleUserIds(userId: string): Promise<string[]> {
  const partnerId = await getPartnerId(userId)
  return partnerId ? [userId, partnerId] : [userId]
}
