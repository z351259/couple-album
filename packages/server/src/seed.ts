import bcrypt from 'bcryptjs'
import prisma from './config/database.js'

async function main() {
  console.log('🌱 开始填充数据库...')

  // 创建测试用户
  const passwordHash = await bcrypt.hash('123456', 10)

  const user1 = await prisma.user.upsert({
    where: { username: 'boy' },
    update: {},
    create: {
      username: 'boy',
      passwordHash,
      nickname: '小明',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { username: 'girl' },
    update: {},
    create: {
      username: 'girl',
      passwordHash,
      nickname: '小红',
    },
  })

  console.log('✅ 用户创建完成:', { user1: user1.username, user2: user2.username })

  // 创建示例相册
  const album = await prisma.album.create({
    data: {
      name: '我们的旅行',
      description: '记录每一次美好的旅行',
      createdBy: user1.id,
    },
  })

  console.log('✅ 相册创建完成:', album.name)

  console.log('🎉 数据库填充完成！')
}

main()
  .catch((e) => {
    console.error('❌ 数据库填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
