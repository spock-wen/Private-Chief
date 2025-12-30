// cloudfunctions/confirmMenu/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { tableId } = event;

  try {
    await db.collection('tables').doc(tableId).update({
      data: {
        status: 'confirmed',
        updateTime: db.serverDate(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('确认菜单失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


