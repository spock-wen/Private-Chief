// cloudfunctions/setHostRole/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { openid } = event;

  try {
    // 更新用户角色
    const result = await db.collection('users').doc(openid).update({
      data: {
        isHost: true,
        updateTime: db.serverDate()
      }
    });

    return {
      success: true,
      message: '设置主人角色成功'
    };
  } catch (error) {
    console.error('设置主人角色失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};