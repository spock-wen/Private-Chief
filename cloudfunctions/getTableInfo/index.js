// cloudfunctions/getTableInfo/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { tableId } = event;

  try {
    const result = await db.collection('tables').doc(tableId).get();

    if (result.data) {
      return {
        success: true,
        table: result.data
      };
    } else {
      return {
        success: false,
        error: '饭桌不存在'
      };
    }
  } catch (error) {
    console.error('获取饭桌信息失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};