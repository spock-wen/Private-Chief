Page({
  data: {
    msgList: [
      { role: 'ai', content: '你好！我是你的智能主厨顾问，有什么可以帮你的吗？' }
    ],
    inputValue: '',
    isLoading: false,
    scrollTarget: ''
  },

  handleInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  async sendMessage() {
    const content = this.data.inputValue.trim()
    if (!content || this.data.isLoading) return

    // 1. 添加用户消息
    const newMsgList = [...this.data.msgList, { role: 'user', content }]
    this.setData({
      msgList: newMsgList,
      inputValue: '',
      isLoading: true,
      scrollTarget: `msg-${newMsgList.length - 1}`
    })

    // 滚动到底部
    this.scrollToBottom()

    try {
      // 2. 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'aiAgent',
        data: {
          query: content,
          agentType: 'MENU_PLANNER' // 默认作为主厨顾问
        }
      })

      const reply = res.result.reply || '抱歉，我没有听懂。'

      // 3. 添加 AI 回复
      const updatedMsgList = [...this.data.msgList, { role: 'user', content }, { role: 'ai', content: reply }]
      this.setData({
        msgList: updatedMsgList,
        isLoading: false,
        scrollTarget: `msg-${updatedMsgList.length - 1}`
      })
      
      this.scrollToBottom()

    } catch (err) {
      console.error(err)
      wx.showToast({ title: '请求失败', icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  scrollToBottom() {
    setTimeout(() => {
        this.setData({
            scrollTarget: 'bottom-anchor'
        })
    }, 100)
  }
})
