// cloudfunctions/getAllTables/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { page = 0, pageSize = 10, creatorId } = event;

  try {
    const openid = wxContext.OPENID;
    const currentCreatorId = creatorId || openid;

    // 查询该用户创建的饭桌，按创建时间倒序
    const result = await db.collection('tables')
      .where({
        creatorId: currentCreatorId
      })
      .orderBy('createTime', 'desc')
      .skip(page * pageSize)
      .limit(pageSize + 1) // 多查一条，用于判断是否还有更多
      .get();

    const tables = result.data || [];
    const hasMore = tables.length > pageSize;
    
    // 如果有多余的数据，移除最后一条
    if (hasMore) {
      tables.pop();
    }

    // 确保每个饭桌都有 id 字段
    const tablesWithId = tables.map(table => ({
      ...table,
      id: table._id,
      createTime: table.createTime ? new Date(table.createTime).toLocaleString('zh-CN') : '',
    }));

    return {
      success: true,
      tables: tablesWithId,
      hasMore: hasMore,
      page: page,
      pageSize: pageSize,
    };
  } catch (error) {
    console.error('获取饭桌列表失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

