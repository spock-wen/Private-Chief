// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-6g19ve794269f8ba', // 请替换为你的云开发环境ID
        traceUser: true,
      });
    }

    // 获取用户信息
    this.getUserInfo();
  },

  getUserInfo() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
            }
          });
        }
      }
    });
  },

  globalData: {
    userInfo: null,
    currentTableId: null, // 当前饭桌ID
    userRole: null, // 'host' 或 'guest'
    currentTable: null, // 当前饭桌信息
  }
});


