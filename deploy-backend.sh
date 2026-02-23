#!/usr/bin/env bash
# SpockChef 后端部署脚本
# 用法：./deploy-backend.sh

set -e

SERVER="root@223.109.200.65"
PROJECT_NAME="spockchef"
REMOTE_DIR="~/$PROJECT_NAME"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo "SpockChef 后端部署"
echo "========================================"
echo "服务器: $SERVER"
echo "本地目录: $LOCAL_DIR"
echo "远程目录: $REMOTE_DIR"
echo ""

# 1. 测试 SSH 连接
echo ">>> 1. 测试 SSH 连接..."
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER" "echo 'SSH 连接成功'" || {
  echo "错误: 无法连接到服务器 $SERVER"
  exit 1
}
echo "SSH 连接成功"
echo ""

# 2. 检查服务器上的 Docker 环境
echo ">>> 2. 检查服务器 Docker 环境..."
ssh "$SERVER" "
  if ! command -v docker &> /dev/null; then
    echo '错误: 服务器上未安装 Docker'
    exit 1
  fi
  if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo '错误: 服务器上未安装 Docker Compose'
    exit 1
  fi
  echo 'Docker 环境检查通过'
"
echo ""

# 3. 创建远程目录并同步文件
echo ">>> 3. 同步项目文件到服务器..."
ssh "$SERVER" "mkdir -p $REMOTE_DIR"

if command -v rsync &> /dev/null; then
  echo "使用 rsync 同步文件..."
  rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'coverage' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"
else
  echo "使用 tar + ssh 同步文件..."
  tar --exclude='node_modules' \
      --exclude='dist' \
      --exclude='.git' \
      --exclude='coverage' \
      --exclude='*.log' \
      --exclude='.DS_Store' \
      -czf - -C "$LOCAL_DIR" . \
    | ssh "$SERVER" "cd $REMOTE_DIR && tar -xzf -"
fi
echo "文件同步完成"
echo ""

# 4. 在服务器上构建并启动 Docker Compose
echo ">>> 4. 在服务器上构建并启动服务..."
ssh "$SERVER" "
  cd $REMOTE_DIR
  
  # 停止并删除旧容器
  echo '停止旧容器...'
  docker compose -f docker/docker-compose.yml down 2>/dev/null || docker-compose -f docker/docker-compose.yml down 2>/dev/null || true
  
  # 清理旧镜像（可选）
  # docker image prune -f
  
  # 构建并启动新容器
  echo '构建并启动新容器...'
  docker compose -f docker/docker-compose.yml up -d --build 2>/dev/null || docker-compose -f docker/docker-compose.yml up -d --build
  
  # 等待服务启动
  echo '等待服务启动...'
  sleep 10
  
  # 显示容器状态
  echo ''
  echo '容器状态:'
  docker ps --filter 'name=spockchef' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
"
echo ""

# 5. 验证服务状态
echo ">>> 5. 验证服务状态..."
sleep 5
ssh "$SERVER" "
  cd $REMOTE_DIR
  
  # 检查后端服务
  echo '检查后端服务日志...'
  docker logs spockchef-backend --tail 20
  
  echo ''
  echo '检查数据库服务...'
  docker logs spockchef-db --tail 10
"
echo ""

echo "========================================"
echo "部署完成！"
echo "========================================"
echo ""
echo "服务访问地址:"
echo "  后端 API: http://223.109.200.65:8070"
echo "  前端: http://223.109.200.65:8060"
echo ""
echo "查看日志命令:"
echo "  ssh $SERVER 'cd $REMOTE_DIR && docker logs -f spockchef-backend'"
echo ""
echo "停止服务命令:"
echo "  ssh $SERVER 'cd $REMOTE_DIR && docker compose -f docker/docker-compose.yml down'"
echo ""
