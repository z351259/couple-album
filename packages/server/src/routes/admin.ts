// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'
import { success, fail, notFound } from '../utils/response.js'
import { authMiddleware, adminMiddleware, AuthRequest } from '../middlewares/auth.js'

const router = Router()

// 所有 admin 路由都需要认证 + 管理员权限
router.use(authMiddleware, adminMiddleware)

// ============ 仪表盘统计 ============

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [users, photos, albums, comments, shareLinks] = await Promise.all([
      prisma.user.count(),
      prisma.photo.count(),
      prisma.album.count(),
      prisma.comment.count(),
      prisma.shareLink.count(),
    ])

    const totalSize = await prisma.photo.aggregate({
      _sum: { fileSize: true },
    })

    return success(res, {
      users,
      photos,
      albums,
      comments,
      shareLinks,
      totalFileSize: totalSize._sum.fileSize || 0,
    })
  } catch (error) {
    console.error('获取统计失败:', error)
    return fail(res, '获取统计失败', 500)
  }
})

// ============ 用户管理 ============

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        anniversaryDate: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { photos: true, albums: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return success(res, users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return fail(res, '获取用户列表失败', 500)
  }
})

router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body
    if (!role || !['user', 'admin'].includes(role)) {
      return fail(res, '无效的角色')
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, username: true, nickname: true, role: true },
    })
    return success(res, user)
  } catch (error) {
    console.error('更新用户角色失败:', error)
    return fail(res, '更新用户角色失败', 500)
  }
})

router.put('/users/:id/password', async (req: Request, res: Response) => {
  try {
    const { password } = req.body
    if (!password || password.length < 4) {
      return fail(res, '密码至少4位')
    }
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash },
    })
    return success(res, null, '密码已重置')
  } catch (error) {
    console.error('重置密码失败:', error)
    return fail(res, '重置密码失败', 500)
  }
})

router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req as AuthRequest
  try {
    if (req.params.id === userId) {
      return fail(res, '不能删除自己')
    }
    await prisma.user.delete({ where: { id: req.params.id } })
    return success(res, null, '用户已删除')
  } catch (error) {
    console.error('删除用户失败:', error)
    return fail(res, '删除用户失败', 500)
  }
})

// ============ 照片管理 ============

router.get('/photos', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const skip = (page - 1) * limit

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, username: true } },
          album: { select: { id: true, name: true } },
          _count: { select: { comments: true, favorites: true } },
        },
      }),
      prisma.photo.count(),
    ])

    return success(res, { items: photos.map((p: any) => {
      if (typeof p.tags === 'string') try { p.tags = JSON.parse(p.tags) } catch { p.tags = [] }
      return p
    }), total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('获取照片列表失败:', error)
    return fail(res, '获取照片列表失败', 500)
  }
})

router.delete('/photos/:id', async (req: Request, res: Response) => {
  try {
    const photo = await prisma.photo.findUnique({ where: { id: req.params.id } })
    if (!photo) return notFound(res, '照片不存在')

    // 删除文件
    const fs = await import('fs/promises')
    const path = await import('path')
    const uploadDir = path.resolve(process.cwd(), '../../uploads')
    const files = [
      path.join(uploadDir, 'original', photo.filename),
      path.join(uploadDir, 'large', photo.filename),
      path.join(uploadDir, 'medium', photo.filename),
      path.join(uploadDir, 'thumbnail', photo.filename),
    ]
    await Promise.all(files.map((f) => fs.unlink(f).catch(() => {})))

    await prisma.photo.delete({ where: { id: req.params.id } })
    return success(res, null, '照片已删除')
  } catch (error) {
    console.error('删除照片失败:', error)
    return fail(res, '删除照片失败', 500)
  }
})

// ============ 相册管理 ============

router.get('/albums', async (_req: Request, res: Response) => {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true } },
        _count: { select: { photos: true } },
      },
    })
    return success(res, albums)
  } catch (error) {
    console.error('获取相册列表失败:', error)
    return fail(res, '获取相册列表失败', 500)
  }
})

router.delete('/albums/:id', async (req: Request, res: Response) => {
  try {
    // 把相册里的照片的 albumId 设为 null
    await prisma.photo.updateMany({
      where: { albumId: req.params.id },
      data: { albumId: null },
    })
    await prisma.album.delete({ where: { id: req.params.id } })
    return success(res, null, '相册已删除')
  } catch (error) {
    console.error('删除相册失败:', error)
    return fail(res, '删除相册失败', 500)
  }
})

// ============ 评论管理 ============

router.get('/comments', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const skip = (page - 1) * limit

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true } },
          photo: { select: { id: true, filename: true, thumbnailUrl: true } },
        },
      }),
      prisma.comment.count(),
    ])

    return success(res, { items: comments, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('获取评论列表失败:', error)
    return fail(res, '获取评论列表失败', 500)
  }
})

router.delete('/comments/:id', async (req: Request, res: Response) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } })
    return success(res, null, '评论已删除')
  } catch (error) {
    console.error('删除评论失败:', error)
    return fail(res, '删除评论失败', 500)
  }
})

// ============ 分享链接管理 ============

router.get('/shares', async (_req: Request, res: Response) => {
  try {
    const shares = await prisma.shareLink.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true } },
      },
    })
    return success(res, shares)
  } catch (error) {
    console.error('获取分享链接失败:', error)
    return fail(res, '获取分享链接失败', 500)
  }
})

router.put('/shares/:id/deactivate', async (req: Request, res: Response) => {
  try {
    await prisma.shareLink.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })
    return success(res, null, '已停用')
  } catch (error) {
    console.error('停用分享链接失败:', error)
    return fail(res, '停用分享链接失败', 500)
  }
})

router.delete('/shares/:id', async (req: Request, res: Response) => {
  try {
    await prisma.shareLink.delete({ where: { id: req.params.id } })
    return success(res, null, '分享链接已删除')
  } catch (error) {
    console.error('删除分享链接失败:', error)
    return fail(res, '删除分享链接失败', 500)
  }
})

export default router
