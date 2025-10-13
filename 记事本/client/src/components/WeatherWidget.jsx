import React, { useState, useEffect } from 'react'

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 天气状况到颜色的映射
  const weatherColors = {
    'clear': {
      bg: 'from-yellow-300 via-orange-300 to-orange-400',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      emoji: '☀️',
      animation: 'animate-spin',
      shadow: 'shadow-yellow-300/50'
    },
    'clouds': {
      bg: 'from-gray-300 via-gray-400 to-gray-500',
      text: 'text-gray-800',
      border: 'border-gray-400',
      emoji: '☁️',
      animation: 'animate-pulse',
      shadow: 'shadow-gray-300/50'
    },
    'rain': {
      bg: 'from-blue-400 via-blue-500 to-blue-600',
      text: 'text-blue-100',
      border: 'border-blue-500',
      emoji: '🌧️',
      animation: 'animate-bounce',
      shadow: 'shadow-blue-400/50'
    },
    'drizzle': {
      bg: 'from-blue-300 via-blue-400 to-blue-500',
      text: 'text-blue-100',
      border: 'border-blue-400',
      emoji: '🌦️',
      animation: 'animate-pulse',
      shadow: 'shadow-blue-300/50'
    },
    'thunderstorm': {
      bg: 'from-purple-600 via-purple-700 to-gray-800',
      text: 'text-purple-100',
      border: 'border-purple-500',
      emoji: '⛈️',
      animation: 'animate-ping',
      shadow: 'shadow-purple-500/50'
    },
    'snow': {
      bg: 'from-blue-100 via-white to-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      emoji: '❄️',
      animation: 'animate-spin',
      shadow: 'shadow-blue-200/50'
    },
    'mist': {
      bg: 'from-gray-200 via-gray-300 to-gray-400',
      text: 'text-gray-700',
      border: 'border-gray-300',
      emoji: '🌫️',
      animation: 'animate-pulse',
      shadow: 'shadow-gray-200/50'
    },
    'default': {
      bg: 'from-green-300 via-green-400 to-green-500',
      text: 'text-green-800',
      border: 'border-green-400',
      emoji: '🌤️',
      animation: 'animate-bounce',
      shadow: 'shadow-green-300/50'
    }
  }

  // 获取天气数据
  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 使用免费的天气API服务
      // 这里使用一个模拟的天气数据，实际项目中需要真实的API密钥
      const mockWeatherData = {
        weather: [{
          main: Math.random() > 0.5 ? 'Clear' : Math.random() > 0.3 ? 'Clouds' : 'Rain',
          description: '晴朗'
        }],
        main: {
          temp: Math.floor(Math.random() * 20) + 10,
          feels_like: Math.floor(Math.random() * 20) + 10
        },
        name: '北京'
      }
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setWeather(mockWeatherData)
    } catch (err) {
      setError('获取天气信息失败')
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    // 每30分钟更新一次天气
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // 获取天气对应的颜色主题
  const getWeatherTheme = () => {
    if (!weather || !weather.weather || !weather.weather[0]) {
      return weatherColors.default
    }
    
    const weatherMain = weather.weather[0].main.toLowerCase()
    return weatherColors[weatherMain] || weatherColors.default
  }

  // 获取天气描述
  const getWeatherDescription = () => {
    if (!weather) return '获取天气中...'
    
    const temp = Math.round(weather.main.temp)
    const weatherMain = weather.weather[0].main
    const city = weather.name
    
    const weatherDescriptions = {
      'Clear': '今天天气真好呢！',
      'Clouds': '今天有点多云哦！',
      'Rain': '今天下雨了呢！',
      'Drizzle': '今天有小雨哦！',
      'Thunderstorm': '今天有雷雨！',
      'Snow': '今天下雪了！',
      'Mist': '今天有雾呢！'
    }
    
    return weatherDescriptions[weatherMain] || '今天天气不错！'
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-200 to-blue-300 px-4 py-2 rounded-full border-3 border-blue-400 shadow-lg animate-pulse">
        <span className="text-lg">🌤️</span>
        <span className="text-sm font-bold text-blue-800 font-cute">获取天气中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3 bg-gradient-to-r from-red-200 to-red-300 px-4 py-2 rounded-full border-3 border-red-400 shadow-lg">
        <span className="text-lg">❌</span>
        <span className="text-sm font-bold text-red-800 font-cute">天气获取失败</span>
      </div>
    )
  }

  const theme = getWeatherTheme()
  const temp = weather ? Math.round(weather.main.temp) : '--'

  return (
    <div 
      className={`flex items-center space-x-3 bg-gradient-to-r ${theme.bg} px-4 py-2 rounded-full border-3 ${theme.border} ${theme.shadow} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group`}
      onClick={fetchWeather}
      title="点击刷新天气"
    >
      <div className="relative">
        <span className={`text-lg ${theme.animation} group-hover:scale-125 transition-transform duration-300`}>
          {theme.emoji}
        </span>
        {/* 添加闪烁效果 */}
        <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${theme.text} font-cute group-hover:animate-pulse`}>
          {getWeatherDescription()}
        </span>
        <span className={`text-xs ${theme.text} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
          {temp}°C
        </span>
      </div>
      {/* 添加装饰性粒子效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1 right-2 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1 left-2 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  )
}

export default WeatherWidget