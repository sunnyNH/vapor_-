#!/bin/bash

set -e

echo "🚀 开始构建 Vapor Admin 项目..."

# 检查是否在正确的目录
if [ ! -f "Package.swift" ]; then
    echo "❌ 错误：请在 Vapor 项目根目录下运行此脚本"
    exit 1
fi

echo "📦 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ 前端依赖已存在，跳过安装"
fi

echo "🔨 构建前端项目..."
npm run build

echo "🧹 清理构建缓存..."
cd ..


echo "✅ 构建完成！"
echo ""
echo "📁 前端文件已输出到: Public/"
echo ""
echo "🎉 项目构建成功！可以部署了。"
