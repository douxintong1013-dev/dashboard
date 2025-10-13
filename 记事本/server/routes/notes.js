import express from 'express'
import { NotesService } from '../services/notesService.js'

const router = express.Router()
const notesService = new NotesService()

// 获取所有笔记
router.get('/', async (req, res) => {
  try {
    const notes = await notesService.getAllNotes()
    res.json({
      success: true,
      data: notes
    })
  } catch (error) {
    console.error('获取笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '获取笔记失败'
    })
  }
})

// 根据ID获取单个笔记
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const note = await notesService.getNoteById(id)
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: '笔记不存在'
      })
    }
    
    res.json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('获取笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '获取笔记失败'
    })
  }
})

// 创建新笔记
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body
    
    // 验证输入
    if (!title && !content) {
      return res.status(400).json({
        success: false,
        error: '标题和内容不能同时为空'
      })
    }
    
    const note = await notesService.createNote({
      title: title || '无标题',
      content: content || ''
    })
    
    res.status(201).json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('创建笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '创建笔记失败'
    })
  }
})

// 更新笔记
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    
    // 验证输入
    if (title !== undefined && title.length > 200) {
      return res.status(400).json({
        success: false,
        error: '标题长度不能超过200个字符'
      })
    }
    
    if (content !== undefined && content.length > 1000000) {
      return res.status(400).json({
        success: false,
        error: '内容长度不能超过1MB'
      })
    }
    
    const note = await notesService.updateNote(id, { title, content })
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: '笔记不存在'
      })
    }
    
    res.json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('更新笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '更新笔记失败'
    })
  }
})

// 删除笔记
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const success = await notesService.deleteNote(id)
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: '笔记不存在'
      })
    }
    
    res.json({
      success: true,
      message: '笔记已删除'
    })
  } catch (error) {
    console.error('删除笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '删除笔记失败'
    })
  }
})

// 搜索笔记
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '搜索关键词不能为空'
      })
    }
    
    const notes = await notesService.searchNotes(query.trim())
    
    res.json({
      success: true,
      data: notes,
      count: notes.length
    })
  } catch (error) {
    console.error('搜索笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '搜索笔记失败'
    })
  }
})

// 批量删除笔记
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供要删除的笔记ID列表'
      })
    }
    
    const deletedCount = await notesService.deleteMultipleNotes(ids)
    
    res.json({
      success: true,
      message: `成功删除 ${deletedCount} 个笔记`,
      deletedCount
    })
  } catch (error) {
    console.error('批量删除笔记失败:', error)
    res.status(500).json({
      success: false,
      error: '批量删除笔记失败'
    })
  }
})

export default router