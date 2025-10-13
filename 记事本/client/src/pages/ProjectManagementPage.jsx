import React, { useState, useEffect, useRef } from 'react'
import {
  FolderIcon,
  PlusIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  MicrophoneIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium',
    deadline: '',
    status: 'planning'
  })
  const [filter, setFilter] = useState('all')
  
  // AI助手相关状态
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '你好！我是你的AI项目管理助手小新 🤖 我可以帮你创建项目、分析进度、提供建议。试试说"帮我创建一个新项目"或"分析我的项目进度"！',
      timestamp: new Date()
    }
  ])
  const [userInput, setUserInput] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([
    '创建一个移动应用项目',
    '分析当前项目风险',
    '优化项目时间安排',
    '生成项目报告'
  ])
  const chatEndRef = useRef(null)

  // 项目状态配置
  const statusConfig = {
    planning: { label: '规划中', color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
    active: { label: '进行中', color: 'bg-green-100 text-green-800', icon: ChartBarIcon },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
    paused: { label: '暂停', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon }
  }

  // 优先级配置
  const priorityConfig = {
    low: { label: '低', color: 'bg-green-100 text-green-800' },
    medium: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: '高', color: 'bg-red-100 text-red-800' }
  }

  // 模拟数据
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        name: '蜡笔小新记事本优化',
        description: '优化用户界面，增加新功能，提升用户体验',
        priority: 'high',
        status: 'active',
        deadline: '2024-02-15',
        createdAt: '2024-01-01',
        progress: 65,
        tasks: [
          { id: 1, title: '设计新UI界面', completed: true },
          { id: 2, title: '实现项目管理功能', completed: false },
          { id: 3, title: '添加数据统计', completed: false }
        ]
      },
      {
        id: 2,
        name: 'AI功能增强',
        description: '集成更多AI功能，提供智能写作建议',
        priority: 'medium',
        status: 'planning',
        deadline: '2024-03-01',
        createdAt: '2024-01-10',
        progress: 20,
        tasks: [
          { id: 4, title: '研究AI API', completed: true },
          { id: 5, title: '设计AI交互界面', completed: false }
        ]
      },
      {
        id: 3,
        name: '移动端适配',
        description: '优化移动端体验，响应式设计',
        priority: 'low',
        status: 'completed',
        deadline: '2024-01-20',
        createdAt: '2023-12-15',
        progress: 100,
        tasks: [
          { id: 6, title: '移动端UI设计', completed: true },
          { id: 7, title: '响应式布局实现', completed: true }
        ]
      }
    ]
    setProjects(mockProjects)
  }, [])

  // 创建项目
  const handleCreateProject = () => {
    if (!newProject.name.trim()) return

    const project = {
      id: Date.now(),
      ...newProject,
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0,
      tasks: []
    }

    setProjects([...projects, project])
    setNewProject({
      name: '',
      description: '',
      priority: 'medium',
      deadline: '',
      status: 'planning'
    })
    setShowCreateModal(false)
  }

  // 删除项目
  const handleDeleteProject = (id) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      setProjects(projects.filter(p => p.id !== id))
    }
  }

  // 更新项目状态
  const handleUpdateStatus = (id, status) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, status } : p
    ))
  }

  // AI助手功能
  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }

    setAiMessages(prev => [...prev, userMessage])
    const currentInput = userInput
    setUserInput('')
    setIsAITyping(true)

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentInput)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      setAiMessages(prev => [...prev, aiMessage])
      setIsAITyping(false)
      
      // 生成新的智能建议
      generateSmartSuggestions(currentInput)
    }, 1500)
  }

  // 提取项目信息的辅助函数
  const extractProjectInfo = (input) => {
    const info = {}
    
    // 提取项目名称
    const nameMatch = input.match(/(?:创建|新建).*?["'](.*?)["']|(?:创建|新建).*?名为["'](.*?)["']|(?:创建|新建).*?叫["'](.*?)["']|(?:创建|新建)(.*?)项目/)
    if (nameMatch) {
      info.name = nameMatch[1] || nameMatch[2] || nameMatch[3] || nameMatch[4]?.trim()
    }
    
    // 提取优先级
    if (input.includes('高优先级') || input.includes('紧急')) {
      info.priority = 'high'
    } else if (input.includes('低优先级')) {
      info.priority = 'low'
    } else if (input.includes('中优先级')) {
      info.priority = 'medium'
    }
    
    // 提取截止日期
    const dateMatch = input.match(/(\d{1,2})月(\d{1,2})日|(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (dateMatch) {
      if (dateMatch[1] && dateMatch[2]) {
        const year = new Date().getFullYear()
        info.deadline = `${year}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`
      } else if (dateMatch[3]) {
        info.deadline = `${dateMatch[3]}-${dateMatch[4].padStart(2, '0')}-${dateMatch[5].padStart(2, '0')}`
      }
    }
    
    // 提取描述
    if (input.includes('关于') || input.includes('用于')) {
      const descMatch = input.match(/(?:关于|用于)(.*?)(?:的|，|。|$)/)
      if (descMatch) {
        info.description = descMatch[1].trim()
      }
    }
    
    return info
  }

  const generateAIResponse = (input) => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('创建') || lowerInput.includes('新项目')) {
      // 尝试从用户输入中提取项目信息
      const projectInfo = extractProjectInfo(input)
      if (projectInfo.name) {
        // 自动创建项目
        const newProject = {
          id: Date.now(),
          name: projectInfo.name,
          description: projectInfo.description || `AI智能生成的${projectInfo.name}项目`,
          status: 'planning',
          priority: projectInfo.priority || 'medium',
          progress: 0,
          deadline: projectInfo.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
          tasks: []
        }
        
        setProjects(prev => [...prev, newProject])
        
        return `✅ 项目创建成功！\n\n📋 项目详情：\n• 名称：${newProject.name}\n• 描述：${newProject.description}\n• 优先级：${priorityConfig[newProject.priority].label}\n• 截止日期：${format(new Date(newProject.deadline), 'yyyy-MM-dd')}\n• 状态：规划中\n\n🎯 下一步建议：\n• 细化项目里程碑\n• 分配团队成员\n• 设置关键任务\n• 建立沟通机制\n\n项目已添加到你的项目列表中！`
      } else {
        return `我来帮你创建项目！请提供更多信息：\n\n📝 示例格式：\n"创建一个名为'移动应用开发'的高优先级项目"\n"新建'数据分析平台'项目，截止日期12月31日"\n\n🎯 我可以智能识别：\n• 项目名称\n• 优先级（高/中/低）\n• 截止日期\n• 项目描述\n\n请告诉我项目的具体信息！`
      }
    }
    
    if (lowerInput.includes('分析') || lowerInput.includes('进度')) {
      const activeProjects = projects.filter(p => p.status === 'active')
      const avgProgress = activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length || 0
      const highPriorityProjects = projects.filter(p => p.priority === 'high')
      return `📊 智能项目分析报告：\n\n🎯 当前状态：\n• 活跃项目：${activeProjects.length} 个\n• 平均进度：${Math.round(avgProgress)}%\n• 高优先级项目：${highPriorityProjects.length} 个\n\n💡 AI建议：\n${avgProgress < 50 ? '• 建议加强项目执行力度，设置每日站会' : '• 项目进展良好，可考虑并行启动新项目'}\n• 优先完成高优先级项目的关键里程碑\n• 建立项目风险预警机制`
    }
    
    if (lowerInput.includes('建议') || lowerInput.includes('优化')) {
      return '🚀 AI智能优化方案：\n\n⚡ 效率提升：\n• 实施敏捷开发方法论\n• 使用看板管理工作流\n• 建立自动化测试流程\n• 设置智能提醒和通知\n\n📈 质量保证：\n• 建立代码审查机制\n• 实施持续集成/持续部署\n• 设置质量门禁标准\n• 定期项目回顾会议\n\n🎯 团队协作：\n• 明确角色职责矩阵\n• 建立知识共享平台\n• 实施结对编程\n• 定期技能培训'
    }
    
    if (lowerInput.includes('风险')) {
      const overdueProjects = projects.filter(p => p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed')
      const upcomingDeadlines = projects.filter(p => p.deadline && new Date(p.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      return `⚠️ 智能风险分析：\n\n🔴 高风险项目：\n• 延期项目：${overdueProjects.length} 个\n• 即将到期：${upcomingDeadlines.length} 个\n\n🛡️ 风险缓解策略：\n• 立即重新评估项目优先级\n• 增加关键路径上的资源投入\n• 建立每日进度跟踪机制\n• 准备应急预案和备选方案\n\n💡 预防措施：\n• 设置项目健康度仪表板\n• 建立早期预警系统\n• 定期风险评估会议`
    }
    
    if (lowerInput.includes('团队') || lowerInput.includes('协作')) {
      return '👥 智能团队管理方案：\n\n🤝 协作优化：\n• 建立跨功能团队结构\n• 实施透明的沟通机制\n• 设置团队OKR目标\n• 定期团队建设活动\n\n📱 工具集成：\n• 统一项目管理平台\n• 实时协作文档系统\n• 自动化工作流程\n• 智能会议调度\n\n📊 绩效跟踪：\n• 个人贡献度分析\n• 团队效率指标\n• 技能发展路径\n• 360度反馈机制'
    }
    
    if (lowerInput.includes('报告') || lowerInput.includes('统计')) {
      const completionRate = projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0
      return `📈 智能项目报告：\n\n📊 关键指标：\n• 项目完成率：${completionRate}%\n• 按时交付率：${Math.round(Math.random() * 30 + 70)}%\n• 团队满意度：${Math.round(Math.random() * 20 + 80)}%\n• 质量评分：${Math.round(Math.random() * 15 + 85)}%\n\n🎯 改进建议：\n• 加强项目前期规划\n• 优化资源配置策略\n• 提升团队技能水平\n• 建立持续改进机制\n\n📅 下期目标：\n• 提升完成率至${completionRate + 10}%\n• 缩短平均交付周期\n• 增强客户满意度`
    }
    
    return '🤖 我是你的AI项目管理专家！我可以帮你：\n\n🎯 项目规划与创建\n📊 进度分析与跟踪\n⚠️ 风险识别与管控\n🚀 效率优化建议\n👥 团队协作方案\n📈 数据分析报告\n\n请告诉我你想了解哪个方面，我会为你提供专业的建议和解决方案！'
  }

  const generateSmartSuggestions = (userInput) => {
    const allSuggestions = [
      '分析项目健康度和风险',
      '制定下周工作优先级',
      '优化团队协作流程',
      '设置智能项目提醒',
      '生成项目进度报告',
      '评估资源分配效率',
      '制定质量保证方案',
      '分析团队绩效指标',
      '建立项目知识库',
      '设计自动化工作流',
      '制定技能提升计划',
      '优化项目交付流程'
    ]
    
    // 根据用户输入智能推荐相关建议
    const lowerInput = userInput.toLowerCase()
    let contextualSuggestions = []
    
    if (lowerInput.includes('创建') || lowerInput.includes('新建')) {
      contextualSuggestions = [
        '设置项目模板和标准',
        '建立项目审批流程',
        '制定项目命名规范'
      ]
    } else if (lowerInput.includes('分析') || lowerInput.includes('进度')) {
      contextualSuggestions = [
        '设置进度预警机制',
        '优化里程碑设置',
        '分析瓶颈和阻塞点'
      ]
    } else if (lowerInput.includes('团队')) {
      contextualSuggestions = [
        '制定团队沟通规范',
        '设计技能矩阵图',
        '建立导师制度'
      ]
    } else {
      // 随机选择建议
      contextualSuggestions = allSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3)
    }
    
    setAiSuggestions(contextualSuggestions)
  }

  const handleSuggestionClick = (suggestion) => {
    setUserInput(suggestion)
    setTimeout(() => handleSendMessage(), 100)
  }

  // 智能项目建议生成
  useEffect(() => {
    const generateInitialSuggestions = () => {
      const suggestions = []
      
      if (projects.filter(p => p.status === 'active').length > 2) {
        suggestions.push('分析当前项目负载，优化资源分配')
      }
      
      if (projects.filter(p => p.status === 'completed').length === 0) {
        suggestions.push('制定项目完成激励机制')
      }
      
      if (projects.length < 3) {
        suggestions.push('探索新的项目机会和增长点')
      }
      
      suggestions.push('设置智能项目提醒和通知')
      suggestions.push('生成项目进度报告')
      suggestions.push('建立项目最佳实践库')
      
      setAiSuggestions(suggestions.slice(0, 4))
    }
    
    generateInitialSuggestions()
  }, [projects])

  // 滚动到聊天底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  // 计算统计数据
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
      {/* AI背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI-native 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                  <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI项目管理中心
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <RocketLaunchIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  智能助手小新为你提供全方位项目管理支持
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`inline-flex items-center px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  showAIChat 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                AI助手
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                新建项目
              </button>
            </div>
          </div>
        </div>

        {/* AI智能建议卡片 */}
        {aiSuggestions.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/50 relative overflow-hidden">
              {/* 动态背景装饰 */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/5 via-purple-400/5 to-pink-400/5 animate-pulse"></div>
              <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce delay-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-3">
                    <SparklesIcon className="w-5 h-5 text-indigo-500 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI智能建议</h3>
                  <div className="ml-2 px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                    <span className="text-xs font-medium text-green-700">实时更新</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-4 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-500 border border-white/30 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transform hover:scale-105 hover:-translate-y-1 group relative overflow-hidden"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* 悬浮时的背景光效 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 flex items-start">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                          <LightBulbIcon className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-800 leading-relaxed transition-colors duration-300">{suggestion}</span>
                      </div>
                      
                      {/* 点击提示 */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-ping"></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className={`grid gap-8 transition-all duration-500 ${showAIChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* 左侧：项目管理主界面 */}
          <div className={`${showAIChat ? 'lg:col-span-2' : 'col-span-1'}`}>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <FolderIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总项目数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">进行中</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">规划中</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.planning}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">已完成</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 过滤器 */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'planning', label: '规划中' },
                  { key: 'active', label: '进行中' },
                  { key: 'completed', label: '已完成' },
                  { key: 'paused', label: '暂停' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === key
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 项目列表 */}
            <div className={`grid gap-6 ${
              showAIChat 
                ? 'grid-cols-1 xl:grid-cols-2' 
                : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
            }`}>
          {filteredProjects.map(project => {
            const StatusIcon = statusConfig[project.status].icon
            const isHighPriority = project.priority === 'high'
            const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed'
            
            return (
              <div 
                key={project.id} 
                className={`relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 hover:border-indigo-200 transform hover:scale-105 group ${
                  isHighPriority ? 'ring-2 ring-indigo-200' : ''
                } ${
                  isOverdue ? 'ring-2 ring-red-200' : ''
                }`}
              >
                {/* AI装饰元素 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-sm animate-pulse"></div>
                </div>
                
                {/* 优先级指示器 */}
                {isHighPriority && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                
                {/* 逾期警告 */}
                {isOverdue && (
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center animate-bounce">
                    <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className="p-6">
                  {/* 项目头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{project.name}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${priorityConfig[project.priority].color} border border-white/30`}>
                          {priorityConfig[project.priority].label}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                        title="查看详情"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                        title="删除项目"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 项目状态 */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusConfig[project.status].color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig[project.status].color}`} />
                      </div>
                      <span className={`text-sm font-semibold ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span className="font-medium">{project.progress}% 完成</span>
                    </div>
                  </div>

                  {/* 智能进度条 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">项目进度</span>
                      <span className="text-indigo-600 font-bold">{project.progress}%</span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                          project.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          project.status === 'active' ? 'bg-gradient-to-r from-blue-400 to-indigo-600' :
                          project.status === 'paused' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* 项目信息卡片 */}
                  <div className="space-y-3 mb-4">
                    {project.deadline && (
                      <div className={`flex items-center p-3 rounded-xl transition-all duration-300 ${
                        isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          isOverdue ? 'bg-red-100' : 'bg-indigo-100'
                        }`}>
                          <CalendarIcon className={`w-4 h-4 ${
                            isOverdue ? 'text-red-600' : 'text-indigo-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">截止日期</p>
                          <p className={`text-sm font-semibold ${
                            isOverdue ? 'text-red-700' : 'text-gray-700'
                          }`}>
                            {format(new Date(project.deadline), 'yyyy年MM月dd日')}
                            {isOverdue && <span className="ml-2 text-red-500">(已逾期)</span>}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <UserGroupIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">任务进度</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {project.tasks.filter(t => t.completed).length}/{project.tasks.length} 已完成
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 智能操作区域 */}
                  <div className="pt-4 border-t border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <select
                        value={project.status}
                        onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm font-medium transition-all duration-300 hover:border-indigo-300"
                      >
                        <option value="planning">📋 规划中</option>
                        <option value="active">🚀 进行中</option>
                        <option value="paused">⏸️ 暂停</option>
                        <option value="completed">✅ 已完成</option>
                      </select>
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

            {/* AI-native 空状态 */}
             {filteredProjects.length === 0 && (
               <div className="col-span-full">
                 <div className="text-center py-16 px-8">
                   <div className="relative mb-8">
                     <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 animate-pulse"></div>
                       <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                         <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
                       </div>
                       <div className="absolute top-4 right-4 w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-bounce delay-300"></div>
                       <div className="absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce delay-700"></div>
                     </div>
                   </div>
                   
                   <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                     {filter === 'all' ? 'AI项目管理中心等待你的第一个项目' : `暂无${{
                       'planning': '规划中',
                       'active': '进行中', 
                       'completed': '已完成',
                       'paused': '暂停'
                     }[filter]}的项目`}
                   </h3>
                   
                   <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                     {filter === 'all' 
                       ? '让AI助手小新帮你开始第一个项目，体验智能化的项目管理！' 
                       : `当前没有${{
                           'planning': '规划中',
                           'active': '进行中',
                           'completed': '已完成', 
                           'paused': '暂停'
                         }[filter]}的项目，试试其他筛选条件或创建新项目。`
                     }
                   </p>
                   
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <button
                       onClick={() => setShowCreateModal(true)}
                       className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                     >
                       <SparklesIcon className="w-5 h-5 mr-2" />
                       AI智能创建项目
                     </button>
                     
                     {filter !== 'all' && (
                       <button
                         onClick={() => setFilter('all')}
                         className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl hover:bg-white border border-gray-200 hover:border-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                       >
                         <FolderIcon className="w-5 h-5 mr-2" />
                         查看所有项目
                       </button>
                     )}
                   </div>
                   
                   {/* AI建议卡片 */}
                   <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                     {[
                       { icon: RocketLaunchIcon, title: '快速启动', desc: '使用AI模板快速创建项目' },
                       { icon: LightBulbIcon, title: '智能建议', desc: '获得个性化的项目管理建议' },
                       { icon: ChatBubbleLeftRightIcon, title: 'AI助手', desc: '随时与AI助手对话交流' }
                     ].map((item, index) => (
                       <div key={index} className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                         <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
                           <item.icon className="w-5 h-5 text-indigo-600" />
                         </div>
                         <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                         <p className="text-sm text-gray-600">{item.desc}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* 右侧：AI聊天界面 */}
        {showAIChat && (
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 h-[600px] flex flex-col">
              {/* 聊天头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI助手小新</h3>
                    <p className="text-xs text-gray-500">在线 • 随时为你服务</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 聊天消息区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {format(message.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* AI正在输入指示器 */}
                {isAITyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-gray-200/50">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入消息...或点击上方建议"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isAITyping}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建项目模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">创建新项目</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="输入项目名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="输入项目描述"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">低优先级</option>
                      <option value="medium">中优先级</option>
                      <option value="high">高优先级</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="planning">规划中</option>
                      <option value="active">进行中</option>
                      <option value="paused">暂停</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  创建项目
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 项目详情模态框 */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">项目描述</h3>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">状态</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedProject.status].color}`}>
                      {statusConfig[selectedProject.status].label}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">优先级</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[selectedProject.priority].color}`}>
                      {priorityConfig[selectedProject.priority].label}优先级
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">进度</h3>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selectedProject.progress}% 完成</p>
                </div>
                
                {selectedProject.deadline && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">截止日期</h3>
                    <p className="text-gray-600">{format(new Date(selectedProject.deadline), 'yyyy-MM-dd')}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">任务列表</h3>
                  <div className="space-y-2">
                    {selectedProject.tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircleIcon className={`w-5 h-5 ${task.completed ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {selectedProject.tasks.length === 0 && (
                      <p className="text-gray-500 text-sm">暂无任务</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectManagementPage