// @ts-nocheck
import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { unauthorized, forbidden } from '../utils/response.js'

export interface AuthRequest extends Request {
  userId: string
  userRole: string
}

export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, '请先登录')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string }
    ;(req as AuthRequest).userId = decoded.userId
    ;(req as AuthRequest).userRole = decoded.role || 'user'
    next()
  } catch (error) {
    return unauthorized(res, 'token无效或已过期')
  }
}

export const adminMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as AuthRequest).userRole
  if (role !== 'admin') {
    return forbidden(res, '需要管理员权限')
  }
  next()
}
