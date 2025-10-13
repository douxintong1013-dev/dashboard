import React, { useState, useEffect } from 'react'

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 使用本地日历数据以避免外部网络错误，恢复到之前的稳定版本
  // const apiUrl = 'https://21st.dev/r/designali-in/calendar?...' // 已禁用外部请求

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    // 直接使用本地日历数据，避免外部请求导致的 net::ERR_FAILED
    setLoading(true)
    setCalendarData({
      currentMonth: currentDate.getMonth(),
      currentYear: currentDate.getFullYear(),
      today: new Date().getDate()
    })
    setLoading(false)
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const today = new Date().getDate()
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const days = []
    
    // 添加空白天数
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>)
    }
    
    // 添加月份天数
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today && 
                     currentDate.getMonth() === currentMonth && 
                     currentDate.getFullYear() === currentYear
      
      days.push(
        <div
          key={day}
          className={`w-6 h-6 flex items-center justify-center text-xs rounded-full cursor-pointer transition-all duration-200 ${
            isToday 
              ? 'bg-blue-500 text-white font-bold shadow-lg' 
              : 'hover:bg-blue-100 text-gray-700'
          }`}
        >
          {day}
        </div>
      )
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="p-3 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full border-3 border-blue-500 shadow-lg">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="p-3 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 rounded-full border-3 border-blue-500 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 cursor-pointer">
        <span className="text-xl">📅</span>
      </div>
      
      {/* 悬浮日历 */}
      <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300" style={{zIndex: 999999}}>
        <div className="bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h3 className="font-bold text-gray-800">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </h3>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              今天: {new Date().toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarWidget