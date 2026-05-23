// @ts-nocheck
import express, { Request, Response, NextFunction, Express } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/index.js'
import authRoutes from './routes/auth.js'
import photoRoutes from './routes/photo.js'
import albumRoutes from './routes/album.js'
import commentRoutes from './routes/comment.js'
import shareRoutes from './routes/share.js'
import favoriteRoutes from './routes/favorite.js'
import adminRoutes from './routes/admin.js'
import coupleRoutes from './routes/couple.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app: Express = express()

// CORS 配置 - 限制允许的来源
const allowedOrigins = config.cors.origin.split(',').map(o => o.trim())
app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如移动端、Postman）
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true)
    } else {
      callback(new Error('不允许的来源'))
    }
  },
  credentials: true,
}))

// 安全头
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件 - 上传的照片
app.use('/uploads', express.static(path.resolve(__dirname, config.upload.dir), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000')
  }
}))

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/photos', photoRoutes)
app.use('/api/albums', albumRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/shares', shareRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/couple', coupleRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('未捕获的错误:', err)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

export default app
