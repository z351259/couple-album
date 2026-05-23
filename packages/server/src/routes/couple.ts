// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express'
import prisma from '../config/database.js'
import { success, fail, notFound } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'
import { getPartnerId } from '../utils/couple.js'

const router = Router()

// 生成6位邀请码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 所有 couple 路由需要认证
router.use(authMiddleware)

// 生成邀请码
router.post('/invite', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  try {
    // 检查是否已有情侣关系
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coupleId: true } })
    if (user?.coupleId) {
      return fail(res, '你已经有情侣关系了，请先解除')
    }

    // 检查是否已有未过期的邀请
    const existing = await prisma.invitation.findFirst({
      where: {
        fromUser: userId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    })
    if (existing) {
      return success(res, { code: existing.code, expiresAt: existing.expiresAt })
    }

    // 生成唯一邀请码
    let code: string
    let attempts = 0
    do {
      code = generateCode()
      const duplicate = await prisma.invitation.findUnique({ where: { code } })
      if (!duplicate) break
      attempts++
    } while (attempts < 10)

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const invitation = await prisma.invitation.create({
      data: {
        code: code!,
        fromUser: userId,
        expiresAt,
      },
    })

    return success(res, { code: invitation.code, expiresAt: invitation.expiresAt })
  } catch (error) {
    console.error('生成邀请码失败:', error)
    return fail(res, '生成邀请码失败', 500)
  }
})

// 查看我发出的邀请
router.get('/invite', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  try {
    const invitation = await prisma.invitation.findFirst({
      where: {
        fromUser: userId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
    return success(res, invitation)
  } catch (error) {
    console.error('获取邀请失败:', error)
    return fail(res, '获取邀请失败', 500)
  }
})

// 取消邀请
router.delete('/invite', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  try {
    await prisma.invitation.updateMany({
      where: { fromUser: userId, status: 'pending' },
      data: { status: 'cancelled' },
    })
    return success(res, null, '邀请已取消')
  } catch (error) {
    console.error('取消邀请失败:', error)
    return fail(res, '取消邀请失败', 500)
  }
})

// 接受邀请
router.post('/accept', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  const { code } = req.body
  try {
    if (!code) return fail(res, '请输入邀请码')

    // 检查自己是否已有情侣
    const myUser = await prisma.user.findUnique({ where: { id: userId }, select: { coupleId: true } })
    if (myUser?.coupleId) return fail(res, '你已经有情侣关系了')

    // 查找邀请
    const invitation = await prisma.invitation.findUnique({ where: { code } })
    if (!invitation) return fail(res, '邀请码无效')
    if (invitation.status !== 'pending') return fail(res, '邀请码已失效')
    if (invitation.expiresAt < new Date()) return fail(res, '邀请码已过期')
    if (invitation.fromUser === userId) return fail(res, '不能接受自己的邀请')

    // 检查邀请者是否已有情侣
    const inviter = await prisma.user.findUnique({ where: { id: invitation.fromUser }, select: { coupleId: true } })
    if (inviter?.coupleId) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'expired' } })
      return fail(res, '邀请者已有情侣关系')
    }

    // 创建情侣关系
    const couple = await prisma.couple.create({
      data: {
        user1Id: invitation.fromUser,
        user2Id: userId,
      },
    })

    // 更新两个用户的 coupleId
    await prisma.user.update({ where: { id: invitation.fromUser }, data: { coupleId: couple.id } })
    await prisma.user.update({ where: { id: userId }, data: { coupleId: couple.id } })

    // 标记邀请为已接受
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'accepted' } })

    // 取消该用户其他未过期的邀请
    await prisma.invitation.updateMany({
      where: { fromUser: invitation.fromUser, status: 'pending', id: { not: invitation.id } },
      data: { status: 'cancelled' },
    })

    return success(res, { coupleId: couple.id, partnerId: invitation.fromUser })
  } catch (error) {
    console.error('接受邀请失败:', error)
    return fail(res, '接受邀请失败', 500)
  }
})

// 获取伴侣信息
router.get('/partner', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  try {
    const partnerId = await getPartnerId(userId)
    if (!partnerId) return success(res, null)

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true, username: true, nickname: true, avatar: true, anniversaryDate: true },
    })
    return success(res, partner)
  } catch (error) {
    console.error('获取伴侣信息失败:', error)
    return fail(res, '获取伴侣信息失败', 500)
  }
})

// 解除情侣关系
router.delete('/unlink', async (req: Request, res: Response) => {
  const { userId } = req as AuthRequest
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coupleId: true } })
    if (!user?.coupleId) return fail(res, '你还没有情侣关系')

    // 清除两个用户的 coupleId
    await prisma.user.updateMany({
      where: { coupleId: user.coupleId },
      data: { coupleId: null },
    })

    // 删除情侣关系
    await prisma.couple.delete({ where: { id: user.coupleId } })

    return success(res, null, '已解除情侣关系')
  } catch (error) {
    console.error('解除关系失败:', error)
    return fail(res, '解除关系失败', 500)
  }
})

export default router
