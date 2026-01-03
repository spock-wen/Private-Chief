// pages/host/confirm-menu/confirm-menu.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tableId: '',
    tableInfo: {},
    finalMenu: [],
    summary: {
      totalDishes: 0,
      totalQuantity: 0,
      totalPeople: 0,
    },
  },

  onLoad(options) {
    const tableId = options.tableId;
    if (!tableId) {
      util.showError('参数错误');
      wx.navigateBack();
      return;
    }

    this.setData({ tableId });
    this.loadData();
  },

  // 加载数据
  async loadData() {
    util.showLoading('加载中...');
    try {
      const [tableInfo, orders] = await Promise.all([
        api.getTableInfo(this.data.tableId),
        api.getOrders(this.data.tableId),
      ]);

      this.setData({ tableInfo });
      this.processFinalMenu(orders || []);
    } catch (error) {
      util.showError('加载失败');
    } finally {
      util.hideLoading();
    }
  },

  // 处理最终菜单
  processFinalMenu(orders) {
    // 按菜品分组
    const dishMap = {};
    const userSet = new Set();

    orders.forEach(order => {
      userSet.add(order.userId);
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

    const finalMenu = Object.values(dishMap);
    
    const totalQuantity = finalMenu.reduce((sum, item) => sum + item.totalQuantity, 0);

    this.setData({
      finalMenu,
      summary: {
        totalDishes: finalMenu.length,
        totalQuantity,
        totalPeople: userSet.size,
      },
    });
  },

  // 导出菜单
  exportMenu() {
    wx.showActionSheet({
      itemList: ['导出为文本', '生成图片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.exportAsText();
        } else if (res.tapIndex === 1) {
          this.exportAsImage();
        }
      },
    });
  },

  // 导出为文本
  exportAsText() {
    let text = `${this.data.tableInfo.name}\n`;
    if (this.data.tableInfo.diningDate) {
      text += `用餐时间：${this.data.tableInfo.diningDate} ${this.data.tableInfo.diningTime}\n`;
    }
    text += `\n最终菜单：\n`;

    this.data.finalMenu.forEach((item, index) => {
      text += `${index + 1}. ${item.dishName} × ${item.totalQuantity}\n`;
    });

    text += `\n总计：${this.data.summary.totalDishes} 道菜，共 ${this.data.summary.totalQuantity} 份\n`;
    text += `参与人数：${this.data.summary.totalPeople} 人`;

    wx.setClipboardData({
      data: text,
      success: () => {
        util.showSuccess('菜单已复制到剪贴板');
      },
    });
  },

  // 导出为图片
  exportAsImage() {
    util.showError('图片导出功能开发中');
  },

  // 完成
  finish() {
    wx.showModal({
      title: '完成',
      content: '菜单已确认，可以返回首页查看历史记录',
      showCancel: false,
      success: () => {
        wx.switchTab({
          url: '/pages/index/index',
        });
      },
    });
  },
});

