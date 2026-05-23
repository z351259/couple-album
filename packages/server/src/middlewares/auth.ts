import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { unauthorized } from '../utils/response.js'

export interface AuthRequest extends Request {
  userId: string
}

export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, '请先登录')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    ;(req as AuthRequest).userId = decoded.userId
    next()
  } catch (error) {
    return unauthorized(res, 'token无效或已过期')
  }
}
