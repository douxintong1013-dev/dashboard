import React, { useState, useEffect } from 'react'

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiUrl = 'https://21st.dev/r/designali-in/calendar?api_key=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18ybXdGd3U1cW5FQXozZ1U2dmxnMW13ZU1PZEoiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovLzIxc3QuZGV2IiwiZXhwIjoxNzU4MDg3NjYzLCJpYXQiOjE3NTgwODY3NjMsImlzcyI6Imh0dHBzOi8vY2xlcmsuMjFzdC5kZXYiLCJqdGkiOiIzOTM1MzU2M2I2MWI0ZDUyNTg4YiIsIm5iZiI6MTc1ODA4Njc1OCwic3ViIjoidXNlcl8zMm9WNDlsWUNRTVNobmlZUkJyS1oxcXBKSm0ifQ.ZvgnOjfRAgzlTmLrNw6_Vx6yM9SgIb0-vj-C6tUKJnYXE_AdT8W00DxtANZwbkLFFVDD7HVdvhZ4A_tG3VqHc581ljkF1OmCeeMRf4NU7d6hEGbn3s7ikZzGPlZG-LwMxb69VhCfuHL2BB_FkObu_eK48ZjO7WnkIrpudl1J_UxIVp6HR6fJWDZ1czPX4GrI_PNRDOes-tTZNLerVgLHSi9S1ci-0dBplWSBfj6s3rAOAH8ZOzLYvpHCsMQsDEi3NGSSzmI3yWdsFVb1_Ms22oaOJ7cDq_6zKUaWzRuebYil6ePEvEudf4EKPpfL8_ZbUUull1WzB-mr_0Tn7fgLKA'

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      // 由于API可能需要特殊处理，我们先创建一个基础的日历显示
      // 如果API可用，可以替换为实际的API调用
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        setCalendarData(data)
      } else {
        // 如果API不可用，使用本地日历数据
        setCalendarData({
          currentMonth: currentDate.getMonth(),
          currentYear: currentDate.getFullYear(),
          today: new Date().getDate()
        })
      }
    } catch (err) {
      console.log('使用本地日历数据')
      setCalendarData({
        currentMonth: currentDate.getMonth(),
        currentYear: currentDate.getFullYear(),
        today: new Date().getDate()
      })
    } finally {
      setLoading(false)
    }
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
      <div className="p-3 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full border-[3px] border-blue-500 shadow-lg">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="p-3 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 rounded-full border-[3px] border-blue-500 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 cursor-pointer">
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