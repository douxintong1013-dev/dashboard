import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PencilSquareIcon, SparklesIcon, Cog6ToothIcon, FolderIcon } from '@heroicons/react/24/outline'
import PomodoroTimer from './PomodoroTimer'
import WeatherWidget from './WeatherWidget'
import CalendarWidget from './CalendarWidget'

const Layout = ({ children }) => {
  const location = useLocation()
  const isSettingsPage = location.pathname === '/settings'
  
  // 蜡笔小新经典台词
  const shinChanQuotes = [
    "我是蜡笔小新，今年5岁！",
    "大象！大象！你的鼻子怎么那么长！",
    "妈妈，我回来了！",
    "动感超人来了！",
    "我要吃巧克力饼干！",
    "屁屁外星人！",
    "今天天气真好呢！",
    "我最喜欢美女姐姐了！"
  ]
  
  const [currentQuote, setCurrentQuote] = useState('')
  
  useEffect(() => {
    const randomQuote = shinChanQuotes[Math.floor(Math.random() * shinChanQuotes.length)]
    setCurrentQuote(randomQuote)
  }, [])
  
  return (
      <div className="min-h-screen flex flex-col">
      {/* 头部导航 */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center space-x-4 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full shadow-xl border-4 border-white transform rotate-12 hover:rotate-0 transition-transform duration-300 animate-crayon-float">
                <span className="text-2xl animate-crayon-wiggle">🖍️</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800">
                  🌟 蜡笔小新记事本 🌟
                </h1>
                {/* <p className="text-sm text-gray-600 font-cute animate-crayon-bounce-in">超级无敌好用哦！</p> */}
              </div>
            </Link>
            
            <div className="flex items-center space-x-6">
              {/* <CalendarWidget /> */}
              {/* <WeatherWidget /> */}
              {/* <div className="flex items-center space-x-3 bg-gradient-to-r from-success-200 to-success-300 px-4 py-2 rounded-full border-[3px] border-success-400 shadow-lg">
                <span className="text-lg">✨</span>
                <span className="text-sm font-bold text-success-800 font-cute">{currentQuote || 'AI小助手在线！'}</span>
              </div> */}
              
              <Link
                to="/projects"
                className="p-3 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 rounded-full border-[3px] border-blue-500 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-12 transition-all duration-300"
                title="项目管理"
              >
                <FolderIcon className="w-6 h-6 text-white" />
              </Link>
              {/* 项目管理入口暂时隐藏，避免头部过于拥挤 */}
              {/* <Link
                to="/projects"
                className="p-3 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 rounded-full border-[3px] border-blue-500 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-12 transition-all duration-300"
                title="项目管理"
              >
                <FolderIcon className="w-6 h-6 text-white" />
              </Link> */}
              <Link
                to="/settings"
                className="p-3 bg-gradient-to-r from-warning-300 to-warning-400 hover:from-warning-400 hover:to-warning-500 rounded-full border-[3px] border-warning-500 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-12 transition-all duration-300"
                title="设置"
              >
                <span className="text-xl">⚙️</span>
              </Link>
              {/* 设置入口暂时隐藏，避免头部过于拥挤 */}
              {/* <Link
                to="/settings"
                className="p-3 bg-gradient-to-r from-warning-300 to-warning-400 hover:from-warning-400 hover:to-warning-500 rounded-full border-[3px] border-warning-500 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-12 transition-all duration-300"
                title="设置"
              >
                <span className="text-xl">⚙️</span>
              </Link> */}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 min-h-0">
        {isSettingsPage ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2024 AI智能记事本. 让AI助力您的思考与创作.
          </div>
        </div>
      </footer>
      
      {/* 番茄钟组件 */}
      {/* 番茄钟组件暂时隐藏，避免固定定位影响版式 */}
      {/* <PomodoroTimer /> */}
    </div>
  )
}

export default Layout