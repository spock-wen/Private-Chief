#!/bin/bash

# API测试脚本
BASE_URL="http://223.109.200.65:8060/api"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}测试 $TOTAL_TESTS: $test_name${NC}"
    echo "请求: $method $url"
    
    if [ -n "$data" ]; then
        echo "数据: $data"
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ 通过${NC} (状态码: $http_code)"
        echo "响应: $body"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ 失败${NC} (期望: $expected_status, 实际: $http_code)"
        echo "响应: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo "----------------------------------------"
}

echo "=========================================="
echo "SpockChef API 测试"
echo "=========================================="
echo ""

# 1. 健康检查
test_api "健康检查" "GET" "$BASE_URL/" "" "200"

# 2. 创建菜品
dish_id=$(curl -s -X POST "$BASE_URL/dishes" \
    -H "Content-Type: application/json" \
    -d '{"name":"测试菜品","description":"这是一个测试菜品","category":"HOT_DISH","tags":["辣","香"]}' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$dish_id" ]; then
    echo -e "${GREEN}创建菜品成功，ID: $dish_id${NC}"
    test_api "创建菜品" "POST" "$BASE_URL/dishes" \
        '{"name":"测试菜品2","description":"另一个测试菜品","category":"COLD_DISH","tags":["酸","甜"]}' "201"
    
    # 3. 获取所有菜品
    test_api "获取所有菜品" "GET" "$BASE_URL/dishes" "" "200"
    
    # 4. 按分类获取菜品
    test_api "按分类获取菜品" "GET" "$BASE_URL/dishes?category=HOT_DISH" "" "200"
    
    # 5. 获取单个菜品
    test_api "获取单个菜品" "GET" "$BASE_URL/dishes/$dish_id" "" "200"
    
    # 6. 更新菜品
    test_api "更新菜品" "PATCH" "$BASE_URL/dishes/$dish_id" \
        '{"description":"更新后的描述"}' "200"
    
    # 7. 创建桌子
    table_id=$(curl -s -X POST "$BASE_URL/tables" \
        -H "Content-Type: application/json" \
        -d '{"name":"测试桌子","time":"2026-02-02T12:00:00Z","hostSessionId":"test-session-123","hostName":"测试主人"}' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$table_id" ]; then
        echo -e "${GREEN}创建桌子成功，ID: $table_id${NC}"
        test_api "创建桌子" "POST" "$BASE_URL/tables" \
            '{"name":"测试桌子2","time":"2026-02-02T18:00:00Z","hostSessionId":"test-session-456","hostName":"测试主人2"}' "201"
        
        # 8. 获取所有桌子
        test_api "获取所有桌子" "GET" "$BASE_URL/tables" "" "200"
        
        # 9. 获取单个桌子
        test_api "获取单个桌子" "GET" "$BASE_URL/tables/$table_id" "" "200"
        
        # 10. 更新候选菜品 (在PLANNING状态下)
        test_api "更新候选菜品" "PATCH" "$BASE_URL/tables/$table_id/candidates" \
            '{"dishIds":["'$dish_id'"],"sessionId":"test-session-123"}' "200"
        
        # 11. 更新桌子状态到VOTING
        test_api "更新桌子状态到VOTING" "PATCH" "$BASE_URL/tables/$table_id/status" \
            '{"status":"VOTING","sessionId":"test-session-123"}' "200"
        
        # 12. 加入桌子
        test_api "加入桌子" "POST" "$BASE_URL/tables/$table_id/guests" \
            '{"name":"测试客人","sessionId":"guest-session-789"}' "201"
        
        # 13. 获取桌子客人
        test_api "获取桌子客人" "GET" "$BASE_URL/tables/$table_id/guests" "" "200"
        
        # 14. 投票
        test_api "投票" "POST" "$BASE_URL/tables/$table_id/votes" \
            '{"sessionId":"guest-session-789","dishId":"'$dish_id'"}' "201"
        
        # 15. 获取投票热力图
        test_api "获取投票热力图" "GET" "$BASE_URL/tables/$table_id/votes/heatmap" "" "200"
        
        # 16. 取消投票
        test_api "取消投票" "DELETE" "$BASE_URL/tables/$table_id/votes/$dish_id" \
            '{"sessionId":"guest-session-789"}' "200"
        
        # 17. 更新桌子状态到LOCKED
        test_api "更新桌子状态到LOCKED" "PATCH" "$BASE_URL/tables/$table_id/status" \
            '{"status":"LOCKED","sessionId":"test-session-123"}' "200"
        
        # 18. 设置最终菜品
        test_api "设置最终菜品" "PATCH" "$BASE_URL/tables/$table_id/final" \
            '{"dishIds":["'$dish_id'"],"sessionId":"test-session-123"}' "200"
        
        # 19. 更新账单 (在LOCKED状态下)
        test_api "更新账单" "PATCH" "$BASE_URL/tables/$table_id/billing" \
            '{"totalExpense":150.50,"sessionId":"test-session-123"}' "200"
    else
        echo -e "${RED}创建桌子失败，跳过相关测试${NC}"
    fi
    
    # 19. 删除菜品
    test_api "删除菜品" "DELETE" "$BASE_URL/dishes/$dish_id" "" "200"
    
    # 19. 批量删除菜品
    test_api "批量删除菜品" "POST" "$BASE_URL/dishes/bulk-delete" \
        '{"ids":["'$dish_id'"]}' "201"
else
    echo -e "${RED}创建菜品失败，跳过相关测试${NC}"
fi

# 测试结果汇总
echo ""
echo "=========================================="
echo "测试结果汇总"
echo "=========================================="
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo "=========================================="

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}有测试失败，请检查！${NC}"
    exit 1
fi
