#!/usr/bin/env bash
# SpockChef 私厨 - 部署脚本
# 用法：在项目根目录执行 ./deploy.sh [服务器地址]
# 示例：./deploy.sh user@your-server.com

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE="${1:-}"

if [ -z "$REMOTE" ]; then
  echo "用法: $0 <user@server>"
  echo "示例: $0 root@192.168.1.100"
  echo ""
  echo "本地部署（Docker Compose）:"
  echo "  cd $PROJECT_DIR"
  echo "  docker compose -f docker/docker-compose.yml up -d --build"
  exit 1
fi

echo ">>> 部署到 $REMOTE"
echo ">>> 项目目录: $PROJECT_DIR"

# 1. 同步代码到服务器
echo ""
echo ">>> 1. 同步代码..."
if command -v rsync &>/dev/null; then
  rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
    "$PROJECT_DIR/" "$REMOTE:~/Private-Chief/"
else
  # 无 rsync 时使用 tar + ssh
  tar --exclude='node_modules' --exclude='dist' --exclude='.git' -czf - -C "$PROJECT_DIR" . \
    | ssh "$REMOTE" "mkdir -p ~/Private-Chief && cd ~/Private-Chief && tar -xzf -"
fi

# 2. 在服务器上构建并启动
echo ""
echo ">>> 2. 在服务器上构建并启动 Docker..."
ssh "$REMOTE" "cd ~/Private-Chief && (docker compose -f docker/docker-compose.yml up -d --build 2>/dev/null || docker-compose -f docker/docker-compose.yml up -d --build)"

echo ""
echo ">>> 部署完成！"
echo ">>> 前端: http://<服务器IP>:8060"
echo ">>> 后端 API: http://<服务器IP>:8070"
