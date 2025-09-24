import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 导入路由
import notesRouter from './routes/notes.js'
import aiRouter from './routes/ai.js'
import todosRouter from './routes/todos.js'

// 导入服务
import { getSettingsService } from './services/settingsService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置环境变量
dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 5001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
})

// AI API的特殊速率限制
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 限制每个IP 1分钟内最多10个AI请求
  message: {
    error: 'AI请求过于频繁，请稍后再试'
  }
})

app.use(limiter)

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

// 解析JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 注册路由
app.use('/api/notes', notesRouter)
app.use('/api/ai', aiLimiter, aiRouter)
app.use('/api/todos', todosRouter)

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.originalUrl 
  })
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  
  // 不要在生产环境中暴露错误详情
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : '服务器内部错误',
    ...(isDevelopment && { stack: err.stack })
  })
})

// 初始化设置服务并启动服务器
async function startServer() {
  try {
    // 初始化设置服务，从数据库加载API密钥
    const settingsService = getSettingsService()
    await settingsService.initializeApiKey()
    
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`)
      console.log(`📝 记事本API: http://localhost:${PORT}/api/notes`)
      console.log(`🤖 AI助手API: http://localhost:${PORT}/api/ai`)
      console.log(`💚 健康检查: http://localhost:${PORT}/health`)
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 开发模式已启用')
      }
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...')
  process.exit(0)
})