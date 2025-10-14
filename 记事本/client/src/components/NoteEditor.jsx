import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  SparklesIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  PaintBrushIcon,
  ArrowPathIcon,
  TagIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from '@heroicons/react/24/outline'
import { useHistory } from '../hooks/useHistory'
import TextFormatToolbar from './TextFormatToolbar'

const NoteEditor = ({ note, onUpdateNote }) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isPolishing, setIsPolishing] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [showRewriteMenu, setShowRewriteMenu] = useState(false)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [tags, setTags] = useState(note.tags || [])
  
  // textarea引用
  const textareaRef = useRef(null)
  
  // 使用历史管理hook
  const titleHistory = useHistory(note.title || '')
  const contentHistory = useHistory(note.content || '')
  
  const title = titleHistory.value
  const content = contentHistory.value

  // 当选择的笔记改变时，更新本地状态
  useEffect(() => {
    titleHistory.clearHistory(note.title || '')
    contentHistory.clearHistory(note.content || '')
    setTags(note.tags || [])
  }, [note.id])

  // 点击外部关闭改写菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRewriteMenu && !event.target.closest('.rewrite-menu-container')) {
        setShowRewriteMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showRewriteMenu])

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 只在焦点在编辑器相关元素时处理撤销/重做
      const isInEditor = event.target.id === 'content-textarea' || 
                        event.target.closest('.note-editor') ||
                        event.target.tagName === 'INPUT' && event.target.closest('.note-editor')
      
      if (isInEditor) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          titleHistory.undo()
          contentHistory.undo()
        } else if ((event.metaKey || event.ctrlKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
          event.preventDefault()
          titleHistory.redo()
          contentHistory.redo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [titleHistory, contentHistory])

  // 自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdateNote(note.id, { title, content })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [title, content, note.id, note.title, note.content, onUpdateNote])

  const handleTitleChange = (e) => {
    titleHistory.setValue(e.target.value)
  }

  const handleContentChange = (e) => {
    contentHistory.setValue(e.target.value)
  }

  // 处理工具栏插入文本
  const handleInsertText = (newText) => {
    contentHistory.setValue(newText)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }



  // 文本润色功能
  const polishText = async () => {
    if (!content.trim()) {
      alert('请先输入一些内容')
      return
    }

    setIsPolishing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/polish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      })

      const data = await response.json()
      if (data.success) {
        contentHistory.setValue(data.polished)
      } else {
        alert(data.error || '润色失败，请稍后再试')
      }
    } catch (error) {
      console.error('润色失败:', error)
      alert('润色失败，请检查网络连接')
    } finally {
      setIsPolishing(false)
    }
  }

  // 文本改写功能
  const rewriteText = async (style) => {
    if (!content.trim()) {
      alert('请先输入一些内容')
      return
    }

    setIsRewriting(true)
    setShowRewriteMenu(false)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content, style }),
      })

      const data = await response.json()
      if (data.success) {
        contentHistory.setValue(data.rewritten)
      } else {
        alert(data.error || '改写失败，请稍后再试')
      }
    } catch (error) {
      console.error('改写失败:', error)
      alert('改写失败，请检查网络连接')
    } finally {
      setIsRewriting(false)
    }
  }

  // 自动生成标签功能
  const generateTags = async () => {
    if (!title.trim() && !content.trim()) {
      alert('请先输入标题或内容')
      return
    }

    setIsGeneratingTags(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/generate-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) {
        throw new Error('标签生成失败')
      }

      const data = await response.json()
       const newTags = data.tags
       setTags(newTags)
       onUpdateNote(note.id, { tags: newTags })
    } catch (error) {
      console.error('标签生成失败:', error)
      alert('标签生成失败，请稍后重试')
    } finally {
      setIsGeneratingTags(false)
    }
  }

  return (
    <div className="flex flex-col h-full note-editor">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-primary-200 bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-t-xl shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-primary-700">📝 文本编辑器</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              titleHistory.undo()
              contentHistory.undo()
            }}
            disabled={!titleHistory.canUndo && !contentHistory.canUndo}
            className="btn btn-ghost px-2 py-1 text-sm"
            title="撤销 (Cmd+Z)"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              titleHistory.redo()
              contentHistory.redo()
            }}
            disabled={!titleHistory.canRedo && !contentHistory.canRedo}
            className="btn btn-ghost px-2 py-1 text-sm"
            title="重做 (Cmd+Shift+Z)"
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-gray-300"></div>
          
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost px-3 py-1 text-sm"
            title="复制内容"
          >
            {isCopied ? (
              <CheckIcon className="w-4 h-4 mr-1 text-green-600" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
            )}
            {isCopied ? '已复制' : '复制'}
          </button>
          
          <button
            onClick={polishText}
            disabled={isPolishing || !content.trim()}
            className="btn btn-ghost px-3 py-1 text-sm"
            title="AI润色"
          >
            <PaintBrushIcon className="w-4 h-4 mr-1" />
            {isPolishing ? '润色中...' : '润色'}
          </button>
          
          <div className="relative rewrite-menu-container">
            <button
              onClick={() => setShowRewriteMenu(!showRewriteMenu)}
              disabled={isRewriting || !content.trim()}
              className="btn btn-ghost px-3 py-1 text-sm"
              title="AI改写"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              {isRewriting ? '改写中...' : '改写'}
            </button>
            
            {showRewriteMenu && (
              <div className="absolute right-0 top-full mt-2 bg-gradient-to-br from-white to-gray-50 border border-primary-200 rounded-xl shadow-xl z-10 min-w-36 backdrop-blur-sm">
                <button
                  onClick={() => rewriteText('formal')}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-200 rounded-t-xl font-medium"
                >
                  正式风格
                </button>
                <button
                  onClick={() => rewriteText('casual')}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-success-50 hover:to-green-50 transition-all duration-200 font-medium"
                >
                  轻松风格
                </button>
                <button
                  onClick={() => rewriteText('academic')}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 font-medium"
                >
                  学术风格
                </button>
                <button
                  onClick={() => rewriteText('creative')}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all duration-200 font-medium"
                >
                  创意风格
                </button>
                <button
                  onClick={() => rewriteText('concise')}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 rounded-b-xl font-medium"
                >
                  简洁风格
                </button>
                <button
                  onClick={() => rewriteText('detailed')}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 font-medium"
                >
                  详细风格
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={generateTags}
            disabled={isGeneratingTags || (!title.trim() && !content.trim())}
            className="btn btn-ghost px-3 py-1 text-sm"
            title="自动生成标签"
          >
            <TagIcon className="w-4 h-4 mr-1" />
            {isGeneratingTags ? '生成中...' : '生成标签'}
          </button>
        </div>
      </div>

      {/* 标题输入 */}
      <div className="p-4 border-b border-primary-200 bg-gradient-to-r from-white to-blue-50">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onPaste={(e) => {
            e.stopPropagation()
            const pastedText = e.clipboardData.getData('text')
            const input = e.target
            const start = input.selectionStart
            const end = input.selectionEnd
            const newTitle = title.substring(0, start) + pastedText + title.substring(end)
            titleHistory.setValue(newTitle)
            // 设置光标位置
            setTimeout(() => {
              input.selectionStart = input.selectionEnd = start + pastedText.length
            }, 0)
          }}
          placeholder="输入笔记标题..."
          className="w-full text-xl font-semibold border-none outline-none bg-transparent placeholder-gray-500 focus:placeholder-primary-400 transition-colors duration-200"
          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
        />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 bg-transparent">
        {/* 编辑模式 */}
        <div className="h-full flex flex-col">
          {/* 文本格式化工具栏 */}
          <TextFormatToolbar 
            onInsertText={handleInsertText}
            textareaRef={textareaRef}
          />
          
          {/* 文本编辑器 */}
          <textarea
            ref={textareaRef}
            id="content-textarea"
            value={content}
            onChange={handleContentChange}
            onPaste={(e) => {
              e.stopPropagation()
              const pastedText = e.clipboardData.getData('text')
              const textarea = e.target
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const newContent = content.substring(0, start) + pastedText + content.substring(end)
              contentHistory.setValue(newContent)
              // 设置光标位置
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + pastedText.length
              }, 0)
            }}
            placeholder="开始输入你的笔记内容..."
            className="flex-1 w-full p-6 border-none outline-none resize-none text-sm leading-relaxed"
            style={{ 
              userSelect: 'text', 
              WebkitUserSelect: 'text',
              backgroundImage: 'url(/dd0f320453463aa10d6a2a882c10d84b.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backgroundBlendMode: 'overlay',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          />
          
          {/* 标签显示区域 */}
          {tags.length > 0 && (
            <div className="border-t bg-gray-50 p-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 mr-2">标签:</span>
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteEditor