FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY packages/server/package.json ./packages/server/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY packages/server ./packages/server

# 生成 Prisma Client
RUN cd packages/server && npx prisma generate

# 构建
RUN cd packages/server && pnpm build

# 创建上传目录
RUN mkdir -p /app/uploads/original /app/uploads/large /app/uploads/medium /app/uploads/thumbnail

# 暴露端口
EXPOSE 10000

# 启动
CMD ["node", "packages/server/dist/server.js"]
