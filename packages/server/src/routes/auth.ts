// @ts-nocheck
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'
import { config } from '../config/index.js'
import { success, fail, unauthorized } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'
import { getPartnerId } from '../utils/couple.js'

const router = Router()

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, nickname } = req.body

    if (!username || !password || !nickname) {
      return fail(res, '用户名、密码和昵称都是必填的')
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return fail(res, '用户名已存在')
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 第一个注册的用户自动成为管理员
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? 'admin' : 'user'

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        nickname,
        role,
      },
    })

    // 生成 token
    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })

    return success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('注册失败:', error)
    return fail(res, '注册失败', 500)
  }
})

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return fail(res, '用户名和密码都是必填的')
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return unauthorized(res, '用户名或密码错误')
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return unauthorized(res, '用户名或密码错误')
    }

    // 生成 token
    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })

    return success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('登录失败:', error)
    return fail(res, '登录失败', 500)
  }
})

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        coupleId: true,
        anniversaryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return fail(res, '用户不存在', 404)
    }

    const partnerId = await getPartnerId(req.userId)

    return success(res, { ...user, partnerId })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return fail(res, '获取用户信息失败', 500)
  }
})

// 更新用户信息
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { nickname, avatar, anniversaryDate } = req.body

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(avatar !== undefined && { avatar }),
        ...(anniversaryDate !== undefined && { anniversaryDate: anniversaryDate ? new Date(anniversaryDate) : null }),
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        anniversaryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return success(res, user)
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return fail(res, '更新用户信息失败', 500)
  }
})

export default router
