// cloudfunctions/deleteDish/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { dishId } = event;

  try {
    // 删除菜品
    await db.collection('menus').doc(dishId).remove();
    
    // 同时删除相关的订单
    await db.collection('orders').where({
      dishId,
    }).remove();

    return {
      success: true,
    };
  } catch (error) {
    console.error('删除菜品失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


