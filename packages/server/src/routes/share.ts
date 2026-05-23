// @ts-nocheck
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database.js'
import { success, fail, notFound } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'

const router = Router()

// 创建分享链接
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { photoIds, albumId, pinCode, expiresIn } = req.body

    // 生成不可猜测的 token
    const token = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '')

    // 计算过期时间
    let expiresAt = null
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000) // expiresIn 小时
    }

    // 哈希 PIN 码
    let hashedPinCode = null
    if (pinCode) {
      hashedPinCode = await bcrypt.hash(pinCode, 10)
    }

    const shareLink = await prisma.shareLink.create({
      data: {
        token,
        pinCode: hashedPinCode,
        expiresAt,
        albumId,
        createdBy: req.userId,
      },
    })

    return success(res, shareLink)
  } catch (error) {
    console.error('创建分享链接失败:', error)
    return fail(res, '创建分享链接失败', 500)
  }
})

// 通过 token 获取分享内容
router.get('/:token', async (req: Request, res: Response) => {
  try {
    const { pinCode } = req.query

    const shareLink = await prisma.shareLink.findUnique({
      where: { token: req.params.token },
    })

    if (!shareLink) {
      return notFound(res, '分享链接不存在')
    }

    if (!shareLink.isActive) {
      return fail(res, '分享链接已失效')
    }

    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return fail(res, '分享链接已过期')
    }

    if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
      return fail(res, '分享链接已达到最大访问次数')
    }

    // 验证 PIN 码
    if (shareLink.pinCode) {
      if (!pinCode) {
        return fail(res, '请输入PIN码', 401)
      }
      const isValidPin = await bcrypt.compare(pinCode as string, shareLink.pinCode)
      if (!isValidPin) {
        return fail(res, 'PIN码错误', 401)
      }
    }

    // 增加访问次数
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { viewCount: { increment: 1 } },
    })

    // 获取照片
    let photos: any[] = []
    let album = null

    if (shareLink.albumId) {
      album = await prisma.album.findUnique({
        where: { id: shareLink.albumId },
      })
      photos = await prisma.photo.findMany({
        where: { albumId: shareLink.albumId },
        orderBy: { sortOrder: 'desc' },
      })
    }

    return success(res, { photos, album })
  } catch (error) {
    console.error('获取分享内容失败:', error)
    return fail(res, '获取分享内容失败', 500)
  }
})

// 停用分享链接
router.put('/:id/deactivate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查所有权
    const existingLink = await prisma.shareLink.findUnique({
      where: { id: req.params.id },
    })

    if (!existingLink) {
      return notFound(res, '分享链接不存在')
    }

    if (existingLink.createdBy !== req.userId) {
      return fail(res, '只能停用自己创建的分享链接', 403)
    }

    const shareLink = await prisma.shareLink.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })

    return success(res, shareLink)
  } catch (error) {
    console.error('停用分享链接失败:', error)
    return fail(res, '停用分享链接失败', 500)
  }
})

export default router
