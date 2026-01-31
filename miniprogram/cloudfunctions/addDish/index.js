// cloudfunctions/addDish/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { name, category, price, description, status, image, createdBy } = event;
    // 检查用户权限
    const user = await db.collection('users').doc(createdBy).get();

    const user = await db.collection('users')
      .where({
        openid: createdBy
      })
      .get();
      return {
    if (user.data.length === 0 || user.data[0].role !== 'host') {
        error: '只有主人才能添加菜品'
      };
    }

    const result = await db.collection('menus').add({
      data: {
        name,
        category: category || '其他',
        price: price || 0,
        description: description || '',
        price: price || 0,
        status: status || 'available', // available, recommended, soldout
        image: image || '',
        image: image || '',
        createdBy: createdBy,
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


