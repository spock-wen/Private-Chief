#!/bin/bash

# Exit on error
set -e

# Configuration
SERVER_USER="root"
SERVER_IP="223.109.200.65"
DEPLOY_PATH="~/spockchef"
TEMP_ARCHIVE="deploy.tar.gz"

# 端口配置
FRONTEND_PORT=8060
BACKEND_PORT=8070

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure we are in the script's directory
cd "$(dirname "$0")"

echo -e "${GREEN}Deploying SpockChef to $SERVER_IP using SCP/TAR (Compatibility Mode)...${NC}"

# 1. Check if SERVER_IP is set
if [ -z "$SERVER_IP" ]; then
    read -p "Enter Server IP: " SERVER_IP
fi

if [ -z "$SERVER_USER" ]; then
    read -p "Enter Server User (e.g., root): " SERVER_USER
fi

# 2. Create a local archive (excluding heavy/unnecessary folders)
echo -e "${GREEN}Creating local archive...${NC}"
# Use a temporary directory for the archive to avoid "file changed as we read it" error
TEMP_ARCHIVE_PATH="/tmp/$TEMP_ARCHIVE"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    TEMP_ARCHIVE_PATH="./$TEMP_ARCHIVE"
fi

# We ignore exit code 1 from tar (file changed as we read it) which is common on Windows
tar -czf "$TEMP_ARCHIVE" \
    --exclude='node_modules' \
    --exclude='front/node_modules' \
    --exclude='background/node_modules' \
    --exclude='front/dist' \
    --exclude='background/dist' \
    --exclude='.git' \
    --exclude='.env.local' \
    --exclude="$TEMP_ARCHIVE" \
    . || [ $? -eq 1 ]

# 3. Upload archive to server
echo -e "${GREEN}Uploading archive...${NC}"
scp "$TEMP_ARCHIVE" "$SERVER_USER@$SERVER_IP:/tmp/"

# 4. Extract and Deploy on server
echo -e "${GREEN}Extracting and starting container on server...${NC}"
ssh "$SERVER_USER@$SERVER_IP" "
    mkdir -p $DEPLOY_PATH && \
    tar -xzf /tmp/$TEMP_ARCHIVE -C $DEPLOY_PATH && \
    rm /tmp/$TEMP_ARCHIVE && \
    cd $DEPLOY_PATH && \
    echo '=== Checking Docker compatibility ===' && \
    docker --version && \
    docker-compose --version && \
    echo '=== Stopping existing containers ===' && \
    docker-compose down || true && \
    echo '=== Building and starting new containers ===' && \
    # Add timeout to docker-compose build to prevent hanging
    timeout 300 docker-compose up -d --build || {
        echo '=== Build timeout or error ==='
        echo '=== Checking Docker daemon status ==='
        systemctl status docker || true
        echo '=== Checking network connectivity ==='
        ping -c 3 deb.debian.org || true
        exit 1
    }
    echo '=== Container status ===' && \
    docker-compose ps
"

# 5. Cleanup local archive
rm "$TEMP_ARCHIVE"

# 6. Show deployment status
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Frontend: http://$SERVER_IP:$FRONTEND_PORT"
echo -e "Backend API: http://$SERVER_IP:$FRONTEND_PORT/api"
echo -e "Backend Direct: http://$SERVER_IP:$BACKEND_PORT"
echo -e ""
echo -e "${GREEN}Deployment Notes:${NC}"
echo -e "1. Container uses Docker network for communication"
echo -e "2. Frontend accesses backend through Nginx reverse proxy"
echo -e "3. Currently using IP address access, domain can be added later by modifying nginx.conf"
echo -e "4. To stop services: docker-compose down"
echo -e "5. To view logs: docker-compose logs -f"
