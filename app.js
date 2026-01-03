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

    // 恢复登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    // 检查本地是否有登录信息
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');

    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
    if (userRole) {
      this.globalData.userRole = userRole;
    }
  },

  // 登录功能
  login() {
    return new Promise(async (resolve, reject) => {
      try {
        // 调用微信登录接口获取code
        const loginRes = await wx.login();
        
        if (!loginRes.code) {
          throw new Error('获取用户登录态失败: ' + loginRes.errMsg);
        }

        // 调用云函数进行登录
        const cloudResult = await wx.cloud.callFunction({
          name: 'login', // 假设有一个名为 login 的云函数
          data: {
            code: loginRes.code
          }
        });

        const resultData = cloudResult.result;

        if (resultData.success) {
          // 保存用户信息
          wx.setStorageSync('userInfo', resultData.userInfo);
          wx.setStorageSync('userRole', resultData.userRole);
          this.globalData.userInfo = resultData.userInfo;
          this.globalData.userRole = resultData.userRole;
          this.globalData.openid = resultData.openid; // 保存openid
          
          resolve(resultData);
        } else {
          throw new Error(resultData.error || '登录失败');
        }
      } catch (error) {
        console.error('登录失败:', error);
        reject(error);
      }
    });
  },

  // 检查用户是否为主人
  isHost() {
    return this.globalData.userRole === 'host';
  },

  // 检查用户是否为客人
  isGuest() {
    return this.globalData.userRole === 'guest' || !this.globalData.userRole;
  },

  globalData: {
    userInfo: null,
    currentTableId: null, // 当前饭桌ID
    userRole: null, // 'host' 或 'guest'
    currentTable: null, // 当前饭桌信息
    openid: null, // 用户的openid
  }
});