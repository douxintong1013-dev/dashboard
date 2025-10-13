import React, { useState, useEffect } from 'react'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'
import SearchBar from '../components/SearchBar'
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
      const response = await fetch('/api/ai/semantic-search', {
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
    <div className="flex bg-gray-100 min-h-0">
      {/* 左侧笔记列表 */}
      <div className="w-80 border-r border-accent-200 flex flex-col bg-white shadow-sm">
        <div className="p-4 border-b border-accent-200">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
          >
            <span className="text-lg">📝</span>
            新建笔记
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
      <div className="flex-1 flex flex-col bg-white border-l border-r border-gray-200">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onUpdateNote={updateNote}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">欢迎使用记事本</h3>
              <p className="text-gray-600 mb-4 max-w-md">创建你的第一条笔记，开始记录吧。</p>
              <button
                onClick={createNewNote}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
              >
                新建笔记
              </button>
            </div>
          </div>
        )}
        </div>

    </div>
  )
}

export default NotebookPage