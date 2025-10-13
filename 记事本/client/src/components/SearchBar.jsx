import React, { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const SearchBar = ({ 
  searchQuery, 
  onSearch, 
  onClear, 
  isSemanticSearch, 
  onToggleSemanticSearch, 
  isSearching 
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(localQuery)
  }

  const handleClear = () => {
    setLocalQuery('')
    onClear()
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setLocalQuery(value)
    
    // 实时搜索（仅限普通搜索）
    if (!isSemanticSearch) {
      onSearch(value)
    }
  }

  return (
    <div className="p-4 border-b bg-white">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onPaste={(e) => {
              e.stopPropagation()
              const pastedText = e.clipboardData.getData('text')
              const input = e.target
              const start = input.selectionStart
              const end = input.selectionEnd
              const newQuery = localQuery.substring(0, start) + pastedText + localQuery.substring(end)
              setLocalQuery(newQuery)
              // 设置光标位置
              setTimeout(() => {
                input.selectionStart = input.selectionEnd = start + pastedText.length
              }, 0)
            }}
            placeholder={isSemanticSearch ? "🤖 小新AI帮你找笔记..." : "🔍 小新帮你找笔记哦..."}
            className="w-full pl-10 pr-10 py-2 border-2 border-yellow-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-orange-400 font-cute transition-all duration-300 hover:shadow-lg text-sm"
            style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            disabled={isSearching}
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onToggleSemanticSearch}
              className={`
                flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-colors
                ${
                  isSemanticSearch
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }
              `}
              disabled={isSearching}
            >
              <SparklesIcon className="w-3 h-3" />
              <span>{isSemanticSearch ? 'AI语义搜索' : '普通搜索'}</span>
            </button>
            
            {isSearching && (
              <span className="text-xs text-gray-500">搜索中...</span>
            )}
          </div>
          
          {isSemanticSearch && (
            <button
              type="submit"
              disabled={!localQuery.trim() || isSearching}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              搜索
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="text-xs text-gray-500">
            {isSemanticSearch ? '语义搜索结果' : '文本搜索结果'}
          </div>
        )}
      </form>
    </div>
  )
}

export default SearchBar