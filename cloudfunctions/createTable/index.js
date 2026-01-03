// cloudfunctions/createTable/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { name, diningDate, diningTime, remark, collectPreferences, needPhoneAuth, creatorId } = event;

  try {
    const result = await db.collection('tables').add({
      data: {
        name,
        diningDate,
        diningTime,
        remark,
        collectPreferences: collectPreferences || false,
        needPhoneAuth: needPhoneAuth || false,
        creatorId, // 主人openid
        status: 'active', // active, confirmed, finished
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
      },
    });

    return {
      success: true,
      tableId: result._id,
    };
  } catch (error) {
    console.error('创建饭桌失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};