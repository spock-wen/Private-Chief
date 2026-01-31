// cloudfunctions/createTable/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { name, diningDate, diningTime, remark, collectPreferences, needPhoneAuth, creatorId } = event;

  console.log('createTable invoked with:', { event, openid });

  try {
    const targetId = creatorId || openid;
    if (!targetId) {
      throw new Error('无法获取用户ID');
    }

    // 获取创建者信息
    const creator = await db.collection('users').doc(targetId).get();
    
    // 检查 creator.data 是否存在
    if (!creator || !creator.data) {
      console.error('User not found or data is empty:', creator);
      return {
        success: false,
        error: '用户不存在或数据为空'
      };
    }

    const creatorData = creator.data;
    
    // 检查 userID 是否存在
    if (!creatorData.userID) {
       console.error('User data missing userID:', creatorData);
       // 尝试重新生成或修复? 暂时返回错误
       return {
         success: false,
         error: '用户信息不完整(userID缺失)'
       };
    }

    const userID = creatorData.userID;
    
    // 检查用户是否已经是主人，如果不是，设置为第一个主人
    let isFirstHost = false;
    if (!creatorData.isHost) {
      const hostCount = await db.collection('users').where({ isHost: true }).count();
      if (hostCount.total === 0) {
        isFirstHost = true;
      }
      await db.collection('users').doc(creatorId || openid).update({
        data: {
          isHost: true,
          isFirstHost: isFirstHost
        }
      });
    }

    // 创建饭桌记录
    const result = await db.collection('tables').add({
      data: {
        name,
        diningDate,
        diningTime,
        remark,
        collectPreferences,
        needPhoneAuth,
        creatorId: creatorId || openid,
        creatorName: creatorData.nickName || '用户',
        creatorAvatar: creatorData.avatarUrl,
        status: 'active',
        qrcode: '',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });

    // 生成二维码
    let qrcodeUrl = '';
    try {
      const qrcodeResult = await cloud.openapi.wxacode.createQRCode({
        path: `/pages/guest/menu-view/menu-view?tableId=${result._id}`,
        width: 280
      });

      // 上传二维码到云存储
      const uploadResult = await cloud.uploadFile({
        cloudPath: `table_qrcodes/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`,
        fileContent: qrcodeResult.buffer
      });
      qrcodeUrl = uploadResult.fileID;
      
      // 更新饭桌的二维码字段
      await db.collection('tables').doc(result._id).update({
        data: {
          qrcode: qrcodeUrl,
          updateTime: db.serverDate()
        }
      });
    } catch (qrcodeError) {
      console.warn('生成二维码失败:', qrcodeError);
      // 二维码生成失败不影响饭桌创建
    }

    return {
      success: true,
      tableId: result._id,
      qrcode: qrcodeUrl,
      isFirstHost: isFirstHost
    };
  } catch (error) {
    console.error('创建饭桌失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};