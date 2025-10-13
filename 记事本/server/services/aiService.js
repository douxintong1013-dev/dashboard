import OpenAI from 'openai'
import { getSettingsService } from './settingsService.js'

export class AIService {
  constructor() {
    this.openai = null
    this.settingsService = getSettingsService()
    this.initializeOpenAI()
  }

  // 初始化Kimi客户端
  async initializeOpenAI() {
    try {
      const apiKey = await this.settingsService.getApiKey()
      if (apiKey) {
        this.openai = new OpenAI({
          apiKey: apiKey,
          baseURL: 'https://api.moonshot.cn/v1',
        })
      } else {
        console.warn('⚠️  Kimi API密钥未设置，AI功能将不可用')
        this.openai = null
      }
    } catch (error) {
      console.error('初始化Kimi客户端失败:', error)
      this.openai = null
    }
  }

  // 确保OpenAI客户端已初始化
  async ensureInitialized() {
    if (!this.openai) {
      await this.initializeOpenAI()
    }
    return this.openai !== null
  }

  // 检查AI服务状态
  async checkStatus() {
    if (!(await this.ensureInitialized())) {
      return false
    }

    try {
      // 发送一个简单的测试请求
      await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
      return true
    } catch (error) {
      console.error('AI服务状态检查失败:', error.message)
      return false
    }
  }

