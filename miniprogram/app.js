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

    // 尝试恢复登录状态（自动登录）
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    // 检查本地是否有登录信息
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');
    const userID = wx.getStorageSync('userID');
    const isFirstHost = wx.getStorageSync('isFirstHost');
    const rememberMe = wx.getStorageSync('rememberMe');

    // 检查是否过期（简单示例，实际可用时间戳）
    // 如果没有勾选"记住我"，则每次启动不自动恢复敏感权限，但这里为了演示"自动登录"，我们默认如果存在则恢复
    // 用户提到的"token"机制，在云开发中主要是openid，这里我们验证本地缓存的有效性
    
    if (userInfo && userID) {
      // 恢复全局数据
      this.globalData.userInfo = userInfo;
      this.globalData.userID = userID;
      this.globalData.userRole = userRole || 'guest';
      this.globalData.isFirstHost = isFirstHost || false;
      
      // 可以在这里调用一个云函数 verifyToken 来验证身份有效性，
      // 但 wx.cloud.callFunction 自动带鉴权，所以如果 openid 变了（切换微信账号），
      // 云函数逻辑会处理。这里主要恢复 UI 状态。
      console.log('自动登录成功:', this.globalData.userInfo.nickName);
    } else {
      // 未登录
      console.log('未检测到登录信息，需手动登录');
    }
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
    userID: null, // 唯一用户码
    currentTableId: null, // 当前饭桌ID
    userRole: null, // 'host' 或 'guest'
    isFirstHost: false, // 是否为第一个主人
    currentTable: null, // 当前饭桌信息
    openid: null, // 用户的openid
  }
});