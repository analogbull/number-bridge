@echo off
setlocal enabledelayedexpansion
title Number Bridge - 本地运行
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [提示] 未检测到 Node.js。请先安装 Node.js (建议 18+)，再双击运行本脚本。
  echo 下载地址: https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [步骤] 安装依赖...
  call npm install
  if errorlevel 1 (
    echo [错误] 安装依赖失败
    pause
    exit /b 1
  )
)

echo [步骤] 构建生产版本...
call npm run build
if errorlevel 1 (
  echo [错误] 构建失败
  pause
  exit /b 1
)

echo [步骤] 启动本地预览服务...
call npm run preview
if errorlevel 1 (
  echo [错误] 预览服务启动失败
  pause
  exit /b 1
)

endlocal
