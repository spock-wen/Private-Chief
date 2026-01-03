// pages/guest/order-dish/order-dish.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tableId: '',
    userId: '',
    nickName: '',
    viewAll: false,
    viewMode: 'my', // 'my' 或 'all'
    myOrderList: [],
    myTotalQuantity: 0,
    myTotalPrice: 0,
    ordersByPerson: [],
  },

  onLoad(options) {
    const tableId = options.tableId;
    const userId = options.userId;
    const nickName = options.nickName;
    const viewAll = options.viewAll === '1';

    if (!tableId || !userId) {
      util.showError('参数错误');
      wx.navigateBack();
      return;
    }

    this.setData({
      tableId,
      userId,
      nickName: decodeURIComponent(nickName || '未命名用户'),
      viewAll,
      viewMode: viewAll ? 'all' : 'my',
    });

    if (viewAll) {
      this.loadAllOrders();
    } else {
      this.loadMyOrders();
    }
  },

  onShow() {
    if (this.data.viewAll && this.data.viewMode === 'all') {
      this.loadAllOrders();
    } else {
      this.loadMyOrders();
    }
  },

  // 加载我的点菜
  async loadMyOrders() {
    util.showLoading('加载中...');
    try {
      const orders = await api.getUserOrders(this.data.tableId, this.data.userId);
      
      // 获取菜品信息以显示价格和名称
      const menu = await api.getTableMenu(this.data.tableId);
      const menuMap = {};
      menu.forEach(dish => {
        const dishId = dish.id || dish._id;
        menuMap[dishId] = dish;
      });

      const myOrderList = orders.map(order => {
        const orderId = order.id || order._id;
        return {
          ...order,
          id: orderId,
          dishName: menuMap[order.dishId]?.name || '未知菜品',
          price: menuMap[order.dishId]?.price || 0,
        };
      });

      const totalQuantity = myOrderList.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = myOrderList.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      this.setData({
        myOrderList,
        myTotalQuantity: totalQuantity,
        myTotalPrice: totalPrice,
      });
    } catch (error) {
      util.showError('加载失败');
    } finally {
      util.hideLoading();
    }
  },

  // 加载所有点菜
  async loadAllOrders() {
    util.showLoading('加载中...');
    try {
      const orders = await api.getOrders(this.data.tableId);
      
      // 获取菜品信息
      const menu = await api.getTableMenu(this.data.tableId);
      const menuMap = {};
      menu.forEach(dish => {
        const dishId = dish.id || dish._id;
        menuMap[dishId] = dish;
      });

      // 按人分组
      const personMap = {};
      orders.forEach(order => {
        const userId = order.userId;
        if (!personMap[userId]) {
          personMap[userId] = {
            userId,
            userName: order.userName || '未知用户',
            orders: [],
            totalQuantity: 0,
          };
        }
        const orderWithInfo = {
          ...order,
          dishName: menuMap[order.dishId]?.name || '未知菜品',
        };
        personMap[userId].orders.push(orderWithInfo);
        personMap[userId].totalQuantity += order.quantity || 1;
      });

      this.setData({
        ordersByPerson: Object.values(personMap),
      });
    } catch (error) {
      util.showError('加载失败');
    } finally {
      util.hideLoading();
    }
  },

  // 切换查看模式
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ viewMode: mode });
    
    if (mode === 'all') {
      this.loadAllOrders();
    } else {
      this.loadMyOrders();
    }
  },

  // 增加数量
  async increaseQuantity(e) {
    const orderId = e.currentTarget.dataset.id;
    const order = this.data.myOrderList.find(o => o.id === orderId);
    if (!order) return;

    const newQuantity = order.quantity + 1;

    util.showLoading('操作中...');
    try {
      await api.updateOrder(orderId, {
        quantity: newQuantity,
      });
      await this.loadMyOrders();
      util.showSuccess('更新成功');
    } catch (error) {
      util.showError('操作失败');
    } finally {
      util.hideLoading();
    }
  },

  // 减少数量
  async decreaseQuantity(e) {
    const orderId = e.currentTarget.dataset.id;
    const order = this.data.myOrderList.find(o => o.id === orderId);
    if (!order) return;

    if (order.quantity <= 1) {
      return;
    }

    const newQuantity = order.quantity - 1;

    util.showLoading('操作中...');
    try {
      await api.updateOrder(orderId, {
        quantity: newQuantity,
      });
      await this.loadMyOrders();
    } catch (error) {
      util.showError('操作失败');
    } finally {
      util.hideLoading();
    }
  },

  // 删除订单
  async deleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜品吗？',
      success: async (res) => {
        if (res.confirm) {
          util.showLoading('删除中...');
          try {
            await api.deleteOrder(orderId);
            await this.loadMyOrders();
            util.showSuccess('删除成功');
          } catch (error) {
            util.showError('删除失败');
          } finally {
            util.hideLoading();
          }
        }
      },
    });
  },
});

