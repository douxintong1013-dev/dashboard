import express from 'express'
import { AIService } from '../services/aiService.js'
import { getSettingsService } from '../services/settingsService.js'

const router = express.Router()
const aiService = new AIService()
const settingsService = getSettingsService()

// AI聊天接口
router.post('/chat', async (req, res) => {
  try {
    const { message, noteContent, noteTitle } = req.body
    
    // 验证输入
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      })
    }
    
    if (message.length > 4000) {
      return res.status(400).json({
        success: false,
        error: '消息长度不能超过4000个字符'
      })
    }
    
    // 检查API密钥
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const response = await aiService.chat({
      message: message.trim(),
      noteContent: noteContent || '',
      noteTitle: noteTitle || ''
    })
    
    res.json({
      success: true,
      response
    })
  } catch (error) {
    console.error('AI聊天失败:', error)
    
    // 根据错误类型返回不同的错误信息
    if (error.message.includes('API key')) {
      return res.status(401).json({
        success: false,
        error: 'OpenAI API密钥无效'
      })
    }
    
    if (error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'API配额已用完，请稍后再试'
      })
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: '请求过于频繁，请稍后再试'
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'AI服务暂时不可用，请稍后再试'
    })
  }
})

// AI文本改进接口
router.post('/improve', async (req, res) => {
  try {
    const { text, type = 'general' } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      })
    }
    
    if (text.length > 8000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过8000个字符'
      })
    }
    
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const improvedText = await aiService.improveText(text.trim(), type)
    
    res.json({
      success: true,
      original: text,
      improved: improvedText,
      type
    })
  } catch (error) {
    console.error('AI文本改进失败:', error)
    res.status(500).json({
      success: false,
      error: 'AI文本改进服务暂时不可用'
    })
  }
})

// AI文本总结接口
router.post('/summarize', async (req, res) => {
  try {
    const { text, length = 'medium' } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      })
    }
    
    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过10000个字符'
      })
    }
    
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const summary = await aiService.summarizeText(text.trim(), length)
    
    res.json({
      success: true,
      original: text,
      summary,
      length
    })
  } catch (error) {
    console.error('AI文本总结失败:', error)
    res.status(500).json({
      success: false,
      error: 'AI文本总结服务暂时不可用'
    })
  }
})

// AI翻译接口
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'en', sourceLanguage = 'auto' } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      })
    }
    
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过5000个字符'
      })
    }
    
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const translation = await aiService.translateText(
      text.trim(), 
      targetLanguage, 
      sourceLanguage
    )
    
    res.json({
      success: true,
      original: text,
      translation,
      sourceLanguage,
      targetLanguage
    })
  } catch (error) {
    console.error('AI翻译失败:', error)
    res.status(500).json({
      success: false,
      error: 'AI翻译服务暂时不可用'
    })
  }
})

// AI文本润色接口
router.post('/polish', async (req, res) => {
  try {
    const { text } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      })
    }
    
    if (text.length > 8000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过8000个字符'
      })
    }
    
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const polishedText = await aiService.polishText(text.trim())
    
    res.json({
      success: true,
      original: text,
      polished: polishedText
    })
  } catch (error) {
    console.error('AI文本润色失败:', error)
    res.status(500).json({
      success: false,
      error: 'AI文本润色服务暂时不可用'
    })
  }
})

// AI文本改写接口
router.post('/rewrite', async (req, res) => {
  try {
    const { text, style = 'formal' } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      })
    }
    
    if (text.length > 8000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过8000个字符'
      })
    }
    
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const rewrittenText = await aiService.rewriteText(text.trim(), style)
    
    res.json({
      success: true,
      original: text,
      rewritten: rewrittenText,
      style
    })
  } catch (error) {
    console.error('AI文本改写失败:', error)
    res.status(500).json({
      success: false,
      error: 'AI文本改写服务暂时不可用'
    })
  }
})

// AI自动标签生成接口
router.post('/generate-tags', async (req, res) => {
  try {
    const { title, content } = req.body
    
    if ((!title || title.trim().length === 0) && (!content || content.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: '标题或内容不能都为空'
      })
    }
    
    const text = `${title || ''}\n${content || ''}`.trim()
    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过10000个字符'
      })
    }
    
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const tags = await aiService.generateTags(title || '', content || '')
    
    res.json({
      success: true,
      tags
    })
  } catch (error) {
    console.error('AI标签生成失败:', error)
    res.status(500).json({
      success: false,
      error: 'AI标签生成服务暂时不可用'
    })
  }
})

// 语义搜索接口
router.post('/semantic-search', async (req, res) => {
  try {
    const { query, notes } = req.body
    
    // 验证输入
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '搜索查询不能为空'
      })
    }
    
    if (query.length > 200) {
      return res.status(400).json({
        success: false,
        error: '搜索查询长度不能超过200个字符'
      })
    }
    
    if (!notes || !Array.isArray(notes)) {
      return res.status(400).json({
        success: false,
        error: '笔记数据格式错误'
      })
    }
    
    // 检查API密钥
    const apiKey = await settingsService.getApiKey()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置，请在设置页面配置Kimi API密钥'
      })
    }
    
    const results = await aiService.semanticSearch(query.trim(), notes)
    
    res.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('语义搜索失败:', error)
    res.status(500).json({
      success: false,
      error: '语义搜索失败，请稍后重试'
    })
  }
})

// AI服务状态检查
router.get('/status', async (req, res) => {
  try {
    const hasApiKey = await settingsService.hasApiKey()
    
    res.json({
      success: true,
      hasApiKey,
      status: hasApiKey ? 'ready' : 'not_configured'
    })
  } catch (error) {
    console.error('获取AI服务状态失败:', error)
    res.status(500).json({
      success: false,
      error: '获取服务状态失败'
    })
  }
})

// 设置API密钥
router.post('/set-key', async (req, res) => {
  try {
    const { apiKey } = req.body
    
    // 验证输入
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'API密钥不能为空'
      })
    }
    
    // 验证API密钥格式 (Kimi API密钥通常以sk-开头，但格式可能不同)
    const trimmedKey = apiKey.trim()
    if (trimmedKey.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'API密钥格式不正确，密钥长度过短'
      })
    }
    
    // 使用设置服务保存API密钥
    await settingsService.setApiKey(trimmedKey)
    
    res.json({
      success: true,
      message: 'API密钥设置成功'
    })
  } catch (error) {
    console.error('设置API密钥失败:', error)
    res.status(500).json({
      success: false,
      error: '设置API密钥失败'
    })
  }
})

// 删除API密钥
router.delete('/remove-key', async (req, res) => {
  try {
    // 使用设置服务删除API密钥
    await settingsService.removeApiKey()
    
    res.json({
      success: true,
      message: 'API密钥删除成功'
    })
  } catch (error) {
    console.error('删除API密钥失败:', error)
    res.status(500).json({
      success: false,
      error: '删除API密钥失败'
    })
  }
})

export default router