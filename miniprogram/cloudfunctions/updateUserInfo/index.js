// cloudfunctions/updateUserInfo/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { userInfo } = event;

  try {
    if (!userInfo) {
      throw new Error('用户信息不能为空');
    }

    // 更新用户信息
    // 仅更新允许的字段，防止污染
    const updateData = {
      updateTime: db.serverDate()
    };

    if (userInfo.nickName) updateData.nickName = userInfo.nickName;
    if (userInfo.avatarUrl) updateData.avatarUrl = userInfo.avatarUrl;

    await db.collection('users').doc(openid).update({
      data: updateData
    });

    return {
      success: true,
      message: '更新成功'
    };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
