// cloudfunctions/deleteOrder/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { orderId } = event;

  try {
    await db.collection('orders').doc(orderId).remove();

    return {
      success: true,
    };
  } catch (error) {
    console.error('删除订单失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


