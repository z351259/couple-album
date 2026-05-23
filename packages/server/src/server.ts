import app from './app.js'
import { config } from './config/index.js'

const startServer = async () => {
  try {
    app.listen(config.port, config.host, () => {
      console.log(`🚀 服务器运行在 http://${config.host}:${config.port}`)
      console.log(`📸 情侣相册后端服务已启动`)
      console.log(`🔗 API 地址: http://localhost:${config.port}/api`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()
