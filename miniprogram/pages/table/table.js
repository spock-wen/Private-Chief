// pages/table/table.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    tables: [],
    currentPage: 0,
    pageSize: 10,
    hasMore: true,
    loading: false,
    isHost: false,
  },

  onLoad() {
    this.checkLoginAndLoad();
    this.startWatch();
  },

  onShow() {
    this.checkLoginAndLoad();
  },

  onUnload() {
    this.stopWatch();
  },

  // 开始实时监听
  startWatch() {
    if (!api.checkLoginStatus()) return;
    
    const db = wx.cloud.database();
    const watcher = db.collection('tables')
      .where({
        creatorId: app.globalData.openid
      })
      .watch({
        onChange: (snapshot) => {
          console.log('饭桌状态更新:', snapshot);
          this.loadTables(true);
        },
        onError: (err) => {
          console.error('监听失败:', err);
        },
      });

    this.setData({ watcher });
  },

  // 停止实时监听
  stopWatch() {
    if (this.data.watcher) {
      this.data.watcher.close();
      this.setData({ watcher: null });
    }
  },

  // 检查登录并加载数据
  async checkLoginAndLoad() {
    if (!api.checkLoginStatus()) {
      // 未登录，显示登录提示
      this.setData({
        tables: [],
        isHost: false,
      });
      return;
    }

    const isHost = app.globalData.userRole === 'host';
    this.setData({
      isHost: isHost,
    });

    if (isHost) {
      await this.loadTables(true);
    }
  },

  // 加载饭桌列表（分页）
  async loadTables(refresh = false) {
    if (this.data.loading) return;

    if (refresh) {
      this.setData({
        currentPage: 0,
        hasMore: true,
        tables: [],
        error: null, // 清除错误状态
      });
    }

    if (!this.data.hasMore) return;

    this.setData({ loading: true });
    util.showLoading('加载中...');

    try {
      const result = await api.getAllTables({
        page: this.data.currentPage,
        pageSize: this.data.pageSize,
      });

      if (!result || !result.tables) {
         throw new Error('返回数据格式错误');
      }

      const newTables = result.tables;
      const hasMore = newTables.length === this.data.pageSize;

      this.setData({
        tables: refresh ? newTables : this.data.tables.concat(newTables),
        currentPage: this.data.currentPage + 1,
        hasMore: hasMore,
        error: null,
      });
    } catch (error) {
      console.error('加载饭桌失败:', error);
      
      // 错误处理 UI
      this.setData({
        error: error.message || '加载失败，请重试',
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
      util.hideLoading();
      wx.stopPullDownRefresh(); // 停止下拉刷新
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTables(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadTables();
    }
  },

  // 创建饭桌
  createTable() {
    if (!api.checkLoginStatus()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile',
            });
          }
        },
      });
      return;
    }

    if (!this.data.isHost) {
      wx.showModal({
        title: '提示',
        content: '只有主人才能创建饭桌，首次创建饭桌将自动成为主人',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/host/create-table/create-table',
            });
          }
        },
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/host/create-table/create-table',
    });
  },

  // 进入饭桌
  enterTable(e) {
    console.log('enterTable triggered', e);
    const tableId = e.currentTarget.dataset.id;
    console.log('tableId:', tableId);
    console.log('current tables:', this.data.tables);
    
    const table = this.data.tables.find(t => (t.id === tableId || t._id === tableId));
    console.log('found table:', table);

    if (!table) {
      console.error('Table not found for id:', tableId);
      wx.showToast({
        title: '无法找到饭桌信息',
        icon: 'none'
      });
      return;
    }

    console.log('isHost:', this.data.isHost);
    console.log('table status:', table.status);

    if (this.data.isHost) {
      // 主人查看点菜情况或菜单管理
      if (table.status === 'confirmed') {
        console.log('Navigating to confirm-menu');
        wx.navigateTo({
          url: `/pages/host/confirm-menu/confirm-menu?tableId=${tableId}`,
          fail: (err) => console.error('Navigation failed:', err)
        });
      } else {
        console.log('Navigating to view-orders');
        wx.navigateTo({
          url: `/pages/host/view-orders/view-orders?tableId=${tableId}`,
          fail: (err) => console.error('Navigation failed:', err)
        });
      }
    } else {
      // 客人进入饭桌
      console.log('Navigating to guest menu-view');
      wx.navigateTo({
        url: `/pages/guest/menu-view/menu-view?tableId=${tableId}`,
        fail: (err) => console.error('Navigation failed:', err)
      });
    }
  },

  // 扫码进入饭桌
  scanCode() {
    wx.scanCode({
      success: (res) => {
        // 解析二维码中的tableId
        const match = res.result.match(/tableId=([^&]+)/);
        if (match && match[1]) {
          const tableId = match[1];
          wx.navigateTo({
            url: `/pages/guest/enter-table/enter-table?tableId=${tableId}`,
          });
        } else {
          util.showError('无效的二维码');
        }
      },
      fail: (error) => {
        console.error('扫码失败:', error);
        util.showError('扫码失败');
      },
    });
  },
});

