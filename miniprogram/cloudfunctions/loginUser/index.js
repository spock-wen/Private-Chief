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
    const openid = wxContext.OPENID;
    const unionid = wxContext.UNIONID || null;

    // 生成唯一用户码
    const generateUserID = () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      return `USER_${timestamp}_${random}`;
    };

    // 检查用户是否已存在
    const userRecord = await db.collection('users')
      .where({
        _id: openid
      })
      .get();

    let isHost = false;
    let isFirstHost = false;
    let userID = null;

    if (userRecord.data.length > 0) {
      // 用户已存在，更新信息
      const user = userRecord.data[0];
      isHost = user.isHost || false;
      isFirstHost = user.isFirstHost || false;
      userID = user.userID;
      
      await db.collection('users').doc(openid).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          updateTime: db.serverDate()
        }
      });
    } else {
      // 新用户，创建记录并生成唯一用户码
      userID = generateUserID();
      
      // 检查是否是第一个主人
      const hostCount = await db.collection('users').where({ isHost: true }).count();
      if (hostCount.total === 0) {
        isHost = true;
        isFirstHost = true; // 第一个主人不可取消
      }
      
      await db.collection('users').add({
        data: {
          _id: openid,
          openid: openid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          isHost: isHost,
          isFirstHost: isFirstHost,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
    }

    return {
      success: true,
      openid: openid,
      unionid: unionid,
      userID: userID,
      userInfo: {
        _id: openid,
        userID: userID,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        isHost: isHost,
        isFirstHost: isFirstHost
      },
      isHost: isHost,
      isFirstHost: isFirstHost
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};