import express from 'express'
import { DatabaseService } from '../services/databaseService.js'

const router = express.Router()
const db = new DatabaseService()

// 获取所有待办事项
router.get('/', async (req, res) => {
  try {
    const todos = await db.getAllTodos()
    res.json({
      success: true,
      todos
    })
  } catch (error) {
    console.error('获取待办事项失败:', error)
    res.status(500).json({
      success: false,
      error: '获取待办事项失败'
    })
  }
})

// 根据ID获取待办事项
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const todo = await db.getTodoById(id)
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      })
    }
    
    res.json({
      success: true,
      todo
    })
  } catch (error) {
    console.error('获取待办事项失败:', error)
    res.status(500).json({
      success: false,
      error: '获取待办事项失败'
    })
  }
})

// 创建待办事项
router.post('/', async (req, res) => {
  try {
    const { content, completed = false } = req.body
    
    // 验证必填字段
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '待办事项内容不能为空'
      })
    }
    
    const todoData = {
      content: content.trim(),
      completed: Boolean(completed)
    }
    
    const todo = await db.createTodo(todoData)
    
    res.status(201).json({
      success: true,
      todo,
      message: '待办事项创建成功'
    })
  } catch (error) {
    console.error('创建待办事项失败:', error)
    res.status(500).json({
      success: false,
      error: '创建待办事项失败'
    })
  }
})

// 更新待办事项
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = {}
    
    // 检查待办事项是否存在
    const existingTodo = await db.getTodoById(id)
    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      })
    }
    
    // 处理更新字段
    if (req.body.content !== undefined) {
      if (req.body.content.trim() === '') {
        return res.status(400).json({
          success: false,
          error: '待办事项内容不能为空'
        })
      }
      updates.content = req.body.content.trim()
    }
    
    if (req.body.completed !== undefined) {
      updates.completed = Boolean(req.body.completed)
    }
    
    // 如果没有更新字段，返回错误
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有提供要更新的字段'
      })
    }
    
    const updatedTodo = await db.updateTodo(id, updates)
    
    res.json({
      success: true,
      todo: { ...existingTodo, ...updatedTodo },
      message: '待办事项更新成功'
    })
  } catch (error) {
    console.error('更新待办事项失败:', error)
    res.status(500).json({
      success: false,
      error: '更新待办事项失败'
    })
  }
})

// 删除待办事项
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 检查待办事项是否存在
    const existingTodo = await db.getTodoById(id)
    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      })
    }
    
    const deleted = await db.deleteTodo(id)
    
    if (deleted) {
      res.json({
        success: true,
        message: '待办事项删除成功'
      })
    } else {
      res.status(500).json({
        success: false,
        error: '删除待办事项失败'
      })
    }
  } catch (error) {
    console.error('删除待办事项失败:', error)
    res.status(500).json({
      success: false,
      error: '删除待办事项失败'
    })
  }
})

// 获取待办事项统计
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await db.getTodosStats()
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('获取待办事项统计失败:', error)
    res.status(500).json({
      success: false,
      error: '获取待办事项统计失败'
    })
  }
})

// 清理已完成的待办事项
router.delete('/cleanup/completed', async (req, res) => {
  try {
    const deletedCount = await db.cleanupCompletedTodos()
    res.json({
      success: true,
      deletedCount,
      message: `已清理 ${deletedCount} 条已完成的待办事项`
    })
  } catch (error) {
    console.error('清理已完成待办事项失败:', error)
    res.status(500).json({
      success: false,
      error: '清理已完成待办事项失败'
    })
  }
})

export default router