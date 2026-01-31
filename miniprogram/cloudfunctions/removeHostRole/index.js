// cloudfunctions/removeHostRole/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { openid } = event;

  try {
    const currentOpenid = openid || wxContext.OPENID;
    
    // 获取用户信息
    const user = await db.collection('users').doc(currentOpenid).get();
    if (user.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      };
    }

    const userData = user.data[0];
    
    // 检查是否是第一个主人
    if (userData.isFirstHost) {
      return {
        success: false,
        error: '第一个主人不可取消身份'
      };
    }

    // 检查是否为主人
    if (!userData.isHost) {
      return {
        success: false,
        error: '当前用户不是主人'
      };
    }

    // 更新用户角色
    await db.collection('users').doc(currentOpenid).update({
      data: {
        isHost: false,
        updateTime: db.serverDate()
      }
    });

    // 从所有饭桌的 hostIds 中移除该用户
    const userID = userData.userID;
    await db.collection('tables').where({
      hostIds: _.in([userID])
    }).update({
      data: {
        hostIds: _.pull(userID),
        updateTime: db.serverDate()
      }
    });

    return {
      success: true,
      message: '取消主人身份成功'
    };
  } catch (error) {
    console.error('取消主人身份失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

