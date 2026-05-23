import { Router, Response } from 'express'
import prisma from '../config/database.js'
import { success, fail, notFound } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'

const router = Router()

// 获取照片的评论
router.get('/photo/:photoId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { photoId: req.params.photoId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return success(res, comments)
  } catch (error) {
    console.error('获取评论失败:', error)
    return fail(res, '获取评论失败', 500)
  }
})

// 创建评论
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content, photoId } = req.body

    if (!content || !photoId) {
      return fail(res, '评论内容和照片ID都是必填的')
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        photoId,
        userId: req.userId!,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    return success(res, comment)
  } catch (error) {
    console.error('创建评论失败:', error)
    return fail(res, '创建评论失败', 500)
  }
})

// 删除评论
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    })

    if (!comment) {
      return notFound(res, '评论不存在')
    }

    // 只能删除自己的评论
    if (comment.userId !== req.userId) {
      return fail(res, '只能删除自己的评论', 403)
    }

    await prisma.comment.delete({
      where: { id: req.params.id },
    })

    return success(res, null, '删除成功')
  } catch (error) {
    console.error('删除评论失败:', error)
    return fail(res, '删除评论失败', 500)
  }
})

export default router
