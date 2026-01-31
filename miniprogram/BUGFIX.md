# 错误修复说明

## 修复的问题

### 1. API函数名不匹配
**问题：** 页面中使用了旧的API函数名，但API已经重构

**修复：**
- `api.getTable()` → `api.getTableInfo()`
- `api.getMenu()` → `api.getTableMenu()`
- `api.addDish()` → `api.createMenuItem()` + `api.addDishToTable()`

**影响的文件：**
- `pages/guest/menu-view/menu-view.js`
- `pages/guest/enter-table/enter-table.js`
- `pages/guest/order-dish/order-dish.js`
- `pages/host/menu-manage/menu-manage.js`
- `pages/host/confirm-menu/confirm-menu.js`
- `pages/host/view-orders/view-orders.js`
- `pages/host/history/history.js`

### 2. 数据格式问题
**问题：** 云数据库返回的数据使用 `_id`，但页面代码使用 `id`

**修复：** 在所有API函数中添加了数据转换逻辑，确保返回的数据包含 `id` 字段

**修复的函数：**
- `getTableInfo()`
- `getTableMenu()`
- `getGlobalMenu()`
- `getOrders()`
- `getUserOrders()`
- `getRecentTables()`

### 3. 登录状态恢复
**问题：** `app.js` 的 `onLaunch` 中没有恢复登录状态

**修复：** 在 `onLaunch` 中调用 `checkLoginStatus()`

## 当前可能仍存在的问题

1. **云函数缺失：** 确保以下云函数已部署：
   - `loginUser`
   - `setHostRole`
   - `getTableInfo`
   - `getRecentTables`
   - `createMenuItem`
   - `getGlobalMenu`
   - `addDishToTable`
   - `getTableMenu`
   - `getOrders`
   - `getUserOrders`

2. **数据库集合：** 确保创建了所有必要的集合：
   - `users`
   - `tables`
   - `menus` (全局菜单)
   - `table_menu_items` (饭桌菜单关联)
   - `orders`

3. **组件路径错误：** 如果仍有 `Component is not found in path "wx://not-found"` 错误，可能是：
   - 页面中引用了不存在的组件
   - `app.json` 中配置了不存在的组件路径

## 测试建议

1. 清除缓存并重新编译
2. 检查控制台错误信息
3. 逐步测试每个功能模块
4. 查看云函数日志排查调用问题

