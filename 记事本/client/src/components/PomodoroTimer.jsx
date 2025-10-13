import React, { useState, useEffect, useRef } from 'react'
import { PlayIcon, PauseIcon, ArrowPathIcon, SwatchIcon } from '@heroicons/react/24/solid'

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25分钟，以秒为单位
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work') // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0)
  const [currentTheme, setCurrentTheme] = useState('classic')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // 主题配色方案
  const themes = {
    classic: {
      name: '樱花粉渐变',
      work: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      shortBreak: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      longBreak: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      accent: '#ef4444',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 50%, #f3e8ff 100%)'
    },
    forest: {
      name: '薄荷绿渐变',
      work: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      shortBreak: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
      longBreak: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
      accent: '#10b981',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)'
    },
    ocean: {
      name: '天空蓝渐变',
      work: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      shortBreak: { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200' },
      longBreak: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
      accent: '#3b82f6',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f0fdff 100%)'
    },
    violet: {
      name: '薰衣草渐变',
      work: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      shortBreak: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
      longBreak: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
      accent: '#8b5cf6',
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)'
    },
    sunset: {
      name: '暖阳橙渐变',
      work: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      shortBreak: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
      longBreak: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
      accent: '#f97316',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fef9c3 100%)'
    }
  }

  // 创建音效
  useEffect(() => {
    // 创建一个简单的提示音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    const createBeep = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
    
    audioRef.current = createBeep
  }, [])

  // 不同模式的时间设置（秒）
  const timeSettings = {
    work: 25 * 60,        // 25分钟工作
    shortBreak: 5 * 60,   // 5分钟短休息
    longBreak: 15 * 60    // 15分钟长休息
  }

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 开始/暂停计时器
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(timeSettings[mode])
  }

  // 切换模式
  const switchMode = (newMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(timeSettings[newMode])
  }

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            // 播放提示音
            if (audioRef.current) {
              try {
                audioRef.current()
              } catch (error) {
                console.log('音效播放失败:', error)
              }
            }
            // 时间到了，自动切换模式
            if (mode === 'work') {
              setSessions(prev => prev + 1)
              // 每4个工作周期后进行长休息
              const newSessions = sessions + 1
              if (newSessions % 4 === 0) {
                setMode('longBreak')
                return timeSettings.longBreak
              } else {
                setMode('shortBreak')
                return timeSettings.shortBreak
              }
            } else {
              setMode('work')
              return timeSettings.work
            }
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft, mode, sessions])

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  // 获取当前模式的显示文本
  const getModeText = () => {
    switch (mode) {
      case 'work': return '工作时间'
      case 'shortBreak': return '短休息'
      case 'longBreak': return '长休息'
      default: return '工作时间'
    }
  }

  // 获取当前模式的颜色
  const getModeColor = () => {
    const theme = themes[currentTheme]
    return theme[mode]?.text || theme.work.text
  }

  // 获取当前主题的样式
  const getCurrentThemeStyle = () => {
    const theme = themes[currentTheme]
    return theme[mode] || theme.work
  }

  // 切换主题
  const switchTheme = (themeKey) => {
    setCurrentTheme(themeKey)
    localStorage.setItem('pomodoroTheme', themeKey)
    setShowColorPicker(false)
  }

  // 从本地存储加载主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('pomodoroTheme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  const themeStyle = getCurrentThemeStyle()

  return (
    <div className="fixed bottom-20 left-4 z-50">
      {/* 调色盘选择器 */}
       {showColorPicker && (
         <div className="mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 transition-all duration-200">
          <div className="text-xs font-medium text-gray-700 mb-2 text-center">选择主题</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => switchTheme(key)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg transform ${
                  currentTheme === key ? 'border-gray-800 shadow-md scale-105' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: theme.accent,
                  boxShadow: currentTheme === key ? `0 0 0 2px ${theme.accent}20` : 'none'
                }}
                title={theme.name}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* 主番茄钟组件 - 小白形状 */}
      <div 
        className={`shadow-lg border ${themeStyle.border} p-4 transition-all duration-300 relative`}
        style={{ 
          background: themes[currentTheme].background,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          width: '200px',
          height: '180px',
          position: 'relative'
        }}
      >
        {/* 小白的耳朵 */}
        <div 
          className="absolute"
          style={{
            top: '-15px',
            left: '30px',
            width: '30px',
            height: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            border: `2px solid ${themes[currentTheme].accent}`,
            transform: 'rotate(-20deg)'
          }}
        ></div>
        <div 
          className="absolute"
          style={{
            top: '-15px',
            right: '30px',
            width: '30px',
            height: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            border: `2px solid ${themes[currentTheme].accent}`,
            transform: 'rotate(20deg)'
          }}
        ></div>
        {/* 小白的眼睛 */}
        <div 
          className="absolute"
          style={{
            top: '40px',
            left: '50px',
            width: '8px',
            height: '8px',
            backgroundColor: '#000000',
            borderRadius: '50%'
          }}
        ></div>
        <div 
          className="absolute"
          style={{
            top: '40px',
            right: '50px',
            width: '8px',
            height: '8px',
            backgroundColor: '#000000',
            borderRadius: '50%'
          }}
        ></div>
        {/* 小白的鼻子 */}
        <div 
          className="absolute"
          style={{
            top: '55px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '6px',
            height: '4px',
            backgroundColor: '#000000',
            borderRadius: '50%'
          }}
        ></div>
        {/* 小白的嘴巴 */}
        <div 
          className="absolute"
          style={{
            top: '62px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '10px',
            border: '2px solid #000000',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px'
          }}
        ></div>
        <div className="text-center" style={{ paddingTop: '20px' }}>
          {/* 头部：模式指示器和调色盘按钮 */}
          <div className="flex items-center justify-between mb-1" style={{ fontSize: '12px' }}>
            {/* <div className={`text-xs font-medium ${getModeColor()}`}>
              {getModeText()}
            </div> */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`p-1 rounded-full transition-all duration-200 hover:${themeStyle.bg} hover:scale-110 ${
                showColorPicker ? `${themeStyle.bg} ${themeStyle.text}` : 'hover:bg-gray-100'
              }`}
              title="更换主题"
            >
              <SwatchIcon className={`w-3 h-3 transition-transform duration-200 ${
                showColorPicker ? 'rotate-180' : ''
              } ${themeStyle.text}`} />
            </button>
          </div>
        
        {/* 番茄Logo - 缩小版本 */}
        <div className="mb-1">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 32 32" 
            className="mx-auto"
          >
            {/* 番茄主体 */}
            <ellipse 
              cx="16" 
              cy="20" 
              rx="10" 
              ry="8" 
              fill={themes[currentTheme].accent}
              opacity="0.9"
            />
            {/* 番茄顶部 */}
            <ellipse 
              cx="16" 
              cy="12" 
              rx="8" 
              ry="3" 
              fill={themes[currentTheme].accent}
              opacity="0.7"
            />
            {/* 番茄叶子 */}
            <path 
              d="M14 8 Q12 6 10 8 Q12 10 14 8" 
              fill="#22c55e"
              opacity="0.8"
            />
            <path 
              d="M18 8 Q20 6 22 8 Q20 10 18 8" 
              fill="#22c55e"
              opacity="0.8"
            />
            {/* 番茄茎 */}
            <rect 
              x="15.5" 
              y="6" 
              width="1" 
              height="4" 
              fill="#16a34a"
              opacity="0.9"
            />
          </svg>
        </div>
        
        {/* 时间显示 */}
        <div className="text-lg font-mono font-bold text-gray-800 mb-2">
          {formatTime(timeLeft)}
        </div>
        
        {/* 控制按钮 */}
        <div className="flex justify-center space-x-1 mb-2">
          <button
            onClick={toggleTimer}
            className={`p-1 rounded-full transition-colors ${
              isRunning 
                ? `${themeStyle.bg} ${themeStyle.text} hover:opacity-80` 
                : `${themeStyle.bg} ${themeStyle.text} hover:opacity-80`
            }`}
            title={isRunning ? '暂停' : '开始'}
          >
            {isRunning ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className={`p-1 rounded-full transition-colors`}
            style={{
              backgroundColor: `${themes[currentTheme].accent}20`,
              color: themes[currentTheme].accent
            }}
            title="重置"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
        
        {/* 模式切换按钮 */}
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => switchMode('work')}
            className={`px-1 py-0.5 text-xs rounded transition-colors`}
            style={{
              fontSize: '10px',
              backgroundColor: mode === 'work' ? themes[currentTheme].accent : `${themes[currentTheme].accent}20`,
              color: mode === 'work' ? '#ffffff' : themes[currentTheme].accent
            }}
          >
            工作
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-1 py-0.5 text-xs rounded transition-colors`}
            style={{
              fontSize: '10px',
              backgroundColor: mode === 'shortBreak' ? themes[currentTheme].accent : `${themes[currentTheme].accent}20`,
              color: mode === 'shortBreak' ? '#ffffff' : themes[currentTheme].accent
            }}
          >
            短休息
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-1 py-0.5 text-xs rounded transition-colors`}
            style={{
              fontSize: '10px',
              backgroundColor: mode === 'longBreak' ? themes[currentTheme].accent : `${themes[currentTheme].accent}20`,
              color: mode === 'longBreak' ? '#ffffff' : themes[currentTheme].accent
            }}
          >
            长休息
          </button>
        </div>
        

        

      </div>
    </div>
    </div>
  )
}

export default PomodoroTimer