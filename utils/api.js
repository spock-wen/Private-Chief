// utils/api.js
// API调用工具函数

// 数据库集合名称
const DB_TABLES = 'tables'; // 饭桌集合
const DB_MENUS = 'menus'; // 菜单集合
const DB_ORDERS = 'orders'; // 点菜记录集合
const DB_USERS = 'users'; // 用户集合
const DB_TABLE_MENU_ITEMS = 'table_menu_items'; // 饭桌菜单项集合

/**
 * 用户登录
 */
function loginUser(userInfo) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        if (res.code) {
          // 调用云函数处理登录
          wx.cloud.callFunction({
            name: 'loginUser',
            data: {
              code: res.code,
              userInfo: userInfo
            }
          }).then(loginRes => {
            if (loginRes.result.success) {
              // 保存用户信息到全局
              const app = getApp();
              app.globalData.openid = loginRes.result.openid;
              app.globalData.userInfo = loginRes.result.userInfo;
              app.globalData.userRole = loginRes.result.isHost ? 'host' : 'guest';
              
              // 保存到本地存储
              wx.setStorageSync('userInfo', loginRes.result.userInfo);
              wx.setStorageSync('userRole', app.globalData.userRole);
              
              resolve(loginRes.result);
            } else {
              reject(new Error(loginRes.result.error || '登录失败'));
            }
          }).catch(error => {
            console.error('登录云函数调用失败:', error);
            reject(error);
          });
        } else {
          console.error('获取用户登录态失败:', res.errMsg);
          reject(new Error(res.errMsg));
        }
      },
      fail: error => {
        console.error('微信登录失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 检查登录状态
 */
function checkLoginStatus() {
  const app = getApp();
  return app.globalData.openid && app.globalData.userRole;
}

/**
 * 设置用户为主人角色
 */
function setHostRole() {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  return wx.cloud.callFunction({
    name: 'setHostRole',
    data: {
      openid: app.globalData.openid
    }
  }).then(res => {
    if (res.result.success) {
      app.globalData.userRole = 'host';
      wx.setStorageSync('userRole', 'host');
      return res.result;
    }
    throw new Error(res.result.error || '设置主人角色失败');
  });
}

/**
 * 创建饭桌（仅主人可操作）
 */
function createTable(tableData) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能创建饭桌'));
  }
  
  return wx.cloud.callFunction({
    name: 'createTable',
    data: {
      ...tableData,
      creatorId: app.globalData.openid
    },
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
function getTableInfo(tableId) {
  return wx.cloud.callFunction({
    name: 'getTableInfo',
    data: {
      tableId: tableId
    }
  }).then(res => {
    if (res.result.success) {
      const table = res.result.table;
      // 确保有 id 字段
      if (table && table._id && !table.id) {
        table.id = table._id;
      }
      return table;
    }
    throw new Error(res.result.error || '获取饭桌信息失败');
  });
}

/**
 * 获取最近饭桌（仅主人可操作）
 */
function getRecentTables() {
  const app = getApp();
  if (!checkLoginStatus() || app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能查看历史饭桌'));
  }
  
  return wx.cloud.callFunction({
    name: 'getRecentTables',
    data: {
      creatorId: app.globalData.openid
    }
  }).then(res => {
    if (res.result.success) {
      const tables = res.result.tables || [];
      // 确保每个饭桌都有 id 字段
      return tables.map(table => {
        if (table._id && !table.id) {
          table.id = table._id;
        }
        return table;
      });
    }
    throw new Error(res.result.error || '获取历史饭桌失败');
  });
}

/**
 * 创建全局菜品（仅主人可操作）
 */
function createMenuItem(dishData) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能创建菜品'));
  }
  
  return wx.cloud.callFunction({
    name: 'createMenuItem',
    data: {
      ...dishData,
      creatorId: app.globalData.openid
    },
  }).then(res => {
    if (res.result.success) {
      return res.result.dishId;
    }
    throw new Error(res.result.error || '添加失败');
  });
}

/**
 * 获取全量菜单
 */
function getGlobalMenu() {
  return wx.cloud.callFunction({
    name: 'getGlobalMenu',
    data: {}
  }).then(res => {
    if (res.result.success) {
      const menus = res.result.menus || [];
      // 确保每个菜品都有 id 字段
      return menus.map(item => {
        if (item._id && !item.id) {
          item.id = item._id;
        }
        return item;
      });
    }
    throw new Error(res.result.error || '获取菜单失败');
  });
}

/**
 * 更新菜品信息（仅主人可操作）
 */
function updateDish(dishId, data) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能更新菜品'));
  }
  
  return wx.cloud.callFunction({
    name: 'updateDish',
    data: {
      dishId,
      ...data
    },
  });
}

