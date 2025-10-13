# 🌟 蜡笔小新记事本

一个可爱的AI智能记事本应用，具有番茄钟、天气播报、待办事项等功能。

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）

```bash
# 启动所有服务
./start.sh

# 停止所有服务
./stop.sh
```

### 方法二：手动启动

```bash
# 启动后端服务
cd server
npm start

# 新开终端，启动前端服务
cd client
npm run dev
```

## 📋 服务地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5001
- **健康检查**: http://localhost:5001/health

## 🛠️ 功能特性

- 📝 **智能记事本**: 支持Markdown格式，AI辅助写作
- 🍅 **番茄钟**: 多主题配色，专注工作学习
- 🌤️ **天气播报**: 实时天气信息，颜色主题显示
- ✅ **待办事项**: 任务管理，进度跟踪
- 🎨 **蜡笔小新主题**: 可爱的UI设计

## 🔧 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 📦 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client && npm install

# 安装后端依赖
cd server && npm install
```

## ⚙️ 配置说明

### 环境变量配置

在 `server` 目录下创建 `.env` 文件：

```env
# 加密密钥（推荐设置）
ENCRYPTION_KEY=your-secret-encryption-key

# Kimi AI API密钥（可选，用于AI功能）
KIMI_API_KEY=your-kimi-api-key

# 服务器端口（可选，默认5001）
PORT=5001
```

## 🐛 常见问题

### Q: 每次重新打开都显示服务不可用？
**A**: 使用 `./start.sh` 脚本启动服务，或者手动启动前端和后端服务。

### Q: AI功能不可用？
**A**: 需要在后端 `.env` 文件中配置 `KIMI_API_KEY`。

### Q: 数据丢失？
**A**: 建议在 `.env` 文件中设置固定的 `ENCRYPTION_KEY`。

### Q: 端口被占用？
**A**: 检查是否有其他服务占用3000或5001端口，使用 `./stop.sh` 停止服务。

## 📁 项目结构

```
记事本/
├── client/          # 前端React应用
├── server/          # 后端Node.js服务
├── logs/            # 日志文件目录
├── start.sh         # 启动脚本
├── stop.sh          # 停止脚本
└── README.md        # 项目说明
```

## 🎯 使用技巧

1. **一键启动**: 使用 `./start.sh` 可以自动启动所有服务并打开浏览器
2. **日志查看**: 服务日志保存在 `logs/` 目录下
3. **主题切换**: 点击番茄钟的调色盘图标可以切换主题
4. **快捷键**: 编辑器支持Markdown快捷键（Ctrl+B加粗等）

## 🌟 享受使用

现在你可以愉快地使用蜡笔小新记事本了！如果遇到问题，请检查日志文件或重新运行启动脚本。

---

*"我是蜡笔小新，今年5岁！"* 🎨