# 💕 情侣共享相册

一个浪漫的照片分享平台，记录你们的每一个美好瞬间。

## 功能特性

- 🖼️ 多种布局模式（瀑布流、网格、时间线、宝丽来等 12 种）
- ✨ 丰富的交互动画（25 种动画效果）
- 🔍 照片缩放（双指/滚轮缩放）
- 📱 响应式设计（手机、平板、电脑都能用）
- 💬 留言评论功能
- 🔗 私密分享链接
- ❤️ 情侣专属功能（纪念日、悄悄话等）

## 快速开始

### 1. 启动数据库

```bash
docker-compose up -d
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp packages/server/.env.example packages/server/.env
```

### 3. 初始化数据库

```bash
pnpm db:migrate
pnpm db:seed
```

### 4. 启动后端

```bash
pnpm dev:server
```

### 5. 启动前端

```bash
pnpm dev:client
```

### 6. 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000/api

## 测试账号

- 用户名：`boy` / 密码：`123456`
- 用户名：`girl` / 密码：`123456`

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS + Framer Motion
- Zustand (状态管理)
- PhotoSwipe (图片查看)
- react-zoom-pan-pinch (缩放)
- dnd-kit (拖拽)

### 后端
- Express 5 + TypeScript
- Prisma ORM + PostgreSQL
- Redis
- Sharp (图片处理)
- JWT 认证

## 项目结构

```
couple-album/
├── packages/
│   ├── client/        # 前端 React 应用
│   ├── server/        # 后端 Express 应用
│   └── shared/        # 共享类型
├── uploads/           # 上传的照片存储
└── docker-compose.yml # 数据库配置
```

## 部署

### Docker 部署

```bash
docker-compose up -d
```

### 生产环境

1. 构建前端：
```bash
pnpm build:client
```

2. 构建后端：
```bash
pnpm build:server
```

3. 启动服务：
```bash
pnpm start
```
