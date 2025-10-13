import React, { useState, useRef, useEffect } from 'react'
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const AIAssistant = ({ selectedNote, onClose, onUpdateNote, isAlwaysVisible = false }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '🌟 哈喽！我是小新的超级AI助手！🤖\n\n小新说："AI助手真的很厉害哦！"\n\n我可以帮你：\n• 🖍️ 让文章变得更有趣\n• ✏️ 纠正错别字（小新经常写错字呢）\n• 💡 提供超棒的写作建议\n• 📝 总结重要内容\n• 🌍 翻译各种语言\n\n快告诉我你想要什么帮助吧！动感超人出击！💪',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          noteContent: selectedNote?.content || '',
          noteTitle: selectedNote?.title || ''
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // 检查是否是API密钥未配置的错误
        if (response.status === 503 || (data.error && data.error.includes('API密钥'))) {
          throw new Error('API_KEY_NOT_CONFIGURED')
        }
        throw new Error(data.error || 'AI服务暂时不可用')
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI请求失败:', error)
      let errorContent = '抱歉，AI服务暂时不可用。请检查网络连接或稍后再试。'
      
      if (error.message === 'API_KEY_NOT_CONFIGURED') {
        errorContent = '⚠️ **AI服务未配置**\n\n请在 [设置页面](/settings) 配置 Kimi API 密钥后使用AI功能。\n\n💡 **如何获取API密钥：**\n1. 访问 [Kimi开放平台](https://platform.moonshot.cn/)\n2. 注册并创建API密钥\n3. 在设置页面中配置密钥'
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      // 可以添加一个临时的成功提示
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const insertToNote = (content) => {
    if (selectedNote && onUpdateNote) {
      const currentContent = selectedNote.content || ''
      const newContent = currentContent + '\n\n' + content
      onUpdateNote(selectedNote.id, { content: newContent })
    }
  }

  const quickActions = [
    {
      label: '改进这段文字',
      action: () => setInputMessage('请帮我改进当前笔记的内容，让它更清晰、更有条理。')
    },
    {
      label: '总结要点',
      action: () => setInputMessage('请帮我总结当前笔记的主要要点。')
    },
    {
      label: '检查语法',
      action: () => setInputMessage('请帮我检查当前笔记的语法和拼写错误。')
    },
    {
      label: '扩展内容',
      action: () => setInputMessage('请帮我扩展当前笔记的内容，添加更多细节和例子。')
    }
  ]

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🤖</span>
          <h3 className="font-bold text-primary-700 font-cute">小新的AI超级助手</h3>
          <span className="text-sm">✨</span>
        </div>
        {!isAlwaysVisible && (
          <button
            onClick={onClose}
            className="btn btn-ghost p-1"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 快捷操作 */}
      {selectedNote && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">快捷操作：</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="btn btn-ghost text-xs p-2 h-auto text-left"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="max-w-none markdown-content">
                {message.type === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              
              {message.type === 'assistant' && (
                <div className="flex items-center justify-end space-x-1 mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="复制"
                  >
                    <ClipboardDocumentIcon className="w-3 h-3" />
                  </button>
                  {selectedNote && (
                    <button
                      onClick={() => insertToNote(message.content)}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="插入到笔记"
                    >
                      <ArrowPathIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 border-2 border-yellow-300">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-orange-600 font-cute font-bold">🤔 小新AI正在努力思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={(e) => {
              e.stopPropagation()
              const pastedText = e.clipboardData.getData('text')
              const textarea = e.target
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const newContent = inputMessage.substring(0, start) + pastedText + inputMessage.substring(end)
              setInputMessage(newContent)
              // 设置光标位置
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + pastedText.length
              }, 0)
            }}
            placeholder="输入消息... (Shift+Enter换行)"
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn btn-primary px-3 py-2 self-end"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant