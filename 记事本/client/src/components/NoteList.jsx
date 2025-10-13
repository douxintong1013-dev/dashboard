import React from 'react'
import { TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
// 简单的日期格式化函数
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  } catch {
    return '未知时间'
  }
}

const NoteList = ({ notes, selectedNote, onSelectNote, onDeleteNote }) => {


  const getPreview = (content) => {
    if (!content) return '空白笔记'
    // 截取前50个字符作为预览
    const plainText = content.trim()
    return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText
  }

  const handleDelete = (e, noteId) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个笔记吗？')) {
      onDeleteNote(noteId)
    }
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 relative" style={{backgroundImage: 'url(/dd0f320453463aa10d6a2a882c10d84b.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <div className="absolute inset-0 bg-white bg-opacity-70"></div>
        <div className="relative z-10 flex flex-col items-center">
          <DocumentTextIcon className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-sm">还没有笔记</p>
          <p className="text-xs mt-1">点击"新建"创建第一个笔记</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-2">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelectNote(note)}
          className={`
            group relative p-4 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
            ${
              selectedNote?.id === note.id
                ? 'bg-gradient-to-br from-primary-50 via-white to-accent-50 border-primary-300 shadow-lg ring-2 ring-primary-200'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-primary-200 hover:shadow-md hover:bg-gradient-to-br hover:from-primary-100 hover:to-white'
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`
                text-sm font-medium truncate mb-1
                ${
                  selectedNote?.id === note.id
                    ? 'text-primary-900'
                    : 'text-gray-900'
                }
              `}>
                {note.title || '无标题'}
              </h3>
              
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {getPreview(note.content)}
              </p>
              
              {/* 标签显示 */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.slice(0, 3).map((tag, index) => {
                    const colors = [
                      'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700',
                      'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700',
                      'bg-gradient-to-r from-green-100 to-green-200 text-green-700',
                      'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700',
                      'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700'
                    ]
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${colors[index % colors.length]}`}
                      >
                        {tag}
                      </span>
                    )
                  })}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-gray-500 font-medium">+{note.tags.length - 3}</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {formatDate(note.updatedAt)}
                </span>
                
                <button
                  onClick={(e) => handleDelete(e, note.id)}
                  className="
                    opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110
                    p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 text-gray-400 hover:text-red-600 hover:shadow-md
                  "
                  title="删除笔记"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* 选中指示器 */}
          {selectedNote?.id === note.id && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-500 to-accent-500 rounded-r shadow-lg"></div>
          )}
        </div>
      ))}
    </div>
  )
}

export default NoteList