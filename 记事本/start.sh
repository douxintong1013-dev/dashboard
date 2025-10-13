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

# 清理可能存在的旧进程
echo "🧹 清理旧进程..."
if [ -f "logs/server.pid" ]; then
    SERVER_OLD_PID=$(cat logs/server.pid)
    if kill -0 $SERVER_OLD_PID 2>/dev/null; then
        echo "🛑 停止旧的后端服务 (PID: $SERVER_OLD_PID)"
        kill $SERVER_OLD_PID
        sleep 2
    fi
    rm -f logs/server.pid
fi

if [ -f "logs/client.pid" ]; then
    CLIENT_OLD_PID=$(cat logs/client.pid)
    if kill -0 $CLIENT_OLD_PID 2>/dev/null; then
        echo "🛑 停止旧的前端服务 (PID: $CLIENT_OLD_PID)"
        kill $CLIENT_OLD_PID
        sleep 2
    fi
    rm -f logs/client.pid
fi

# 检查并清理端口占用
echo "🔍 检查端口占用..."
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "🛑 清理5001端口占用..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "🛑 清理3000端口占用..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "🛑 清理3001端口占用..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
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

# 检查后端服务是否启动成功（多次尝试）
BACKEND_READY=false
for i in {1..10}; do
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo "✅ 后端服务启动成功 (PID: $SERVER_PID)"
        BACKEND_READY=true
        break
    fi
    echo "⏳ 等待后端服务启动... ($i/10)"
    sleep 2
done

if [ "$BACKEND_READY" = false ]; then
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
sleep 3

# 检查前端服务是否启动成功（多次尝试，仅检查固定端口3001）
FRONTEND_READY=false
FRONTEND_URL=""
for i in {1..15}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ 前端服务启动成功 (PID: $CLIENT_PID) - 端口: 3001"
        FRONTEND_READY=true
        FRONTEND_URL="http://localhost:3001"
        break
    fi
    echo "⏳ 等待前端服务启动... ($i/15)"
    sleep 2
done

if [ "$FRONTEND_READY" = false ]; then
    echo "❌ 前端服务启动失败，请检查日志: logs/client.log"
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 1
fi

# 保存PID到文件
echo $SERVER_PID > logs/server.pid
echo $CLIENT_PID > logs/client.pid

echo ""
echo "🎉 蜡笔小新记事本启动成功！"
echo "📝 前端地址: $FRONTEND_URL"
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
    open "$FRONTEND_URL"
elif command -v xdg-open &> /dev/null; then
    echo "🌐 正在打开浏览器..."
    sleep 2
    xdg-open "$FRONTEND_URL"
fi