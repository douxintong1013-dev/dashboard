import React, { useState, useEffect } from 'react'
import { 
  KeyIcon, 
  CheckIcon, 
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState('')
  const [isKeyVisible, setIsKeyVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('') // 'success', 'error', null
  const [hasExistingKey, setHasExistingKey] = useState(false)

  // 检查是否已有API密钥
  useEffect(() => {
    checkExistingKey()
  }, [])

  const checkExistingKey = async () => {
    try {
      const response = await fetch('/api/ai/status')
      const data = await response.json()
      setHasExistingKey(data.hasApiKey)
    } catch (error) {
      console.error('检查API密钥状态失败:', error)
    }
  }

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/ai/set-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      })

      if (response.ok) {
        setSaveStatus('success')
        setHasExistingKey(true)
        setApiKey('')
        setErrorMessage('')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        const errorData = await response.text()
        setSaveStatus('error')
        setErrorMessage(errorData || '操作失败，请检查网络连接后重试。')
        setTimeout(() => {
          setSaveStatus(null)
          setErrorMessage('')
        }, 5000)
      }
    } catch (error) {
      console.error('保存API密钥失败:', error)
      setSaveStatus('error')
      setErrorMessage('网络连接失败，请检查网络后重试。')
      setTimeout(() => {
        setSaveStatus(null)
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveKey = async () => {
    if (!confirm('确定要删除API密钥吗？删除后AI功能将无法使用。')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/ai/remove-key', {
        method: 'DELETE'
      })

      if (response.ok) {
        setSaveStatus('success')
        setHasExistingKey(false)
        setErrorMessage('')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        const errorData = await response.text()
        setSaveStatus('error')
        setErrorMessage(errorData || '删除失败，请检查网络连接后重试。')
        setTimeout(() => {
          setSaveStatus(null)
          setErrorMessage('')
        }, 5000)
      }
    } catch (error) {
      console.error('删除API密钥失败:', error)
      setSaveStatus('error')
      setErrorMessage('网络连接失败，请检查网络后重试。')
      setTimeout(() => {
        setSaveStatus(null)
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md border border-accent-200">
        {/* 头部 */}
        <div className="p-6 border-b border-accent-200">
          <div className="flex items-center space-x-3">
            <KeyIcon className="w-6 h-6 text-primary-700" />
            <div>
              <h1 className="text-xl font-semibold text-accent-900">API密钥管理</h1>
              <p className="text-sm text-accent-600 mt-1">
                配置Kimi API密钥以使用AI功能
              </p>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 当前状态 */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-accent-700">当前状态:</span>
              {hasExistingKey ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckIcon className="w-3 h-3 mr-1" />
                  已配置
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XMarkIcon className="w-3 h-3 mr-1" />
                  未配置
                </span>
              )}
            </div>
            <p className="text-xs text-accent-500">
              {hasExistingKey 
                ? 'API密钥已配置，AI功能可正常使用' 
                : '请配置API密钥以启用AI功能（文本润色、改写、标签生成、语义搜索等）'
              }
            </p>
          </div>

          {/* API密钥输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-accent-700 mb-2">
              Kimi API密钥
            </label>
            <div className="relative">
              <input
                type={isKeyVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 border border-accent-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent shadow-sm"
              />
              <button
                type="button"
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {isKeyVisible ? (
                  <EyeSlashIcon className="w-4 h-4 text-accent-400" />
                ) : (
                  <EyeIcon className="w-4 h-4 text-accent-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-accent-500 mt-1">
              API密钥将安全存储在服务器端，不会在前端暴露
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={handleSaveKey}
              disabled={isSaving || !apiKey.trim()}
              className="flex-1 bg-primary-700 text-white px-4 py-2 rounded-md hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSaving ? '保存中...' : (hasExistingKey ? '更新密钥' : '保存密钥')}
            </button>
            
            {hasExistingKey && (
              <button
                onClick={handleRemoveKey}
                disabled={isSaving}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                删除密钥
              </button>
            )}
          </div>

          {/* 状态提示 */}
          {saveStatus && (
            <div className={`mt-4 p-3 rounded-md ${
              saveStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveStatus === 'success' 
                ? '操作成功！' 
                : (errorMessage || '操作失败，请检查网络连接后重试。')
              }
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 p-4 bg-accent-50 rounded-md border border-accent-100">
            <h3 className="text-sm font-medium text-accent-900 mb-2">使用说明</h3>
            <ul className="text-xs text-accent-600 space-y-1">
              <li>• 请前往 <a href="https://platform.moonshot.cn/console/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">Moonshot AI开放平台</a> 获取API密钥</li>
              <li>• API密钥格式通常以 "sk-" 开头</li>
              <li>• 密钥将加密存储在服务器端，确保安全</li>
              <li>• 配置后即可使用所有AI功能（基于kimi-k2-turbo-preview模型）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage