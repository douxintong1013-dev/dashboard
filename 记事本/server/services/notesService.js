import { DatabaseService } from './databaseService.js'

export class NotesService {
  constructor() {
    this.db = new DatabaseService()
  }

  // 获取所有笔记
  async getAllNotes() {
    try {
      const notes = await this.db.getAllNotes()
      return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } catch (error) {
      console.error('获取所有笔记失败:', error)
      throw new Error('获取笔记失败')
    }
  }

  // 根据ID获取笔记
  async getNoteById(id) {
    try {
      if (!id) {
        throw new Error('笔记ID不能为空')
      }
      return await this.db.getNoteById(id)
    } catch (error) {
      console.error('获取笔记失败:', error)
      throw new Error('获取笔记失败')
    }
  }

  // 创建新笔记
  async createNote(noteData) {
    try {
      const { title, content } = noteData
      
      // 验证数据
      if (!title && !content) {
        throw new Error('标题和内容不能同时为空')
      }
      
      const now = new Date().toISOString()
      const note = {
        id: this.generateId(),
        title: title || '无标题',
        content: content || '',
        createdAt: now,
        updatedAt: now
      }
      
      await this.db.createNote(note)
      return note
    } catch (error) {
      console.error('创建笔记失败:', error)
      throw new Error('创建笔记失败')
    }
  }

  // 更新笔记
  async updateNote(id, updates) {
    try {
      if (!id) {
        throw new Error('笔记ID不能为空')
      }
      
      const existingNote = await this.db.getNoteById(id)
      if (!existingNote) {
        return null
      }
      
      const updatedNote = {
        ...existingNote,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // 确保必要字段不为空
      if (!updatedNote.title && !updatedNote.content) {
        throw new Error('标题和内容不能同时为空')
      }
      
      await this.db.updateNote(id, updatedNote)
      return updatedNote
    } catch (error) {
      console.error('更新笔记失败:', error)
      throw new Error('更新笔记失败')
    }
  }

  // 删除笔记
  async deleteNote(id) {
    try {
      if (!id) {
        throw new Error('笔记ID不能为空')
      }
      
      const existingNote = await this.db.getNoteById(id)
      if (!existingNote) {
        return false
      }
      
      await this.db.deleteNote(id)
      return true
    } catch (error) {
      console.error('删除笔记失败:', error)
      throw new Error('删除笔记失败')
    }
  }

  // 搜索笔记
  async searchNotes(query) {
    try {
      if (!query || query.trim().length === 0) {
        return []
      }
      
      const allNotes = await this.db.getAllNotes()
      const searchTerm = query.toLowerCase().trim()
      
      const matchedNotes = allNotes.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(searchTerm)
        const contentMatch = note.content.toLowerCase().includes(searchTerm)
        return titleMatch || contentMatch
      })
      
      // 按相关性排序（标题匹配优先）
      return matchedNotes.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(searchTerm)
        const bTitleMatch = b.title.toLowerCase().includes(searchTerm)
        
        if (aTitleMatch && !bTitleMatch) return -1
        if (!aTitleMatch && bTitleMatch) return 1
        
        // 如果都匹配或都不匹配标题，按更新时间排序
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
    } catch (error) {
      console.error('搜索笔记失败:', error)
      throw new Error('搜索笔记失败')
    }
  }

  // 批量删除笔记
  async deleteMultipleNotes(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return 0
      }
      
      let deletedCount = 0
      
      for (const id of ids) {
        try {
          const success = await this.deleteNote(id)
          if (success) {
            deletedCount++
          }
        } catch (error) {
          console.error(`删除笔记 ${id} 失败:`, error)
          // 继续删除其他笔记
        }
      }
      
      return deletedCount
    } catch (error) {
      console.error('批量删除笔记失败:', error)
      throw new Error('批量删除笔记失败')
    }
  }

  // 获取笔记统计信息
  async getNotesStats() {
    try {
      const notes = await this.db.getAllNotes()
      
      const totalNotes = notes.length
      const totalWords = notes.reduce((sum, note) => {
        return sum + (note.content ? note.content.length : 0)
      }, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const notesToday = notes.filter(note => {
        const noteDate = new Date(note.createdAt)
        return noteDate >= today
      }).length
      
      return {
        totalNotes,
        totalWords,
        notesToday,
        lastUpdated: notes.length > 0 ? notes[0].updatedAt : null
      }
    } catch (error) {
      console.error('获取笔记统计失败:', error)
      throw new Error('获取笔记统计失败')
    }
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  // 验证笔记数据
  validateNoteData(noteData) {
    const errors = []
    
    if (noteData.title && noteData.title.length > 200) {
      errors.push('标题长度不能超过200个字符')
    }
    
    if (noteData.content && noteData.content.length > 1000000) {
      errors.push('内容长度不能超过1MB')
    }
    
    if (!noteData.title && !noteData.content) {
      errors.push('标题和内容不能同时为空')
    }
    
    return errors
  }
}