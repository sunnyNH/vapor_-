#!/bin/bash

set -e

echo "🚀 启动开发环境..."

# 检查是否在正确的目录
if [ ! -f "Package.swift" ]; then
    echo "❌ 错误：请在 Vapor 项目根目录下运行此脚本"
    exit 1
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

echo "🔧 启动开发服务器..."
echo "前端开发服务器: http://localhost:5173"
echo "后端API服务器: http://localhost:8080"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 使用 trap 捕获中断信号，确保清理子进程
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 启动前端开发服务器（后台）
cd frontend
npm run dev &
FRONTEND_PID=$!

# 启动后端服务器（后台）
cd ..
vapor run &
BACKEND_PID=$!

# 等待用户中断
wait
