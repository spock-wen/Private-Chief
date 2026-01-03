// cloudfunctions/loginUser/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { code, userInfo } = event;

  try {
    // 获取用户信息
    const userLoginResult = await cloud.openapi.auth.getSessionKey({
      jsCode: code
    });

    const openid = wxContext.OPENID;
    const unionid = wxContext.UNIONID || null;

    // 检查用户是否已存在
    let userRecord = await db.collection('users')
      .where({
        _id: openid
      })
      .get();

    let isHost = false;

    if (userRecord.data.length > 0) {
      // 用户已存在，更新信息
      isHost = userRecord.data[0].isHost;
      
      await db.collection('users').doc(openid).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          updateTime: db.serverDate()
        }
      });
    } else {
      // 新用户，创建记录
      await db.collection('users').add({
        data: {
          _id: openid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          isHost: false, // 默认不是主人
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
    }

    return {
      success: true,
      openid: openid,
      unionid: unionid,
      userInfo: {
        _id: openid,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        isHost: isHost
      },
      isHost: isHost
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};