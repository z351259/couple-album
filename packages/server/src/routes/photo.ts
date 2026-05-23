import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database.js'
import { config } from '../config/index.js'
import { success, fail, notFound, serverError } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middlewares/auth.js'

const router = Router()

// 配置 multer
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片文件'))
    }
  },
})

// 确保上传目录存在
const ensureUploadDirs = async () => {
  const dirs = ['original', 'large', 'medium', 'thumbnail']
  for (const dir of dirs) {
    await fs.mkdir(path.join(config.upload.dir, dir), { recursive: true })
  }
}

// 生成模糊哈希（简化版）
const generateBlurhash = async (buffer: Buffer): Promise<string> => {
  // 使用简单的颜色平均值作为占位符
  const { data } = await sharp(buffer)
    .resize(10, 10, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const r = data.filter((_, i) => i % 3 === 0).reduce((a, b) => a + b, 0) / (data.length / 3)
  const g = data.filter((_, i) => i % 3 === 1).reduce((a, b) => a + b, 0) / (data.length / 3)
  const b = data.filter((_, i) => i % 3 === 2).reduce((a, b) => a + b, 0) / (data.length / 3)

  return Math.round(r).toString(16).padStart(2, '0') +
         Math.round(g).toString(16).padStart(2, '0') +
         Math.round(b).toString(16).padStart(2, '0')
}

// 处理图片
const processImage = async (buffer: Buffer, filename: string) => {
  const id = uuidv4()
  const ext = path.extname(filename)
  const baseFilename = `${id}${ext}`

  // 获取原图信息
  const metadata = await sharp(buffer).metadata()

  // 压缩到4K分辨率
  let processedBuffer = buffer
  if ((metadata.width && metadata.width > config.image.maxWidth) ||
      (metadata.height && metadata.height > config.image.maxHeight)) {
    processedBuffer = await sharp(buffer)
      .resize(config.image.maxWidth, config.image.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: config.image.quality })
      .toBuffer()
  }

  // 保存原图
  await fs.writeFile(path.join(config.upload.dir, 'original', baseFilename), processedBuffer)

  // 生成大图 (1920px)
  const largeBuffer = await sharp(processedBuffer)
    .resize(config.image.largeSize, config.image.largeSize, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer()
  await fs.writeFile(path.join(config.upload.dir, 'large', baseFilename), largeBuffer)

  // 生成中图 (800px)
  const mediumBuffer = await sharp(processedBuffer)
    .resize(config.image.mediumSize, config.image.mediumSize, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 75 })
    .toBuffer()
  await fs.writeFile(path.join(config.upload.dir, 'medium', baseFilename), mediumBuffer)

  // 生成缩略图 (200px)
  const thumbnailBuffer = await sharp(processedBuffer)
    .resize(config.image.thumbnailSize, config.image.thumbnailSize, {
      fit: 'cover',
    })
    .jpeg({ quality: 70 })
    .toBuffer()
  await fs.writeFile(path.join(config.upload.dir, 'thumbnail', baseFilename), thumbnailBuffer)

  // 生成模糊哈希
  const blurhash = await generateBlurhash(thumbnailBuffer)

  // 获取处理后的尺寸
  const processedMetadata = await sharp(processedBuffer).metadata()

  return {
    id,
    filename: baseFilename,
    originalUrl: `/uploads/original/${baseFilename}`,
    largeUrl: `/uploads/large/${baseFilename}`,
    mediumUrl: `/uploads/medium/${baseFilename}`,
    thumbnailUrl: `/uploads/thumbnail/${baseFilename}`,
    fileSize: processedBuffer.length,
    width: processedMetadata.width || 0,
    height: processedMetadata.height || 0,
    blurhash,
  }
}

// 上传照片
router.post('/upload', authMiddleware, upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    if (!req.file) {
      return fail(res, '请选择要上传的照片')
    }

    await ensureUploadDirs()

    const imageData = await processImage(req.file.buffer, req.file.originalname)

    // 保存到数据库
    const photo = await prisma.photo.create({
      data: {
        ...imageData,
        uploadedBy: userId,
        sortOrder: Math.floor(Date.now() / 1000),
      },
    })

    return success(res, photo)
  } catch (error) {
    console.error('上传失败:', error)
    return fail(res, '上传失败', 500)
  }
})

// 获取照片列表
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const albumId = req.query.albumId as string | undefined

    const where: any = {}
    if (albumId) where.albumId = albumId

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        orderBy: { sortOrder: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.photo.count({ where }),
    ])

    return success(res, {
      items: photos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('获取照片失败:', error)
    return fail(res, '获取照片失败', 500)
  }
})

// 获取单张照片
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
    })

    if (!photo) {
      return notFound(res, '照片不存在')
    }

    return success(res, photo)
  } catch (error) {
    console.error('获取照片失败:', error)
    return fail(res, '获取照片失败', 500)
  }
})

// 更新照片信息
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const { mood, mood2, secretMessage, tags, location, latitude, longitude, albumId } = req.body

    // 检查照片所有权
    const existingPhoto = await prisma.photo.findUnique({
      where: { id: req.params.id },
    })

    if (!existingPhoto) {
      return notFound(res, '照片不存在')
    }

    if (existingPhoto.uploadedBy !== userId) {
      return fail(res, '只能修改自己上传的照片', 403)
    }

    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data: {
        mood,
        mood2,
        secretMessage,
        tags,
        location,
        latitude,
        longitude,
        albumId,
      },
    })

    return success(res, photo)
  } catch (error) {
    console.error('更新照片失败:', error)
    return fail(res, '更新照片失败', 500)
  }
})

// 记录访问
router.post('/:id/visit', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const photoId = req.params.id

    // 检查照片是否存在
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return notFound(res, '照片不存在')
    }

    // 记录访问（upsert - 如果已存在则更新时间）
    const visit = await prisma.photoVisit.upsert({
      where: {
        photoId_userId: {
          photoId,
          userId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        photoId,
        userId,
      },
    })

    return success(res, visit)
  } catch (error) {
    console.error('记录访问失败:', error)
    return fail(res, '记录访问失败', 500)
  }
})

// 获取照片访问记录
router.get('/:id/visits', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photoId = req.params.id

    const visits = await prisma.photoVisit.findMany({
      where: { photoId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
    })

    return success(res, visits)
  } catch (error) {
    console.error('获取访问记录失败:', error)
    return fail(res, '获取访问记录失败', 500)
  }
})

// 删除照片
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
    })

    if (!photo) {
      return notFound(res, '照片不存在')
    }

    if (photo.uploadedBy !== userId) {
      return fail(res, '只能删除自己上传的照片', 403)
    }

    // 删除文件
    const dirs = ['original', 'large', 'medium', 'thumbnail']
    for (const dir of dirs) {
      const filePath = path.join(config.upload.dir, dir, photo.filename)
      await fs.unlink(filePath).catch(() => {})
    }

    // 删除数据库记录
    await prisma.photo.delete({
      where: { id: req.params.id },
    })

    return success(res, null, '删除成功')
  } catch (error) {
    console.error('删除照片失败:', error)
    return fail(res, '删除照片失败', 500)
  }
})

// 更新排序
router.put('/sort', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photos } = req.body

    if (!Array.isArray(photos)) {
      return fail(res, '无效的排序数据')
    }

    // 批量更新
    await Promise.all(
      photos.map((p: { id: string; sortOrder: number }) =>
        prisma.photo.update({
          where: { id: p.id },
          data: { sortOrder: p.sortOrder },
        })
      )
    )

    return success(res, null, '排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    return fail(res, '更新排序失败', 500)
  }
})

export default router
