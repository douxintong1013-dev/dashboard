import React, { useEffect } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const TextToolbar = ({ onInsertText, textareaRef }) => {
  // 插入文本到光标位置
  const insertAtCursor = (before, after = '', placeholder = '') => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newText = before + textToInsert + after
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)
    
    const fullText = beforeText + newText + afterText
    onInsertText(fullText)
    
    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start, start + newText.length)
      } else {
        const cursorPos = start + before.length + textToInsert.length
        textarea.setSelectionRange(cursorPos, cursorPos)
      }
    }, 0)
  }

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault()
            insertAtCursor('**', '**', '加粗文本')
            break
          case 'i':
            e.preventDefault()
            insertAtCursor('*', '*', '斜体文本')
            break
          case 'u':
            e.preventDefault()
            insertAtCursor('<u>', '</u>', '下划线文本')
            break
          case 'k':
            e.preventDefault()
            insertAtCursor('[', '](url)', '链接文本')
            break
          case '`':
            e.preventDefault()
            insertAtCursor('`', '`', '代码')
            break
          case '1':
            e.preventDefault()
            insertAtCursor('# ', '', '一级标题')
            break
          case '2':
            e.preventDefault()
            insertAtCursor('## ', '', '二级标题')
            break
          case '3':
            e.preventDefault()
            insertAtCursor('### ', '', '三级标题')
            break
          case 'l':
            e.preventDefault()
            if (e.shiftKey) {
              insertAtCursor('1. ', '', '列表项')
            } else {
              insertAtCursor('- ', '', '列表项')
            }
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [textareaRef, onInsertText])

  const toolbarButtons = [
    {
      icon: BoldIcon,
      label: '加粗',
      action: () => insertAtCursor('**', '**', '加粗文本'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: ItalicIcon,
      label: '斜体',
      action: () => insertAtCursor('*', '*', '斜体文本'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: UnderlineIcon,
      label: '下划线',
      action: () => insertAtCursor('<u>', '</u>', '下划线文本'),
      shortcut: 'Ctrl+U'
    },
    {
      icon: CodeBracketIcon,
      label: '代码',
      action: () => insertAtCursor('`', '`', '代码'),
      shortcut: 'Ctrl+`'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: '引用',
      action: () => insertAtCursor('> ', '', '引用文本'),
      shortcut: 'Ctrl+>'
    },
    {
      icon: ListBulletIcon,
      label: '无序列表',
      action: () => insertAtCursor('- ', '', '列表项'),
      shortcut: 'Ctrl+L'
    },
    {
      icon: NumberedListIcon,
      label: '有序列表',
      action: () => insertAtCursor('1. ', '', '列表项'),
      shortcut: 'Ctrl+Shift+L'
    },
    {
      icon: LinkIcon,
      label: '链接',
      action: () => insertAtCursor('[', '](url)', '链接文本'),
      shortcut: 'Ctrl+K'
    }
  ]

  const headingButtons = [
    {
      label: 'H1',
      action: () => insertAtCursor('# ', '', '一级标题'),
      shortcut: 'Ctrl+1'
    },
    {
      label: 'H2',
      action: () => insertAtCursor('## ', '', '二级标题'),
      shortcut: 'Ctrl+2'
    },
    {
      label: 'H3',
      action: () => insertAtCursor('### ', '', '三级标题'),
      shortcut: 'Ctrl+3'
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-b border-primary-200 rounded-t-xl overflow-x-auto">
      {/* 标题按钮组 */}
      <div className="flex items-center gap-1 mr-3 flex-shrink-0">
        {headingButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            title={`${button.label} (${button.shortcut})`}
            className="
              px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95
              bg-gradient-to-r from-primary-200 to-primary-300 text-primary-800 
              hover:from-primary-300 hover:to-primary-400 hover:shadow-md
              border-2 border-primary-400 hover:border-primary-500
              animate-crayon-float min-w-[40px] min-h-[32px] flex items-center justify-center
            "
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-primary-300 mx-2 hidden sm:block"></div>

      {/* 格式化按钮组 */}
      <div className="flex items-center gap-1 flex-wrap">
        {toolbarButtons.map((button, index) => {
          const IconComponent = button.icon
          return (
            <button
              key={index}
              onClick={button.action}
              title={`${button.label} (${button.shortcut})`}
              className="
                p-2 rounded-lg transition-all duration-200 transform hover:scale-110 hover:rotate-3 active:scale-95
                bg-gradient-to-r from-accent-200 to-accent-300 text-accent-800
                hover:from-accent-300 hover:to-accent-400 hover:shadow-lg
                border-2 border-accent-400 hover:border-accent-500
                animate-crayon-wiggle flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center
              "
            >
              <IconComponent className="w-4 h-4 transition-transform duration-200" />
            </button>
          )
        })}
      </div>

      {/* 快捷键提示 */}
      <div className="ml-auto text-xs text-gray-500 hidden lg:flex items-center space-x-2">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+B</span>
        <span>加粗</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+I</span>
        <span>斜体</span>
      </div>
    </div>
  )
}

export default TextToolbar