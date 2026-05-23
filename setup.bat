@echo off
echo ========================================
echo   情侣相册 - 数据库初始化脚本
echo ========================================
echo.

echo [1/3] 启动数据库...
docker compose up -d
if %errorlevel% neq 0 (
    echo 错误：Docker 启动失败，请确保 Docker Desktop 已运行
    pause
    exit /b 1
)

echo.
echo [2/3] 等待数据库就绪...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] 运行数据库迁移...
cd packages\server
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo 错误：数据库迁移失败
    pause
    exit /b 1
)

echo.
echo [4/4] 填充测试数据...
call npx prisma db seed

echo.
echo ========================================
echo   数据库初始化完成！
echo ========================================
echo.
echo 现在可以运行以下命令启动项目：
echo   1. pnpm dev:server  (启动后端)
echo   2. pnpm dev:client  (启动前端)
echo.
pause
