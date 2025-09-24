#!/bin/bash

# 蜡笔小新记事本停止脚本
echo "🛑 停止蜡笔小新记事本服务..."

# 检查PID文件是否存在
if [ -f "logs/server.pid" ]; then
    SERVER_PID=$(cat logs/server.pid)
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo "🛑 停止后端服务 (PID: $SERVER_PID)..."
        kill $SERVER_PID
        sleep 2
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            echo "⚠️  强制停止后端服务..."
            kill -9 $SERVER_PID
        fi
        echo "✅ 后端服务已停止"
    else
        echo "ℹ️  后端服务未运行"
    fi
    rm -f logs/server.pid
else
    echo "ℹ️  未找到后端服务PID文件"
fi

if [ -f "logs/client.pid" ]; then
    CLIENT_PID=$(cat logs/client.pid)
    if ps -p $CLIENT_PID > /dev/null 2>&1; then
        echo "🛑 停止前端服务 (PID: $CLIENT_PID)..."
        kill $CLIENT_PID
        sleep 2
        if ps -p $CLIENT_PID > /dev/null 2>&1; then
            echo "⚠️  强制停止前端服务..."
            kill -9 $CLIENT_PID
        fi
        echo "✅ 前端服务已停止"
    else
        echo "ℹ️  前端服务未运行"
    fi
    rm -f logs/client.pid
else
    echo "ℹ️  未找到前端服务PID文件"
fi

# 额外清理：杀死可能残留的Node.js进程
echo "🧹 清理残留进程..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true

echo "✅ 所有服务已停止"
echo "🌟 感谢使用蜡笔小新记事本！"