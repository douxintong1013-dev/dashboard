import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class DatabaseService {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/notes.db')
    this.db = null
    this.initializeDatabase()
  }

  // 初始化数据库
  async initializeDatabase() {
    try {
      // 确保数据目录存在
      const dataDir = path.dirname(this.dbPath)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // 创建数据库连接
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('数据库连接失败:', err.message)
        } else {
          console.log('✅ 数据库连接成功')
          this.createTables()
        }
      })
    } catch (error) {
      console.error('数据库初始化失败:', error)
      throw error
    }
  }

  // 创建数据表
  createTables() {
    const createNotesTable = `
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `
    
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        encrypted INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `

    const createTodosTable = `
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updatedAt)',
      'CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title)',
      'CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)'
    ]

    this.db.serialize(() => {
      this.db.run(createNotesTable, (err) => {
        if (err) {
          console.error('创建notes表失败:', err.message)
        } else {
          console.log('✅ notes表创建成功')
        }
      })
      
      this.db.run(createSettingsTable, (err) => {
        if (err) {
          console.error('创建settings表失败:', err.message)
        } else {
          console.log('✅ settings表创建成功')
        }
      })

      this.db.run(createTodosTable, (err) => {
        if (err) {
          console.error('创建todos表失败:', err.message)
        } else {
          console.log('✅ todos表创建成功')
        }
      })

      // 创建索引
      createIndexes.forEach(indexSql => {
        this.db.run(indexSql, (err) => {
          if (err) {
            console.error('创建索引失败:', err.message)
          }
        })
      })
    })
  }

  // 获取所有笔记
  async getAllNotes() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM notes ORDER BY updatedAt DESC'
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // 根据ID获取笔记
  async getNoteById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM notes WHERE id = ?'
      
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row || null)
        }
      })
    })
  }

  // 创建笔记
  async createNote(note) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO notes (id, title, content, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `
      
      const params = [
        note.id,
        note.title,
        note.content,
        note.createdAt,
        note.updatedAt
      ]
      
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ ...note, id: note.id })
        }
      })
    })
  }

  // 更新笔记
  async updateNote(id, note) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE notes 
        SET title = ?, content = ?, updatedAt = ?
        WHERE id = ?
      `
      
      const params = [
        note.title,
        note.content,
        note.updatedAt,
        id
      ]
      
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else if (this.changes === 0) {
          resolve(null) // 没有找到要更新的记录
        } else {
          resolve(note)
        }
      })
    })
  }

  // 删除笔记
  async deleteNote(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM notes WHERE id = ?'
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      })
    })
  }

  // 搜索笔记
  async searchNotes(query) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM notes 
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY 
          CASE 
            WHEN title LIKE ? THEN 1
            WHEN content LIKE ? THEN 2
            ELSE 3
          END,
          updatedAt DESC
      `
      
      const searchPattern = `%${query}%`
      const params = [searchPattern, searchPattern, searchPattern, searchPattern]
      
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // 获取笔记数量
  async getNotesCount() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) as count FROM notes'
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row.count)
        }
      })
    })
  }

  // 批量删除笔记
  async deleteMultipleNotes(ids) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        resolve(0)
        return
      }

      const placeholders = ids.map(() => '?').join(',')
      const sql = `DELETE FROM notes WHERE id IN (${placeholders})`
      
      this.db.run(sql, ids, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      })
    })
  }

  // 获取最近的笔记
  async getRecentNotes(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM notes ORDER BY updatedAt DESC LIMIT ?'
      
      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // 备份数据库
  async backupDatabase(backupPath) {
    return new Promise((resolve, reject) => {
      try {
        fs.copyFileSync(this.dbPath, backupPath)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  // 获取数据库统计信息
  async getDatabaseStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as totalNotes,
          SUM(LENGTH(content)) as totalContentLength,
          AVG(LENGTH(content)) as avgContentLength,
          MIN(createdAt) as oldestNote,
          MAX(updatedAt) as newestNote
        FROM notes
      `
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            totalNotes: row.totalNotes || 0,
            totalContentLength: row.totalContentLength || 0,
            avgContentLength: Math.round(row.avgContentLength || 0),
            oldestNote: row.oldestNote,
            newestNote: row.newestNote
          })
        }
      })
    })
  }

  // 设置配置项
  async setSetting(key, value, encrypted = false) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString()
      const sql = `
        INSERT OR REPLACE INTO settings (key, value, encrypted, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `
      
      this.db.run(sql, [key, value, encrypted ? 1 : 0, now, now], function(err) {
        if (err) {
          console.error('设置配置失败:', err.message)
          reject(err)
        } else {
          resolve({ key, value, encrypted })
        }
      })
    })
  }

  // 获取配置项
  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM settings WHERE key = ?'
      
      this.db.get(sql, [key], (err, row) => {
        if (err) {
          console.error('获取配置失败:', err.message)
          reject(err)
        } else {
          resolve(row || null)
        }
      })
    })
  }

  // 删除配置项
  async deleteSetting(key) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM settings WHERE key = ?'
      
      this.db.run(sql, [key], function(err) {
        if (err) {
          console.error('删除配置失败:', err.message)
          reject(err)
        } else {
          resolve({ deleted: this.changes > 0 })
        }
      })
    })
  }

  // 获取所有配置项
  async getAllSettings() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM settings ORDER BY key'
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('获取所有配置失败:', err.message)
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  // 关闭数据库连接
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('关闭数据库失败:', err.message)
            reject(err)
          } else {
            console.log('✅ 数据库连接已关闭')
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  // 清理旧数据（可选功能）
  async cleanupOldNotes(daysOld = 365) {
    return new Promise((resolve, reject) => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      const cutoffISO = cutoffDate.toISOString()
      
      const sql = 'DELETE FROM notes WHERE createdAt < ?'
      
      this.db.run(sql, [cutoffISO], function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      })
    })
  }

  // ==================== Todos 相关方法 ====================

  // 获取所有待办事项
  async getAllTodos() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM todos ORDER BY createdAt DESC',
        [],
        (err, rows) => {
          if (err) {
            console.error('获取待办事项失败:', err.message)
            reject(err)
          } else {
            // 转换completed字段为布尔值
            const todos = rows.map(row => ({
              ...row,
              completed: Boolean(row.completed)
            }))
            resolve(todos)
          }
        }
      )
    })
  }

  // 根据ID获取待办事项
  async getTodoById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM todos WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('获取待办事项失败:', err.message)
            reject(err)
          } else {
            if (row) {
              row.completed = Boolean(row.completed)
            }
            resolve(row)
          }
        }
      )
    })
  }

  // 创建待办事项
  async createTodo(todo) {
    return new Promise((resolve, reject) => {
      const id = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      
      const todoData = {
        id,
        content: todo.content,
        completed: todo.completed || false,
        createdAt: now,
        updatedAt: now
      }

      this.db.run(
        'INSERT INTO todos (id, content, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [todoData.id, todoData.content, todoData.completed ? 1 : 0, todoData.createdAt, todoData.updatedAt],
        function(err) {
          if (err) {
            console.error('创建待办事项失败:', err.message)
            reject(err)
          } else {
            console.log('✅ 待办事项创建成功:', todoData.id)
            resolve(todoData)
          }
        }
      )
    })
  }

  // 更新待办事项
  async updateTodo(id, updates) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString()
      const fields = []
      const values = []

      if (updates.content !== undefined) {
        fields.push('content = ?')
        values.push(updates.content)
      }
      
      if (updates.completed !== undefined) {
        fields.push('completed = ?')
        values.push(updates.completed ? 1 : 0)
      }

      fields.push('updatedAt = ?')
      values.push(now)
      values.push(id)

      const sql = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`

      this.db.run(sql, values, function(err) {
        if (err) {
          console.error('更新待办事项失败:', err.message)
          reject(err)
        } else {
          console.log('✅ 待办事项更新成功:', id)
          resolve({ id, ...updates, updatedAt: now })
        }
      })
    })
  }

  // 删除待办事项
  async deleteTodo(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM todos WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            console.error('删除待办事项失败:', err.message)
            reject(err)
          } else {
            console.log('✅ 待办事项删除成功:', id)
            resolve(this.changes > 0)
          }
        }
      )
    })
  }

  // 获取待办事项统计
  async getTodosStats() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as pending
        FROM todos`,
        [],
        (err, rows) => {
          if (err) {
            console.error('获取待办事项统计失败:', err.message)
            reject(err)
          } else {
            resolve(rows[0])
          }
        }
      )
    })
  }

  // 清理已完成的待办事项
  async cleanupCompletedTodos() {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM todos WHERE completed = 1',
        [],
        function(err) {
          if (err) {
            console.error('清理已完成待办事项失败:', err.message)
            reject(err)
          } else {
            console.log(`✅ 清理了 ${this.changes} 条已完成的待办事项`)
            resolve(this.changes)
          }
        }
      )
    })
  }
}