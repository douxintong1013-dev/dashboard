import { useState, useCallback, useRef } from 'react'

/**
 * 历史管理Hook，支持撤销/重做功能
 * @param {*} initialValue 初始值
 * @param {number} maxHistorySize 最大历史记录数量
 * @returns {object} { value, setValue, undo, redo, canUndo, canRedo, clearHistory }
 */
export const useHistory = (initialValue, maxHistorySize = 50) => {
  const [history, setHistory] = useState([initialValue])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isUndoRedoRef = useRef(false)

  const value = history[currentIndex]
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const setValue = useCallback((newValue) => {
    // 如果是撤销/重做操作，不添加到历史记录
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false
      return
    }

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(newValue)
      
      // 限制历史记录数量
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
      }
      
      return newHistory
    })
    
    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1)
      return newIndex
    })
  }, [currentIndex, maxHistorySize])

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoRef.current = true
      setCurrentIndex(prev => prev - 1)
    }
  }, [canUndo])

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoRef.current = true
      setCurrentIndex(prev => prev + 1)
    }
  }, [canRedo])

  const clearHistory = useCallback((newValue = initialValue) => {
    setHistory([newValue])
    setCurrentIndex(0)
  }, [initialValue])

  return {
    value,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  }
}

export default useHistory