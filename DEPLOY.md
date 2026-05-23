# 情侣相册部署指南（完全免费）

## 方案：Vercel + Render

- **前端**: Vercel（免费）
- **后端**: Render.com（免费层 750小时/月）
- **存储**: Render 持久化磁盘

---

## 第一步：部署后端到 Render

### 1. 注册 Render 账号
- 访问 https://render.com
- 用 GitHub 账号登录

### 2. 创建 Web Service
1. 点击 "New +" → "Web Service"
2. 连接你的 GitHub 仓库
3. 选择 `couple-album` 仓库
4. 配置：
   - **Name**: `couple-album-api`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
   - **Dockerfile Path**: `./packages/server/Dockerfile`

### 3. 添加环境变量
```
DATABASE_URL=file:./couple-album.db
JWT_SECRET=你的密钥（随便填一串字符）
CORS_ORIGIN=https://你的前端地址.vercel.app
NODE_ENV=production
PORT=10000
```

### 4. 添加持久化磁盘
1. 在 "Disks" 部分点击 "Add Disk"
2. **Name**: `couple-album-data`
3. **Mount Path**: `/app/uploads`
4. **Size**: 1 GB

### 5. 部署
- 点击 "Create Web Service"
- 等待部署完成（约5-10分钟）
- 记下后端地址，如 `https://couple-album-api.onrender.com`

---

## 第二步：部署前端到 Vercel

### 1. 注册 Vercel 账号
- 访问 https://vercel.com
- 用 GitHub 账号登录

### 2. 导入项目
1. 点击 "Add New..." → "Project"
2. 选择 `couple-album` 仓库
3. 配置：
   - **Framework Preset**: `Vite`
   - **Root Directory**: `packages/client`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`

### 3. 添加环境变量
```
VITE_API_URL=https://couple-album-api.onrender.com
```

### 4. 部署
- 点击 "Deploy"
- 等待部署完成
- 获得前端地址，如 `https://couple-album.vercel.app`

---

## 第三步：更新后端 CORS

部署前端后，回到 Render，更新环境变量：
```
CORS_ORIGIN=https://couple-album.vercel.app
```

然后重新部署后端。

---

## 完成！

现在你可以通过 `https://couple-album.vercel.app` 访问你的情侣相册了！

## 注意事项

1. **Render 免费层限制**：
   - 15分钟无请求会休眠，首次访问需等待30秒左右
   - 750小时/月运行时间（足够24/7运行）

2. **数据备份**：
   - 定期下载 `/app/uploads` 文件夹备份照片
   - 数据库在 `/app/packages/server/couple-album.db`

3. **自定义域名**（可选）：
   - Vercel 和 Render 都支持绑定自定义域名
   - 需要有自己的域名

4. **HTTPS**：
   - Vercel 和 Render 都自动提供 HTTPS
   - 无需额外配置
