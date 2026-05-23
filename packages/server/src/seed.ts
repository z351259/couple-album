import bcrypt from 'bcryptjs'
import prisma from './config/database.js'

async function main() {
  console.log('🌱 开始填充数据库...')

  // 创建 root 管理员
  const existing = await prisma.user.findUnique({ where: { username: 'root' } })
  if (existing) {
    console.log('root 用户已存在，更新为管理员')
    await prisma.user.update({ where: { username: 'root' }, data: { role: 'admin' } })
  } else {
    const passwordHash = await bcrypt.hash('root', 10)
    const user = await prisma.user.create({
      data: {
        username: 'root',
        passwordHash,
        nickname: '管理员',
        role: 'admin',
      },
    })
    console.log('✅ root 管理员创建成功:', user.id)
  }

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
