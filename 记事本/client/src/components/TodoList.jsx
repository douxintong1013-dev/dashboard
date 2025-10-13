import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const TodoList = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 获取待办事项列表
  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/todos')
      const data = await response.json()
      if (data.success) {
        setTodos(data.todos)
      } else {
        setError(data.error || '获取待办事项失败')
      }
    } catch (error) {
      console.error('获取待办事项失败:', error)
      setError('网络错误，请稍后再试')
    } finally {
      setIsLoading(false)
    }
  }

  // 添加待办事项
  const addTodo = async () => {
    if (!newTodo.trim()) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newTodo.trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setTodos(prev => [...prev, data.todo])
        setNewTodo('')
        setError('')
      } else {
        setError(data.error || '添加待办事项失败')
      }
    } catch (error) {
      console.error('添加待办事项失败:', error)
      setError('网络错误，请稍后再试')
    }
  }

  // 切换完成状态
  const toggleTodo = async (todoId, completed) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      })

      const data = await response.json()
      if (data.success) {
        setTodos(prev => prev.map(todo => 
          todo.id === todoId ? { ...todo, completed: !completed } : todo
        ))
        setError('')
      } else {
        setError(data.error || '更新待办事项失败')
      }
    } catch (error) {
      console.error('更新待办事项失败:', error)
      setError('网络错误，请稍后再试')
    }
  }

  // 删除待办事项
  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        setTodos(prev => prev.filter(todo => todo.id !== todoId))
        setError('')
      } else {
        setError(data.error || '删除待办事项失败')
      }
    } catch (error) {
      console.error('删除待办事项失败:', error)
      setError('网络错误，请稍后再试')
    }
  }

  // 处理回车键添加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTodos()
  }, [])

  // 统计信息
  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">待办事项</h3>
          <div className="text-sm text-gray-600">
            {completedCount}/{totalCount} 已完成
          </div>
        </div>
        
        {/* 添加新待办事项 */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="添加新的待办事项..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={addTodo}
            disabled={!newTodo.trim()}
            className="btn btn-primary px-3 py-2"
            title="添加待办事项"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* 待办事项列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <CheckIcon className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm">还没有待办事项</p>
            <p className="text-xs mt-1">添加一个开始管理您的任务</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`
                  group flex items-center p-3 rounded-lg border transition-all duration-200
                  ${
                    todo.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                {/* 完成状态按钮 */}
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={`
                    flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors
                    ${
                      todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-500'
                    }
                  `}
                >
                  {todo.completed && <CheckIcon className="w-3 h-3" />}
                </button>
                
                {/* 待办事项内容 */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm break-words
                    ${
                      todo.completed
                        ? 'text-green-700 line-through'
                        : 'text-gray-900'
                    }
                  `}>
                    {todo.content}
                  </p>
                  {todo.createdAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(todo.createdAt).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                
                {/* 删除按钮 */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="删除待办事项"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 底部统计 */}
      {totalCount > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>总计 {totalCount} 项任务</span>
            {completedCount > 0 && (
              <span>完成率 {Math.round((completedCount / totalCount) * 100)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TodoList