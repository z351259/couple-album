// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express'
import prisma from '../config/database.js'
import { success, fail, notFound } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'

const router = Router()

// 获取收藏列表
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        photo: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return success(res, favorites.map((f) => f.photo))
  } catch (error) {
    console.error('获取收藏失败:', error)
    return fail(res, '获取收藏失败', 500)
  }
})

// 添加收藏
router.post('/:photoId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const { photoId } = req.params

    // 检查照片是否存在
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return notFound(res, '照片不存在')
    }

    // 检查是否已收藏
    const existing = await prisma.favorite.findUnique({
      where: {
        photoId_userId: {
          photoId,
          userId,
        },
      },
    })

    if (existing) {
      return fail(res, '已经收藏过了')
    }

    const favorite = await prisma.favorite.create({
      data: {
        photoId,
        userId,
      },
    })

    return success(res, favorite)
  } catch (error) {
    console.error('收藏失败:', error)
    return fail(res, '收藏失败', 500)
  }
})

// 取消收藏
router.delete('/:photoId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const { photoId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        photoId_userId: {
          photoId,
          userId,
        },
      },
    })

    if (!favorite) {
      return notFound(res, '收藏不存在')
    }

    await prisma.favorite.delete({
      where: {
        photoId_userId: {
          photoId,
          userId,
        },
      },
    })

    return success(res, null, '取消收藏成功')
  } catch (error) {
    console.error('取消收藏失败:', error)
    return fail(res, '取消收藏失败', 500)
  }
})

// 检查是否已收藏
router.get('/check/:photoId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const { photoId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        photoId_userId: {
          photoId,
          userId,
        },
      },
    })

    return success(res, { isFavorited: !!favorite })
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    return fail(res, '检查收藏状态失败', 500)
  }
})

export default router
