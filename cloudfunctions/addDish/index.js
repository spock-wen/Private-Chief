// cloudfunctions/addDish/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { tableId, name, category, price, description, status, image } = event;

  try {
    const result = await db.collection('menus').add({
      data: {
        tableId,
        name,
        category: category || '其他',
        price: price || 0,
        description: description || '',
        status: status || 'available', // available, recommended, soldout
        image: image || '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
      },
    });

    return {
      success: true,
      dishId: result._id,
    };
  } catch (error) {
    console.error('添加菜品失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