/**
 * 删除菜品（仅主人可操作）
 */
function deleteDish(dishId) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能删除菜品'));
  }
  
  return wx.cloud.callFunction({
    name: 'deleteDish',
    data: {
      dishId
    },
  });
}

/**
 * 将菜品添加到饭桌菜单（仅主人可操作）
 */
function addDishToTable(tableId, dishId) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能为饭桌添加菜品'));
  }
  
  return wx.cloud.callFunction({
    name: 'addDishToTable',
    data: {
      tableId,
      dishId,
      addedBy: app.globalData.openid
    },
  });
}

/**
 * 获取饭桌菜单
 */
function getTableMenu(tableId) {
  return wx.cloud.callFunction({
    name: 'getTableMenu',
    data: {
      tableId
    }
  }).then(res => {
    if (res.result.success) {
      const dishes = res.result.dishes || [];
      // 确保每个菜品都有 id 字段
      return dishes.map(dish => {
        if (dish._id && !dish.id) {
          dish.id = dish._id;
        }
        return dish;
      });
    }
    throw new Error(res.result.error || '获取饭桌菜单失败');
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
 * 修改点菜记录
 */
function updateOrder(orderId, data) {
  return wx.cloud.callFunction({
    name: 'updateOrder',
    data: {
      orderId,
      ...data
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
      orderId
    },
  });
}

/**
 * 获取点菜记录（主人获取全部，客人获取自己的）
 */
function getOrders(tableId, userId = null) {
  const app = getApp();
  const isHost = app.globalData.userRole === 'host';
  
  return wx.cloud.callFunction({
    name: 'getOrders',
    data: {
      tableId,
      userId: isHost ? null : (userId || app.globalData.openid)
    },
  }).then(res => {
    if (res.result.success) {
      const orders = res.result.orders || [];
      // 确保每个订单都有 id 字段
      return orders.map(order => {
        if (order._id && !order.id) {
          order.id = order._id;
        }
        return order;
      });
    }
    throw new Error(res.result.error || '获取点菜记录失败');
  });
}

/**
 * 获取用户点菜记录
 */
function getUserOrders(tableId, userId) {
  return wx.cloud.callFunction({
    name: 'getUserOrders',
    data: {
      tableId,
      userId
    },
  }).then(res => {
    if (res.result.success) {
      const orders = res.result.orders || [];
      // 确保每个订单都有 id 字段
      return orders.map(order => {
        if (order._id && !order.id) {
          order.id = order._id;
        }
        return order;
      });
    }
    throw new Error(res.result.error || '获取用户点菜记录失败');
  });
}

/**
 * 确认菜单（仅主人可操作）
 */
function confirmMenu(tableId) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能确认菜单'));
  }
  
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
 * 上传菜品图片
 */
function uploadDishImage(filePath, dishId) {
  if (!checkLoginStatus()) {
    return Promise.reject(new Error('请先登录'));
  }
  
  const app = getApp();
  if (app.globalData.userRole !== 'host') {
    return Promise.reject(new Error('只有主人才能上传菜品图片'));
  }
  
  // 上传文件到云存储
  return wx.cloud.uploadFile({
    cloudPath: `dish_images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`,
    filePath: filePath
  }).then(uploadRes => {
    // 更新菜品的图片字段
    return wx.cloud.callFunction({
      name: 'updateDish',
      data: {
        dishId: dishId,
        image: uploadRes.fileID
      }
    });
  });
}

module.exports = {
  loginUser,
  checkLoginStatus,
  setHostRole,
  createTable,
  getTableInfo,
  getRecentTables,
  createMenuItem,
  getGlobalMenu,
  updateDish,
  deleteDish,
  addDishToTable,
  getTableMenu,
  orderDish,
  updateOrder,
  deleteOrder,
  getOrders,
  getUserOrders,
  confirmMenu,
  uploadDishImage,
};