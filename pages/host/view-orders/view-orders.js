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
  },

  onShow() {
    this.loadOrders();
  },

  // 加载点菜记录
  async loadOrders() {
    util.showLoading('加载中...');
    try {
      const orders = await api.getOrders(this.data.tableId);
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
    wx.navigateBack();
  },
});

