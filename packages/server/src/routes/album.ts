// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express'
import prisma from '../config/database.js'
import { success, fail, notFound } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'
import { getCoupleUserIds } from '../utils/couple.js'

const router = Router()

// 获取所有相册
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const userIds = await getCoupleUserIds(userId)
    const albums = await prisma.album.findMany({
      where: { createdBy: { in: userIds } },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    })

    return success(res, albums)
  } catch (error) {
    console.error('获取相册失败:', error)
    return fail(res, '获取相册失败', 500)
  }
})

// 获取单个相册
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const album = await prisma.album.findUnique({
      where: { id: req.params.id },
      include: {
        photos: {
          orderBy: { sortOrder: 'desc' },
        },
      },
    })

    if (!album) {
      return notFound(res, '相册不存在')
    }

    const userIds = await getCoupleUserIds(userId)
    if (!userIds.includes(album.createdBy)) {
      return fail(res, '无权查看此相册', 403)
    }

    return success(res, album)
  } catch (error) {
    console.error('获取相册失败:', error)
    return fail(res, '获取相册失败', 500)
  }
})

// 创建相册
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const { name, description } = req.body

    if (!name) {
      return fail(res, '相册名称是必填的')
    }

    const album = await prisma.album.create({
      data: {
        name,
        description,
        createdBy: userId,
        sortOrder: Math.floor(Date.now() / 1000),
      },
    })

    return success(res, album)
  } catch (error) {
    console.error('创建相册失败:', error)
    return fail(res, '创建相册失败', 500)
  }
})

// 更新相册
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const { name, description, coverUrl } = req.body

    // 检查相册所有权
    const existingAlbum = await prisma.album.findUnique({
      where: { id: req.params.id },
    })

    if (!existingAlbum) {
      return notFound(res, '相册不存在')
    }

    if (existingAlbum.createdBy !== userId) {
      return fail(res, '只能修改自己创建的相册', 403)
    }

    const album = await prisma.album.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        coverUrl,
      },
    })

    return success(res, album)
  } catch (error) {
    console.error('更新相册失败:', error)
    return fail(res, '更新相册失败', 500)
  }
})

// 删除相册
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest

    // 检查相册所有权
    const existingAlbum = await prisma.album.findUnique({
      where: { id: req.params.id },
    })

    if (!existingAlbum) {
      return notFound(res, '相册不存在')
    }

    if (existingAlbum.createdBy !== userId) {
      return fail(res, '只能删除自己创建的相册', 403)
    }

    // 将相册中的照片移出相册
    await prisma.photo.updateMany({
      where: { albumId: req.params.id },
      data: { albumId: null },
    })

    // 删除相册
    await prisma.album.delete({
      where: { id: req.params.id },
    })

    return success(res, null, '删除成功')
  } catch (error) {
    console.error('删除相册失败:', error)
    return fail(res, '删除相册失败', 500)
  }
})

export default router