  // AI聊天功能
  async chat({ message, noteContent, noteTitle }) {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const systemPrompt = this.buildSystemPrompt(noteContent, noteTitle)
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.6,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      return completion.choices[0].message.content.trim()
    } catch (error) {
      console.error('AI聊天失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 文本改进功能
  async improveText(text, type = 'general') {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const prompt = this.buildImprovePrompt(text, type)
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: '你是一个专业的文本编辑助手，专门帮助用户改进文本质量。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.6
      })

      return completion.choices[0].message.content.trim()
    } catch (error) {
      console.error('文本改进失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 文本润色功能
  async polishText(text) {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const prompt = `请对以下文本进行润色，使其更加流畅、优雅和易读。保持原意不变，但改善表达方式、语法和用词：

${text}

请直接返回润色后的文本，不需要额外的解释。`
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: '你是一个专业的文本润色专家，擅长改善文本的表达质量和可读性。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.6
      })

      return completion.choices[0].message.content.trim()
    } catch (error) {
      console.error('文本润色失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 文本改写功能
  async rewriteText(text, style = 'formal') {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const prompt = this.buildRewritePrompt(text, style)
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: '你是一个专业的文本改写专家，能够根据不同风格要求重新表达文本内容。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.6
      })

      return completion.choices[0].message.content.trim()
    } catch (error) {
      console.error('文本改写失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 自动标签生成功能
  async generateTags(title, content) {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const prompt = this.buildTagsPrompt(title, content)
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: '你是一个专业的内容分析专家，擅长为文本内容生成准确、相关的标签。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.6
      })

      const response = completion.choices[0].message.content.trim()
      // 解析返回的标签，假设返回格式为逗号分隔的标签
      const tags = response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      return tags.slice(0, 8) // 最多返回8个标签
    } catch (error) {
      console.error('标签生成失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 语义搜索功能
  async semanticSearch(query, notes) {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      // 为每个笔记计算相关性分数
      const scoredNotes = []
      
      for (const note of notes) {
        const prompt = this.buildSemanticSearchPrompt(query, note)
        
        const completion = await this.openai.chat.completions.create({
          model: 'kimi-k2-turbo-preview',
          messages: [
            { role: 'system', content: '你是一个专业的文本相关性分析专家，能够准确评估查询与文档的相关性。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 50,
          temperature: 0.6
        })

        const response = completion.choices[0].message.content.trim()
        const score = this.parseRelevanceScore(response)
        
        if (score > 0.3) { // 只返回相关性大于0.3的结果
          scoredNotes.push({
            ...note,
            relevanceScore: score
          })
        }
      }
      
      // 按相关性分数排序
      return scoredNotes.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } catch (error) {
      console.error('语义搜索失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 文本总结功能
  async summarizeText(text, length = 'medium') {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const prompt = this.buildSummarizePrompt(text, length)
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: '你是一个专业的文本总结助手，能够准确提取文本的核心要点。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.getSummaryMaxTokens(length),
        temperature: 0.6
      })

      return completion.choices[0].message.content.trim()
    } catch (error) {
      console.error('文本总结失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 翻译功能
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    if (!(await this.ensureInitialized())) {
      throw new Error('AI服务未配置')
    }

    try {
      const prompt = this.buildTranslatePrompt(text, targetLanguage, sourceLanguage)
      
      const completion = await this.openai.chat.completions.create({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: '你是一个专业的翻译助手，能够准确翻译各种语言。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: Math.min(text.length * 2, 1500),
        temperature: 0.6
      })

      return completion.choices[0].message.content.trim()
    } catch (error) {
      console.error('翻译失败:', error)
      throw this.handleOpenAIError(error)
    }
  }

  // 构建系统提示词
  buildSystemPrompt(noteContent, noteTitle) {
    let systemPrompt = `你是一个智能的写作助手，专门帮助用户改进和完善他们的笔记内容。你的任务是：

1. 提供有用的写作建议和改进意见
2. 帮助用户组织和结构化内容
3. 纠正语法和拼写错误
4. 提供相关的信息和扩展内容
5. 回答用户关于笔记内容的问题

请用中文回复，保持友好和专业的语调。`

    if (noteTitle) {
      systemPrompt += `\n\n当前笔记标题：${noteTitle}`
    }

    if (noteContent) {
      systemPrompt += `\n\n当前笔记内容：\n${noteContent}`
    }

    return systemPrompt
  }

  // 构建文本改进提示词
  buildImprovePrompt(text, type) {
    const typePrompts = {
      grammar: '请检查并纠正以下文本的语法、拼写和标点符号错误：',
      clarity: '请改进以下文本，使其更加清晰易懂：',
      style: '请改进以下文本的写作风格，使其更加优雅和专业：',
      structure: '请重新组织以下文本的结构，使其更有逻辑性：',
      general: '请全面改进以下文本，包括语法、清晰度、风格和结构：'
    }

    const prompt = typePrompts[type] || typePrompts.general
    return `${prompt}\n\n${text}\n\n请直接返回改进后的文本，不需要额外的解释。`
  }

  // 构建改写提示词
  buildRewritePrompt(text, style) {
    const stylePrompts = {
      formal: '请将以下文本改写为正式、专业的风格：',
      casual: '请将以下文本改写为轻松、口语化的风格：',
      academic: '请将以下文本改写为学术、严谨的风格：',
      creative: '请将以下文本改写为富有创意、生动的风格：',
      concise: '请将以下文本改写为简洁、精炼的风格：',
      detailed: '请将以下文本改写为详细、丰富的风格：'
    }

    const prompt = stylePrompts[style] || stylePrompts.formal
    return `${prompt}\n\n${text}\n\n请保持原文的核心意思，但用不同的表达方式重新组织语言。直接返回改写后的文本，不需要额外的解释。`
  }

  // 构建标签生成提示词
  buildTagsPrompt(title, content) {
    const text = `标题：${title}\n\n内容：${content}`.trim()
    return `请为以下笔记内容生成3-8个相关的标签。标签应该准确反映内容的主题、类别和关键概念。\n\n${text}\n\n要求：\n1. 标签应该简洁明了，通常1-3个字\n2. 优先选择具体的、有意义的标签\n3. 包含主题标签、类别标签和关键词标签\n4. 用逗号分隔标签\n5. 直接返回标签列表，不需要其他解释\n\n示例格式：工作, 计划, 效率, 时间管理`
  }

  // 构建语义搜索提示词
  buildSemanticSearchPrompt(query, note) {
    const noteText = `标题：${note.title || '无标题'}\n内容：${note.content || ''}\n标签：${note.tags ? note.tags.join(', ') : '无'}`.trim()
    return `请评估以下查询与笔记的相关性，并给出0-1之间的分数（0表示完全不相关，1表示高度相关）。\n\n查询：${query}\n\n笔记：\n${noteText}\n\n请考虑以下因素：\n1. 关键词匹配度\n2. 语义相似性\n3. 主题相关性\n4. 标签匹配度\n\n请直接返回一个0-1之间的数字分数，不需要其他解释。例如：0.8`
  }

  // 解析相关性分数
  parseRelevanceScore(response) {
    try {
      // 提取数字
      const match = response.match(/\d*\.?\d+/)
      if (match) {
        const score = parseFloat(match[0])
        // 确保分数在0-1范围内
        return Math.max(0, Math.min(1, score))
      }
      return 0
    } catch (error) {
      console.error('解析相关性分数失败:', error)
      return 0
    }
  }

  // 构建总结提示词
  buildSummarizePrompt(text, length) {
    const lengthPrompts = {
      short: '请用1-2句话简要总结',
      medium: '请用3-5句话总结',
      long: '请详细总结，包含主要观点和细节'
    }

    const prompt = lengthPrompts[length] || lengthPrompts.medium
    return `${prompt}以下文本的核心内容：\n\n${text}\n\n请用中文总结，突出重点。`
  }

  // 构建翻译提示词
  buildTranslatePrompt(text, targetLanguage, sourceLanguage) {
    const languageNames = {
      en: '英语',
      zh: '中文',
      ja: '日语',
      ko: '韩语',
      fr: '法语',
      de: '德语',
      es: '西班牙语',
      ru: '俄语'
    }

    const targetLangName = languageNames[targetLanguage] || targetLanguage
    
    if (sourceLanguage === 'auto') {
      return `请将以下文本翻译成${targetLangName}：\n\n${text}\n\n请直接返回翻译结果，保持原文的格式和语调。`
    } else {
      const sourceLangName = languageNames[sourceLanguage] || sourceLanguage
      return `请将以下${sourceLangName}文本翻译成${targetLangName}：\n\n${text}\n\n请直接返回翻译结果，保持原文的格式和语调。`
    }
  }

  // 获取总结的最大token数
  getSummaryMaxTokens(length) {
    const tokenLimits = {
      short: 100,
      medium: 300,
      long: 600
    }
    return tokenLimits[length] || tokenLimits.medium
  }

  // 处理OpenAI错误
  handleOpenAIError(error) {
    if (error.status === 401) {
      return new Error('Kimi API密钥无效')
    } else if (error.status === 429) {
      return new Error('API请求过于频繁或配额已用完')
    } else if (error.status === 500) {
      return new Error('Kimi服务器错误')
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('网络连接错误，请检查网络设置')
    } else {
      return new Error(`AI服务错误: ${error.message}`)
    }
  }
}