// pages/host/history/history.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    historyTables: [],
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  // 加载历史记录
  async loadHistory() {
    util.showLoading('加载中...');
    try {
      // 获取所有饭桌记录，按时间倒序
      const tables = await wx.cloud.database().collection('tables')
        .orderBy('createTime', 'desc')
        .get();
      
      this.setData({
        historyTables: tables.data || [],
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
      util.showError('加载失败');
    } finally {
      util.hideLoading();
    }
  },

  // 查看饭桌
  viewTable(e) {
    const tableId = e.currentTarget.dataset.id;
    const table = this.data.historyTables.find(t => t._id === tableId || t.id === tableId);
    
    if (table.status === 'confirmed') {
      // 已确认的查看最终菜单
      wx.navigateTo({
        url: `/pages/host/confirm-menu/confirm-menu?tableId=${tableId}`,
      });
    } else {
      // 进行中的查看点菜情况
      wx.navigateTo({
        url: `/pages/host/view-orders/view-orders?tableId=${tableId}`,
      });
    }
  },

  // 复用菜单
  async reuseMenu(e) {
    const tableId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '复用菜单',
      content: '将使用该饭桌的菜单创建新饭桌',
      success: async (res) => {
        if (res.confirm) {
          util.showLoading('加载中...');
          try {
            // 获取原饭桌的菜单
            const menu = await api.getTableMenu(tableId);
            if (!menu || menu.length === 0) {
              util.showError('该饭桌没有菜单');
              return;
            }

            // 跳转到创建饭桌页面，并传递菜单数据
            wx.navigateTo({
              url: `/pages/host/create-table/create-table?reuseMenu=1&sourceTableId=${tableId}`,
            });
          } catch (error) {
            util.showError('操作失败');
          } finally {
            util.hideLoading();
          }
        }
      },
    });
  },

  stopPropagation() {},
});

