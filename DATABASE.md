# 数据库设计文档

## 集合说明

### 1. tables（饭桌集合）

存储所有饭桌信息。

**字段说明：**
- `_id`: 系统自动生成的唯一ID
- `name`: 饭桌名称（必填）
- `diningDate`: 用餐日期（格式：YYYY-MM-DD）
- `diningTime`: 用餐时间（格式：HH:mm）
- `remark`: 备注信息
- `collectPreferences`: 是否收集客人口味偏好（Boolean）
- `needPhoneAuth`: 是否需要手机号验证（Boolean）
- `status`: 饭桌状态
  - `active`: 进行中（客人可点菜）
  - `confirmed`: 已确认（主人已确认菜单）
  - `finished`: 已结束
- `createTime`: 创建时间（Date）
- `updateTime`: 更新时间（Date）

**索引建议：**
- `createTime` 降序索引（用于查询历史记录）
- `status` 索引（用于筛选状态）

**权限设置：**
- 读取：所有用户可读
- 创建：所有用户可创建
- 更新：仅创建者可更新
- 删除：仅创建者可删除

---

### 2. menus（菜单集合）

存储所有菜品信息。

**字段说明：**
- `_id`: 系统自动生成的唯一ID
- `tableId`: 所属饭桌ID（必填，关联tables集合）
- `name`: 菜品名称（必填）
- `category`: 菜品分类
  - 热菜
  - 凉菜
  - 汤品
  - 主食
  - 饮品
  - 其他
- `price`: 价格（Number，单位：元）
- `description`: 菜品描述
- `status`: 菜品状态
  - `available`: 可选择
  - `recommended`: 推荐
  - `soldout`: 售罄
- `image`: 菜品图片URL
- `createTime`: 创建时间（Date）
- `updateTime`: 更新时间（Date）

**索引建议：**
- `tableId` 索引（用于查询某饭桌的菜单）
- `category` 索引（用于分类筛选）

**权限设置：**
- 读取：所有用户可读
- 创建：所有用户可创建
- 更新：仅创建者可更新
- 删除：仅创建者可删除

---

### 3. orders（订单/点菜记录集合）

存储所有点菜记录。

**字段说明：**
- `_id`: 系统自动生成的唯一ID
- `tableId`: 所属饭桌ID（必填，关联tables集合）
- `userId`: 用户ID（必填，用于标识点菜的用户）
- `userName`: 用户昵称（必填）
- `dishId`: 菜品ID（必填，关联menus集合）
- `dishName`: 菜品名称（冗余字段，提高查询效率）
- `quantity`: 数量（Number，必填，默认1）
- `note`: 备注信息（如：少辣、不要香菜）
- `createTime`: 创建时间（Date）
- `updateTime`: 更新时间（Date）

**索引建议：**
- `tableId` 索引（用于查询某饭桌的点菜记录）
- `userId` 索引（用于查询某用户的点菜）
- `dishId` 索引（用于查询某菜品的点菜情况）
- 联合索引：`(tableId, userId)` 和 `(tableId, dishId)`

**权限设置：**
- 读取：所有用户可读
- 创建：所有用户可创建
- 更新：仅创建者可更新
- 删除：仅创建者可删除

---

## 数据库初始化

### 在云开发控制台执行以下步骤：

1. **创建集合**
   - 进入云开发控制台
   - 点击"数据库"
   - 点击"添加集合"
   - 依次创建 `tables`、`menus`、`orders` 三个集合

2. **设置权限**
   - 点击集合名称进入详情
   - 点击"权限设置"
   - 根据需要设置权限（建议：所有人可读，仅创建者可写）

3. **创建索引**（可选，提升查询性能）
   - 点击集合名称进入详情
   - 点击"索引管理"
   - 添加上述建议的索引

---

## 数据关联关系

```
tables (饭桌)
  ├── menus (菜单) [tableId 关联]
  └── orders (订单) [tableId 关联]
        └── menus (菜品) [dishId 关联]
```

---

## 示例数据

### tables 示例
```json
{
  "_id": "table_001",
  "name": "周六家庭聚餐",
  "diningDate": "2024-01-20",
  "diningTime": "18:00",
  "remark": "今天吃辣的",
  "collectPreferences": true,
  "needPhoneAuth": false,
  "status": "active",
  "createTime": "2024-01-19T10:00:00.000Z",
  "updateTime": "2024-01-19T10:00:00.000Z"
}
```

### menus 示例
```json
{
  "_id": "dish_001",
  "tableId": "table_001",
  "name": "宫保鸡丁",
  "category": "热菜",
  "price": 38,
  "description": "经典川菜，麻辣鲜香",
  "status": "available",
  "image": "https://example.com/image.jpg",
  "createTime": "2024-01-19T10:05:00.000Z",
  "updateTime": "2024-01-19T10:05:00.000Z"
}
```

### orders 示例
```json
{
  "_id": "order_001",
  "tableId": "table_001",
  "userId": "user_001",
  "userName": "张三",
  "dishId": "dish_001",
  "dishName": "宫保鸡丁",
  "quantity": 2,
  "note": "少辣",
  "createTime": "2024-01-19T11:00:00.000Z",
  "updateTime": "2024-01-19T11:00:00.000Z"
}
```

---

## 数据清理策略

建议定期清理过期数据：

1. **finished 状态的饭桌**
   - 可以保留30天
   - 30天后自动归档或删除

2. **关联数据清理**
   - 删除饭桌时，同时删除关联的菜单和订单
   - 删除菜品时，同时删除关联的订单

（注：当前云函数已实现部分自动清理逻辑）


