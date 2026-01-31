// pages/host/view-orders/view-orders.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tableId: '',
    viewMode: 'by-person', // 'by-person' 或 'by-dish'
    orders: [],
    ordersByPerson: [],
    ordersByDish: [],
    watcher: null, // 实时监听器
  },

  onLoad(options) {
    const tableId = options.tableId;
    if (!tableId) {
      util.showError('参数错误');
      wx.navigateBack();
      return;
    }

    this.setData({ tableId });
    this.loadOrders();
    this.startWatch();
  },

  onShow() {
    this.loadOrders();
  },

  onUnload() {
    this.stopWatch();
  },

  // 开始实时监听
  startWatch() {
    if (!this.data.tableId) return;
    
    const db = wx.cloud.database();
    const watcher = db.collection('orders')
      .where({
        tableId: this.data.tableId
      })
      .watch({
        onChange: (snapshot) => {
          console.log('点菜记录更新:', snapshot);
          this.loadOrders();
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

  // 加载点菜记录
  async loadOrders() {
    util.showLoading('加载中...');
    try {
      // 主人模式，获取所有订单
      const orders = await api.getOrders(this.data.tableId, null);
      this.setData({ orders: orders || [] });
      this.processOrders();
    } catch (error) {
      util.showError('加载点菜记录失败');
    } finally {
      util.hideLoading();
    }
  },

  // 处理点菜数据
  processOrders() {
    const orders = this.data.orders;
    
    // 按人分组
    const personMap = {};
    orders.forEach(order => {
      const userId = order.userId;
      const orderId = order.id || order._id;
      if (!personMap[userId]) {
        personMap[userId] = {
          userId,
          userName: order.userName || '未知用户',
          orders: [],
          totalQuantity: 0,
        };
      }
      personMap[userId].orders.push({
        ...order,
        id: orderId,
      });
      personMap[userId].totalQuantity += order.quantity || 1;
    });

    // 按菜品分组
    const dishMap = {};
    orders.forEach(order => {
      const dishId = order.dishId;
      const orderId = order.id || order._id;
      if (!dishMap[dishId]) {
        dishMap[dishId] = {
          dishId,
          dishName: order.dishName || '未知菜品',
          orders: [],
          totalQuantity: 0,
        };
      }
      dishMap[dishId].orders.push({
        ...order,
        id: orderId,
      });
      dishMap[dishId].totalQuantity += order.quantity || 1;
    });

    this.setData({
      ordersByPerson: Object.values(personMap),
      ordersByDish: Object.values(dishMap),
    });
  },

  // 切换查看模式
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ viewMode: mode });
  },

  // 分享饭桌
  shareTable() {
    const tableId = this.data.tableId;
    wx.showActionSheet({
      itemList: ['复制链接', '生成小程序码'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const link = `pages/guest/enter-table/enter-table?tableId=${tableId}`;
          wx.setClipboardData({
            data: link,
            success: () => {
              util.showSuccess('链接已复制到剪贴板');
            },
          });
        } else if (res.tapIndex === 1) {
          util.showError('小程序码功能需要后端支持');
        }
      },
    });
  },

  // 确认菜单
  async confirmMenu() {
    wx.showModal({
      title: '确认菜单',
      content: '确认后将生成最终菜单，客人将无法继续点菜',
      success: async (res) => {
        if (res.confirm) {
          util.showLoading('确认中...');
          try {
            await api.confirmMenu(this.data.tableId);
            util.showSuccess('确认成功');
            setTimeout(() => {
              wx.navigateTo({
                url: `/pages/host/confirm-menu/confirm-menu?tableId=${this.data.tableId}`,
              });
            }, 1500);
          } catch (error) {
            util.showError(error.message || '确认失败');
          } finally {
            util.hideLoading();
          }
        }
      },
    });
  },

  // 返回菜单管理
  goToMenuManage() {
    const pages = getCurrentPages();
    if (pages.length > 1 && pages[pages.length - 2].route === 'pages/host/menu-manage/menu-manage') {
      wx.navigateBack();
    } else {
      wx.navigateTo({
        url: `/pages/host/menu-manage/menu-manage?tableId=${this.data.tableId}`,
      });
    }
  },
});

