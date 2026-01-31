// cloudfunctions/updateDish/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { dishId, image, ...updateData } = event;

  try {
    let imageUrl = '';
    let thumbnailUrl = '';

    // 处理图片上传
    if (image) {
      try {
        // 上传图片到云存储
        const uploadResult = await cloud.uploadFile({
          cloudPath: `dish_images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`,
          fileContent: Buffer.from(image, 'base64')
        });
        imageUrl = uploadResult.fileID;
        
        // 生成缩略图（使用云函数或图片处理API）
        // 注意：微信云开发不直接支持图片处理，需要调用第三方服务或使用云函数处理
        // 这里简化处理，使用原图作为缩略图
        thumbnailUrl = imageUrl;
      } catch (uploadError) {
        console.warn('上传图片失败:', uploadError);
      }
    }

    const finalUpdateData = {
      ...updateData,
      updateTime: db.serverDate(),
    };

    if (imageUrl) {
      finalUpdateData.image = imageUrl;
    }
    if (thumbnailUrl) {
      finalUpdateData.thumbnail = thumbnailUrl;
    }

    await db.collection('menus').doc(dishId).update({
      data: finalUpdateData,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('更新菜品失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


