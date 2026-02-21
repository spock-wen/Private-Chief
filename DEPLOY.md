# SpockChef 私厨 - 部署指南

## 前置要求

- 服务器已安装 Docker 和 Docker Compose
- 服务器可访问外网（用于拉取镜像和 npm 依赖）
- 本地已配置 SSH 免密登录（用于 deploy.sh 远程部署）

## 方式一：本地 Docker 部署（开发/测试）

在项目根目录执行：

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

- **前端**：http://localhost:8060
- **后端 API**：http://localhost:8070
- **数据库**：PostgreSQL 5432（仅容器内网可访问）

## 方式二：部署到远程服务器

### 1. 使用部署脚本（推荐）

```bash
# 赋予执行权限
chmod +x deploy.sh

# 部署到服务器（替换为你的服务器地址）
./deploy.sh user@your-server.com
```

脚本会：
1. 使用 rsync 同步代码到服务器 `~/Private-Chief/`
2. 在服务器上执行 `docker compose up -d --build`

### 2. 手动部署

```bash
# 1. 将代码上传到服务器
scp -r . user@server:~/Private-Chief/

# 2. SSH 登录服务器
ssh user@server

# 3. 进入项目目录并启动
cd ~/Private-Chief
docker compose -f docker/docker-compose.yml up -d --build
```

## 环境变量

### 后端

通过 `docker-compose.yml` 的 `environment` 配置：

- `DATABASE_URL`：数据库连接（默认使用容器内 PostgreSQL）

### 前端

生产环境如需修改 WebSocket 地址，在构建前端镜像时传入：

```bash
# 在 Dockerfile.frontend 的 build 阶段添加 ARG
# 或修改 front/.env.production
VITE_WS_URL=http://你的服务器IP或域名:8070
```

当前前端使用 `/api` 代理到后端，API 请求与页面同源；WebSocket 需指向实际后端地址。

## 数据库密码

默认在 `docker-compose.yml` 中：

- 用户：`postgres`
- 密码：`wenspock`
- 数据库：`spockchef`

**生产环境请修改为强密码。**

## 端口说明

| 服务   | 端口 | 说明           |
|--------|------|----------------|
| 前端   | 8060 | Nginx 静态 + API 代理 |
| 后端   | 8070 | NestJS API + WebSocket |
| 数据库 | 5432 | PostgreSQL（建议仅内网暴露） |

## 常用命令

```bash
# 查看日志
docker compose -f docker/docker-compose.yml logs -f

# 停止服务
docker compose -f docker/docker-compose.yml down

# 重新构建并启动
docker compose -f docker/docker-compose.yml up -d --build
```
