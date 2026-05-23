import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 必需的环境变量检查
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ 缺少必需的环境变量: ${varName}`)
    process.exit(1)
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d',
  },

  upload: {
    dir: path.resolve(__dirname, process.env.UPLOAD_DIR || '../../uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
  },

  image: {
    maxWidth: parseInt(process.env.MAX_WIDTH || '3840', 10), // 4K
    maxHeight: parseInt(process.env.MAX_HEIGHT || '2160', 10), // 4K
    quality: 85,
    thumbnailSize: 200,
    mediumSize: 800,
    largeSize: 1920,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
}
