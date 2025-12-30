// pages/index/index.js
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    recentTables: [],
  },

  onLoad() {
    this.loadRecentTables();
  },

  onShow() {
    this.loadRecentTables();
  },

  // 加载最近饭桌
  async loadRecentTables() {
    try {
      const tables = await api.getRecentTables();
      this.setData({
        recentTables: tables || [],
      });
    } catch (error) {
      console.error('加载最近饭桌失败:', error);
    }
  },

  // 创建饭桌
  createTable() {
    wx.navigateTo({
      url: '/pages/host/create-table/create-table',
    });
  },

  // 进入饭桌（扫码/链接）
  enterTable() {
    // 可以扫码或输入链接
    wx.navigateTo({
      url: '/pages/guest/enter-table/enter-table',
    });
  },

  // 通过ID进入饭桌
  enterTableById(e) {
    const tableId = e.currentTarget.dataset.id;
    if (!tableId) {
      util.showError('饭桌ID无效');
      return;
    }
    wx.navigateTo({
      url: `/pages/guest/enter-table/enter-table?tableId=${tableId}`,
    });
  },
});

