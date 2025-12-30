// cloudfunctions/orderDish/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { tableId, userId, userName, dishId, quantity, note } = event;

  try {
    // 检查是否已存在该用户的该菜品订单
    const existingOrder = await db.collection('orders')
      .where({
        tableId,
        userId,
        dishId,
      })
      .get();

    if (existingOrder.data.length > 0) {
      // 更新现有订单
      await db.collection('orders').doc(existingOrder.data[0]._id).update({
        data: {
          quantity,
          note: note || '',
          updateTime: db.serverDate(),
        },
      });

      return {
        success: true,
        orderId: existingOrder.data[0]._id,
      };
    } else {
      // 创建新订单
      // 获取菜品信息
      const dish = await db.collection('menus').doc(dishId).get();
      const dishName = dish.data ? dish.data.name : '未知菜品';

      const result = await db.collection('orders').add({
        data: {
          tableId,
          userId,
          userName: userName || '未命名用户',
          dishId,
          dishName,
          quantity: quantity || 1,
          note: note || '',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        },
      });

      return {
        success: true,
        orderId: result._id,
      };
    }
  } catch (error) {
    console.error('点菜失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


