import React, { useState, useRef, useEffect } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  PaintBrushIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'

const TextFormatToolbar = ({ onInsertText, textareaRef }) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef(null)

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return
      
      if ((event.metaKey || event.ctrlKey)) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault()
            insertFormattedText('<b>', '</b>', '加粗文本')
            break
          case 'i':
            event.preventDefault()
            insertFormattedText('<i>', '</i>', '斜体文本')
            break
          case 'l':
            event.preventDefault()
            if (event.shiftKey) {
              insertListItem('numbered')
            } else {
              insertListItem('bullet')
            }
            break
          case '1':
            event.preventDefault()
            insertHeading(1)
            break
          case '2':
            event.preventDefault()
            insertHeading(2)
            break
          case '3':
            event.preventDefault()
            insertHeading(3)
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [textareaRef])

  // 点击外部关闭颜色选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  // 预定义的颜色选项
  const colors = [
    { name: '黑色', value: '#000000' },
    { name: '红色', value: '#ef4444' },
    { name: '蓝色', value: '#3b82f6' },
    { name: '绿色', value: '#22c55e' },
    { name: '紫色', value: '#a855f7' },
    { name: '橙色', value: '#f97316' },
    { name: '粉色', value: '#ec4899' },
    { name: '青色', value: '#06b6d4' }
  ]

  // 插入格式化文本到光标位置
  const insertFormattedText = (startTag, endTag, placeholder = '') => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newText = startTag + textToInsert + endTag
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
        const cursorPos = start + startTag.length + textToInsert.length
        textarea.setSelectionRange(cursorPos, cursorPos)
      }
    }, 0)
  }

  // 插入带颜色的文本
  const insertColoredText = (color) => {
    insertFormattedText(`<span style="color: ${color}">`, '</span>', '彩色文本')
    setShowColorPicker(false)
  }

  // 插入列表项
  const insertListItem = (type) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    
    // 检查是否在行首
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1
    const beforeCursor = textarea.value.substring(lineStart, start)
    
    let newText
    if (type === 'bullet') {
      newText = beforeCursor.trim() === '' ? '• ' : '\n• '
    } else {
      newText = beforeCursor.trim() === '' ? '1. ' : '\n1. '
    }
    
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)
    const fullText = beforeText + newText + (selectedText || '列表项') + afterText
    
    onInsertText(fullText)
    
    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + newText.length + (selectedText || '列表项').length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  // 插入标题
  const insertHeading = (level) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    
    const headingTag = `h${level}`
    const newText = `<${headingTag}>${selectedText || `${level}级标题`}</${headingTag}>`
    
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)
    const fullText = beforeText + newText + afterText
    
    onInsertText(fullText)
    
    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + newText.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const toolbarButtons = [
    {
      icon: BoldIcon,
      label: '加粗',
      action: () => insertFormattedText('<b>', '</b>', '加粗文本'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: ItalicIcon,
      label: '斜体',
      action: () => insertFormattedText('<i>', '</i>', '斜体文本'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: ListBulletIcon,
      label: '无序列表',
      action: () => insertListItem('bullet'),
      shortcut: 'Ctrl+L'
    },
    {
      icon: HashtagIcon,
      label: '有序列表',
      action: () => insertListItem('numbered'),
      shortcut: 'Ctrl+Shift+L'
    }
  ]

  const headingButtons = [
    {
      label: 'H1',
      action: () => insertHeading(1),
      shortcut: 'Ctrl+1'
    },
    {
      label: 'H2',
      action: () => insertHeading(2),
      shortcut: 'Ctrl+2'
    },
    {
      label: 'H3',
      action: () => insertHeading(3),
      shortcut: 'Ctrl+3'
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 bg-white border-b border-primary-200 rounded-t-xl overflow-x-auto">
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
        
        {/* 颜色选择器按钮 */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="字体颜色"
            className="
              p-2 rounded-lg transition-all duration-200 transform hover:scale-110 hover:rotate-3 active:scale-95
              bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800
              hover:from-pink-300 hover:to-pink-400 hover:shadow-lg
              border-2 border-pink-400 hover:border-pink-500
              animate-crayon-wiggle flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center
            "
          >
            <PaintBrushIcon className="w-4 h-4 transition-transform duration-200" />
          </button>
          
          {/* 颜色选择面板 */}
          {showColorPicker && (
            <div 
              ref={colorPickerRef}
              className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-3 min-w-[200px]"
            >
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => insertColoredText(color.value)}
                    title={color.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all duration-200 transform hover:scale-110"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                >
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>
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

export default TextFormatToolbar