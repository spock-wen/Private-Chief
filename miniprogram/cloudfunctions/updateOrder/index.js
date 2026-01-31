// cloudfunctions/updateOrder/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { orderId, ...updateData } = event;

  try {
    await db.collection('orders').doc(orderId).update({
      data: {
        ...updateData,
        updateTime: db.serverDate(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('更新订单失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


