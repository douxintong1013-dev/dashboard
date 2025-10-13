import React, { useState, useEffect } from 'react'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'
import AIAssistant from '../components/AIAssistant'
import TodoList from '../components/TodoList'
import SearchBar from '../components/SearchBar'
import { PlusIcon, SparklesIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import shinChanBeachImg from '../assets/shin-chan-beach.jpg'
// 使用浏览器原生的crypto API生成UUID
const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const NotebookPage = () => {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSemanticSearch, setIsSemanticSearch] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState('ai') // 'ai' 或 'todos'

  // 从localStorage加载笔记
  useEffect(() => {
    const savedNotes = localStorage.getItem('notebook-notes')
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes)
        if (parsedNotes.length > 0) {
          setSelectedNote(parsedNotes[0])
        }
      } catch (error) {
        console.error('解析localStorage数据失败:', error)
        setNotes([])
      }
    } else {
      setNotes([])
    }
  }, [])

  // 保存笔记到localStorage
  useEffect(() => {
    localStorage.setItem('notebook-notes', JSON.stringify(notes))
  }, [notes])

  // 创建新笔记
  const createNewNote = () => {
    const newNote = {
      id: generateId(),
      title: '新笔记',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNote(newNote)
  }

  // 更新笔记
  const updateNote = (noteId, updates) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ))
    
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }))
    }
  }

  // 删除笔记
  const deleteNote = (noteId) => {
    setNotes(prev => {
      const newNotes = prev.filter(note => note.id !== noteId)
      // 如果删除的是当前选中的笔记，选择第一个笔记
      if (selectedNote?.id === noteId) {
        setSelectedNote(newNotes.length > 0 ? newNotes[0] : null)
      }
      return newNotes
    })
  }

  // 普通文本搜索
  const performTextSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results = notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(query.toLowerCase())
      const contentMatch = note.content.toLowerCase().includes(query.toLowerCase())
      const tagsMatch = note.tags && note.tags.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
      return titleMatch || contentMatch || tagsMatch
    })

    setSearchResults(results)
  }

  // 语义搜索
  const performSemanticSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/ai/semantic-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, notes })
      })

      if (!response.ok) {
        throw new Error('语义搜索失败')
      }

      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error('语义搜索失败:', error)
      alert('语义搜索失败，请稍后重试')
    } finally {
      setIsSearching(false)
    }
  }

  // 处理搜索
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (isSemanticSearch) {
      performSemanticSearch(query)
    } else {
      performTextSearch(query)
    }
  }

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  // 获取要显示的笔记列表
  const displayNotes = searchQuery ? searchResults : notes

  // 选择笔记
  const selectNote = (note) => {
    setSelectedNote(note)
  }

  return (
    <div className="h-[85vh] flex bg-gray-100">
      {/* 左侧笔记列表 */}
      <div className="w-80 border-r border-accent-200 flex flex-col bg-white shadow-sm">
        <div className="p-4 border-b border-accent-200">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
          >
            <span className="text-lg">📝</span>
            小新的新笔记！
          </button>
        </div>
        
        {/* 搜索栏 */}
        <SearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={clearSearch}
          isSemanticSearch={isSemanticSearch}
          onToggleSemanticSearch={() => setIsSemanticSearch(!isSemanticSearch)}
          isSearching={isSearching}
        />
        
        <div className="flex-1 overflow-hidden">
          <NoteList
            notes={displayNotes}
            selectedNote={selectedNote}
            onSelectNote={selectNote}
            onDeleteNote={deleteNote}
          />
        </div>
      </div>

      {/* 中间编辑器 */}
      <div className="flex-1 flex flex-col relative" style={{backgroundImage: `url(/4faa645a7d2e1fdb88bb59ec0833f83b.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <div className="absolute inset-0 bg-white bg-opacity-70"></div>
        <div className="relative z-10 flex-1 flex flex-col">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onUpdateNote={updateNote}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-yellow-300 animate-crayon-float">
                <span className="text-4xl animate-crayon-rainbow">🖍️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-crayon drop-shadow-lg">
                🌟 开始你的超级记事本冒险吧！🌟
              </h3>
              <p className="text-white mb-6 max-w-md font-cute text-lg drop-shadow-lg">
                小新说："记笔记是很重要的哦！快来写下你的想法吧！" 📝✨
              </p>
              <div className="mb-4 p-3 bg-yellow-100 rounded-lg border-2 border-yellow-300 animate-crayon-bounce-in">
                <p className="text-sm text-yellow-700 font-bold font-cute">💡 小新提示："动感超人也会记笔记哦！"</p>
              </div>
              <button
                onClick={createNewNote}
                className="btn btn-primary px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300"
              >
                <span className="text-xl mr-2">✏️</span>
                开始写笔记啦！
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="w-80 border-l border-primary-200 bg-gradient-to-b from-white to-purple-50 shadow-lg flex flex-col">
        {/* 标签页头部 */}
        <div className="flex border-b border-primary-200 bg-white">
          <button
            onClick={() => setRightPanelTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all duration-300 font-cute ${
              rightPanelTab === 'ai'
                ? 'text-primary-700 bg-primary-50 border-b-4 border-primary-700 transform scale-105'
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-25 hover:scale-105'
            }`}
          >
            <span className="text-lg">🤖</span>
            小新AI助手
          </button>
          <button
            onClick={() => setRightPanelTab('todos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all duration-300 font-cute ${
              rightPanelTab === 'todos'
                ? 'text-primary-700 bg-primary-50 border-b-4 border-primary-700 transform scale-105'
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-25 hover:scale-105'
            }`}
          >
            <span className="text-lg">📋</span>
            小新的任务
          </button>
        </div>
        
        {/* 标签页内容 */}
        <div className="flex-1 overflow-hidden">
          {rightPanelTab === 'ai' ? (
            <AIAssistant
              selectedNote={selectedNote}
              onClose={() => {}}
              onUpdateNote={updateNote}
              isAlwaysVisible={true}
            />
          ) : (
            <TodoList />
          )}
        </div>
      </div>
    </div>
  )
}

export default NotebookPage