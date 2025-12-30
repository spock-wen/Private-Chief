// utils/api.js
// API调用工具函数

// 数据库集合名称
const DB_TABLES = 'tables'; // 饭桌集合
const DB_MENUS = 'menus'; // 菜单集合
const DB_ORDERS = 'orders'; // 点菜记录集合

/**
 * 创建饭桌
 */
function createTable(tableData) {
  return wx.cloud.callFunction({
    name: 'createTable',
    data: tableData,
  }).then(res => {
    if (res.result.success) {
      return res.result.tableId;
    }
    throw new Error(res.result.error || '创建失败');
  });
}

/**
 * 获取饭桌信息
 */
function getTable(tableId) {
  return wx.cloud.database().collection(DB_TABLES)
    .doc(tableId)
    .get()
    .then(res => {
      const data = res.data;
      if (data && data._id) {
        data.id = data._id;
      }
      return data;
    });
}

/**
 * 获取最近饭桌
 */
function getRecentTables() {
  return wx.cloud.database().collection(DB_TABLES)
    .orderBy('createTime', 'desc')
    .limit(5)
    .get()
    .then(res => {
      const data = res.data || [];
      return data.map(item => {
        if (item._id) item.id = item._id;
        return item;
      });
    })
    .catch(err => {
      console.error('获取最近饭桌失败:', err);
      return [];
    });
}

/**
 * 添加菜品
 */
function addDish(tableId, dishData) {
  return wx.cloud.callFunction({
    name: 'addDish',
    data: {
      tableId,
      ...dishData,
    },
  }).then(res => {
    if (res.result.success) {
      return res.result.dishId;
    }
    throw new Error(res.result.error || '添加失败');
  });
}

/**
 * 获取菜单
 */
function getMenu(tableId) {
  return wx.cloud.database().collection(DB_MENUS)
    .where({
      tableId,
    })
    .get()
    .then(res => {
      const data = res.data || [];
      return data.map(item => {
        if (item._id) item.id = item._id;
        return item;
      });
    });
}

/**
 * 点菜
 */
function orderDish(tableId, userId, userName, dishId, quantity, note) {
  return wx.cloud.callFunction({
    name: 'orderDish',
    data: {
      tableId,
      userId,
      userName,
      dishId,
      quantity,
      note,
    },
  }).then(res => {
    if (res.result.success) {
      return res.result;
    }
    throw new Error(res.result.error || '点菜失败');
  });
}

/**
 * 获取点菜记录
 */
function getOrders(tableId) {
  return wx.cloud.database().collection(DB_ORDERS)
    .where({
      tableId,
    })
    .get()
    .then(res => {
      const data = res.data || [];
      return data.map(item => {
        if (item._id) item.id = item._id;
        return item;
      });
    });
}

/**
 * 获取用户点菜记录
 */
function getUserOrders(tableId, userId) {
  return wx.cloud.database().collection(DB_ORDERS)
    .where({
      tableId,
      userId,
    })
    .get()
    .then(res => {
      const data = res.data || [];
      return data.map(item => {
        if (item._id) item.id = item._id;
        return item;
      });
    });
}

/**
 * 确认菜单
 */
function confirmMenu(tableId) {
  return wx.cloud.callFunction({
    name: 'confirmMenu',
    data: {
      tableId,
    },
  }).then(res => {
    if (res.result.success) {
      return res.result;
    }
    throw new Error(res.result.error || '确认失败');
  });
}

/**
 * 删除菜品
 */
function deleteDish(dishId) {
  return wx.cloud.callFunction({
    name: 'deleteDish',
    data: {
      dishId,
    },
  });
}

/**
 * 更新菜品
 */
function updateDish(dishId, data) {
  return wx.cloud.callFunction({
    name: 'updateDish',
    data: {
      dishId,
      ...data,
    },
  });
}

/**
 * 删除点菜记录
 */
function deleteOrder(orderId) {
  return wx.cloud.callFunction({
    name: 'deleteOrder',
    data: {
      orderId,
    },
  });
}

/**
 * 更新点菜记录
 */
function updateOrder(orderId, data) {
  return wx.cloud.callFunction({
    name: 'updateOrder',
    data: {
      orderId,
      ...data,
    },
  });
}

module.exports = {
  createTable,
  getTable,
  getRecentTables,
  addDish,
  getMenu,
  orderDish,
  getOrders,
  getUserOrders,
  confirmMenu,
  deleteDish,
  updateDish,
  deleteOrder,
  updateOrder,
};

