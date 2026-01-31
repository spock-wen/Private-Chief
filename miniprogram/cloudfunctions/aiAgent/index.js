const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 配置你的 API Key (此处仅为示例，实际使用请在环境变量中配置)
const API_KEY = process.env.AI_API_KEY || ''
const API_URL = 'https://api.deepseek.com/chat/completions' // 示例 API 地址

exports.main = async (event, context) => {
  const { query, agentType, tableId } = event
  const wxContext = cloud.getWXContext()

  try {
    // 1. 根据 agentType 获取上下文数据
    let systemPrompt = "你是一个乐于助人的AI助手。"
    let contextData = ""

    if (agentType === 'MENU_PLANNER') {
      systemPrompt = "你是一位专业的私厨顾问，负责根据现有菜品为用户推荐菜单。请语气亲切，专业。"
      
      // 获取当前所有可用菜品 (尝试获取，如果集合不存在则忽略)
      try {
        const dishesResult = await db.collection('menus').where({
          status: 'available' 
        }).limit(20).get()
        
        if (dishesResult.data.length > 0) {
          const dishNames = dishesResult.data.map(d => `${d.name}(${d.category})`).join(', ')
          contextData = `当前可用菜品库：${dishNames}。`
        } else {
          contextData = "当前菜品库为空。"
        }
      } catch (e) {
        console.warn("Menus collection might not exist or be accessible", e)
        contextData = "（暂时无法访问菜品库）"
      }

    } else if (agentType === 'DINING_ASSISTANT') {
      systemPrompt = "你是一位贴心的餐厅服务员，负责解答客人关于菜品的问题。"
    }

    // 2. 构造提示词
    const messages = [
      { role: "system", content: `${systemPrompt} ${contextData}` },
      { role: "user", content: query }
    ]

    // 3. 调用大模型 API (如果没有 Key，则返回模拟数据)
    let reply = ""
    if (API_KEY) {
      const response = await axios.post(API_URL, {
        model: "deepseek-chat",
        messages: messages
      }, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      })
      reply = response.data.choices[0].message.content
    } else {
      // 模拟回复逻辑，方便直接测试
      if (query.includes('推荐')) {
        reply = "根据您的需求，我推荐您尝试一下我们的招牌红烧肉，搭配清爽的拍黄瓜，非常适合今天的聚餐氛围。"
      } else if (query.includes('辣')) {
        reply = "如果您喜欢吃辣，我们的辣子鸡和水煮鱼绝对不能错过！"
      } else if (query.includes('菜单')) {
          reply = `当前我们的菜品库有：${contextData.replace('当前可用菜品库：', '') || '暂无数据'}。您想吃点什么？`
      } else {
        reply = `我是您的${agentType === 'MENU_PLANNER' ? '主厨顾问' : '点餐助手'}。您刚才问了：“${query}”。\n\n(提示：请在云函数中配置 API Key 以获取真实 AI 回复)`
      }
    }

    return {
      success: true,
      reply: reply
    }

  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message,
      reply: "抱歉，我的大脑暂时短路了，请稍后再试。"
    }
  }
}
