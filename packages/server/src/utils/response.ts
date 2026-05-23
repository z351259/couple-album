import { Response } from 'express'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export const success = <T>(res: Response, data?: T, message?: string) => {
  const response: ApiResponse<T> = { success: true }
  if (data !== undefined) response.data = data
  if (message) response.message = message
  return res.json(response)
}

export const fail = (res: Response, message: string, statusCode: number = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  })
}

export const unauthorized = (res: Response, message: string = '未授权') => {
  return fail(res, message, 401)
}

export const forbidden = (res: Response, message: string = '禁止访问') => {
  return fail(res, message, 403)
}

export const notFound = (res: Response, message: string = '资源不存在') => {
  return fail(res, message, 404)
}

export const serverError = (res: Response, error: any) => {
  console.error('服务器错误:', error)
  return fail(res, '服务器内部错误', 500)
}
