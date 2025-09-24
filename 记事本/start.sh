#!/bin/bash

# 蜡笔小新记事本启动脚本
echo "🌟 启动蜡笔小新记事本服务..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到npm，请先安装npm"
    exit 1
fi

# 安装依赖（如果需要）
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "📦 安装根目录依赖..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd server && npm install && cd ..
fi

# 创建日志目录
mkdir -p logs

# 启动后端服务
echo "🚀 启动后端服务..."
cd server
npm start > ../logs/server.log 2>&1 &
SERVER_PID=$!
cd ..

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端服务是否启动成功
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ 后端服务启动成功 (PID: $SERVER_PID)"
else
    echo "❌ 后端服务启动失败，请检查日志: logs/server.log"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 启动前端服务
echo "🎨 启动前端服务..."
cd client
npm run dev > ../logs/client.log 2>&1 &
CLIENT_PID=$!
cd ..

# 等待前端服务启动
echo "⏳ 等待前端服务启动..."
sleep 5

# 检查前端服务是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务启动成功 (PID: $CLIENT_PID)"
else
    echo "❌ 前端服务启动失败，请检查日志: logs/client.log"
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 1
fi

# 保存PID到文件
echo $SERVER_PID > logs/server.pid
echo $CLIENT_PID > logs/client.pid

echo ""
echo "🎉 蜡笔小新记事本启动成功！"
echo "📝 前端地址: http://localhost:3000"
echo "🤖 后端地址: http://localhost:5001"
echo "📋 健康检查: http://localhost:5001/health"
echo ""
echo "📊 服务状态:"
echo "   前端服务 PID: $CLIENT_PID"
echo "   后端服务 PID: $SERVER_PID"
echo ""
echo "🛑 停止服务请运行: ./stop.sh"
echo "📝 查看日志请运行: tail -f logs/server.log 或 tail -f logs/client.log"
echo ""
echo "🌟 享受使用蜡笔小新记事本吧！"

# 自动打开浏览器（可选）
if command -v open &> /dev/null; then
    echo "🌐 正在打开浏览器..."
    sleep 2
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    echo "🌐 正在打开浏览器..."
    sleep 2
    xdg-open http://localhost:3000
fi