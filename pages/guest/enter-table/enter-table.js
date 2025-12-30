// pages/guest/enter-table/enter-table.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
  data: {
    tableId: '',
    inputTableId: '',
    tableInfo: null,
    nickName: '',
    userInfo: {},
  },

  onLoad(options) {
    // 从链接参数获取tableId
    const tableId = options.tableId;
    if (tableId) {
      this.setData({ tableId, inputTableId: tableId });
      this.loadTableInfo();
    }

    // 获取用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        nickName: app.globalData.userInfo.nickName || '',
      });
    }
  },

  // 输入饭桌ID
  onTableIdInput(e) {
    this.setData({
      inputTableId: e.detail.value,
    });
  },

  // 通过ID进入
  async enterByTableId() {
    const tableId = this.data.inputTableId.trim();
    if (!tableId) {
      util.showError('请输入饭桌ID');
      return;
    }

    this.setData({ tableId });
    await this.loadTableInfo();
  },

  // 加载饭桌信息
  async loadTableInfo() {
    if (!this.data.tableId) return;

    util.showLoading('加载中...');
    try {
      const tableInfo = await api.getTable(this.data.tableId);
      
      if (!tableInfo) {
        util.showError('饭桌不存在');
        return;
      }

      if (tableInfo.status === 'confirmed') {
        util.showError('该饭桌已确认，无法继续点菜');
        return;
      }

      this.setData({ tableInfo });
    } catch (error) {
      util.showError('加载饭桌信息失败');
    } finally {
      util.hideLoading();
    }
  },

  // 输入昵称
  onNickNameInput(e) {
    this.setData({
      nickName: e.detail.value,
    });
  },

  // 扫码
  scanQRCode() {
    wx.scanCode({
      success: (res) => {
        // 从扫码结果中提取tableId
        const tableId = res.result || res.path?.split('tableId=')[1];
        if (tableId) {
          this.setData({ tableId, inputTableId: tableId });
          this.loadTableInfo();
        } else {
          util.showError('无效的二维码');
        }
      },
      fail: (err) => {
        console.error('扫码失败:', err);
      },
    });
  },

  // 确认进入
  confirmEnter() {
    if (!this.data.tableInfo) {
      util.showError('请先选择饭桌');
      return;
    }

    const nickName = this.data.nickName.trim() || this.data.userInfo.nickName || '未命名用户';
    
    if (!nickName) {
      util.showError('请输入昵称');
      return;
    }

    // 保存用户信息到全局
    app.globalData.currentTableId = this.data.tableId;
    app.globalData.userRole = 'guest';

    // 跳转到菜单页面
    wx.redirectTo({
      url: `/pages/guest/menu-view/menu-view?tableId=${this.data.tableId}&nickName=${encodeURIComponent(nickName)}`,
    });
  },
});


