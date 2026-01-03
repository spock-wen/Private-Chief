// pages/guest/menu-view/menu-view.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
  data: {
    tableId: '',
    userId: '',
    nickName: '',
    tableInfo: {},
    dishes: [],
    filteredDishes: [],
    categories: [],
    currentCategory: 'all',
    myOrders: {},
    myTotalQuantity: 0,
    showNoteModal: false,
    currentDishId: '',
    noteText: '',
  },

  onLoad(options) {
    const tableId = options.tableId;
    const nickName = options.nickName;
    
    if (!tableId) {
      util.showError('参数错误');
      wx.navigateBack();
      return;
    }

    // 生成用户ID
    const userId = util.generateId();

    this.setData({
      tableId,
      userId,
      nickName: decodeURIComponent(nickName || '未命名用户'),
    });

    this.loadTableInfo();
    this.loadMenu();
    this.loadMyOrders();
  },

  onShow() {
    this.loadMenu();
    this.loadMyOrders();
  },

  // 加载饭桌信息
  async loadTableInfo() {
    try {
      const tableInfo = await api.getTableInfo(this.data.tableId);
      this.setData({ tableInfo });
    } catch (error) {
      console.error('加载饭桌信息失败:', error);
    }
  },

  // 加载菜单
  async loadMenu() {
    util.showLoading('加载中...');
    try {
      const dishes = await api.getTableMenu(this.data.tableId);
      
      // 确保dishes是数组
      if (!Array.isArray(dishes)) {
        console.warn('菜单数据格式错误:', dishes);
        this.setData({
          dishes: [],
          filteredDishes: [],
          categories: [],
        });
        return;
      }
      
      // 提取分类
      const categories = [...new Set(dishes.map(d => d.category).filter(Boolean))];
      
      // 合并我的点菜数量
      const dishesWithQuantity = dishes.map(dish => {
        const dishId = dish.id || dish._id;
        const myOrder = this.data.myOrders[dishId];
        const myQuantity = myOrder ? myOrder.quantity : 0;
        
        // 获取该菜品的总点菜数（需要从订单中统计）
        return {
          ...dish,
          id: dishId,
          myQuantity: myQuantity || 0,
        };
      });

      this.setData({
        dishes: dishesWithQuantity || [],
        filteredDishes: dishesWithQuantity || [],
        categories: categories || [],
      });

      // 加载所有订单以统计总数
      this.loadAllOrders();
    } catch (error) {
      console.error('加载菜单失败:', error);
      util.showError('加载菜单失败');
      this.setData({
        dishes: [],
        filteredDishes: [],
        categories: [],
      });
    } finally {
      util.hideLoading();
    }
  },

  // 加载我的点菜
  async loadMyOrders() {
    try {
      const orders = await api.getUserOrders(this.data.tableId, this.data.userId);
      const myOrders = {};
      let totalQuantity = 0;

      orders.forEach(order => {
        const orderId = order.id || order._id;
        const dishId = order.dishId;
        myOrders[dishId] = {
          ...order,
          id: orderId,
        };
        totalQuantity += order.quantity || 0;
      });

      this.setData({
        myOrders,
        myTotalQuantity: totalQuantity,
      });

      // 更新菜品显示数量
      this.updateDishQuantities();
    } catch (error) {
      console.error('加载我的点菜失败:', error);
    }
  },

  // 加载所有订单（用于显示总数）
  async loadAllOrders() {
    try {
      // 客人模式，传入userId以获取所有订单（因为API内部会根据角色决定）
      const orders = await api.getOrders(this.data.tableId, null);
      const dishQuantityMap = {};

      orders.forEach(order => {
        const dishId = order.dishId;
        if (!dishQuantityMap[dishId]) {
          dishQuantityMap[dishId] = 0;
        }
        dishQuantityMap[dishId] += order.quantity || 1;
      });

      // 更新菜品总数
      const dishes = this.data.dishes.map(dish => {
        const dishId = dish.id || dish._id;
        return {
          ...dish,
          id: dishId,
          totalQuantity: dishQuantityMap[dishId] || 0,
        };
      });

      this.setData({
        dishes,
        filteredDishes: this.getFilteredDishes(dishes),
      });
    } catch (error) {
      console.error('加载所有订单失败:', error);
    }
  },

  // 更新菜品数量显示
  updateDishQuantities() {
    const dishes = this.data.dishes.map(dish => {
      const dishId = dish.id || dish._id;
      const myOrder = this.data.myOrders[dishId];
      return {
        ...dish,
        id: dishId,
        myQuantity: myOrder ? myOrder.quantity : 0,
      };
    });

    this.setData({
      dishes,
      filteredDishes: this.getFilteredDishes(dishes),
    });
  },

  // 获取过滤后的菜品
  getFilteredDishes(dishes) {
    if (this.data.currentCategory === 'all') {
      return dishes;
    }
    return dishes.filter(dish => dish.category === this.data.currentCategory);
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category,
      filteredDishes: this.getFilteredDishes(this.data.dishes),
    });
  },

  // 增加数量
  async increaseQuantity(e) {
    const dishId = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(d => d.id === dishId);
    
    if (!dish || dish.status === 'soldout') {
      return;
    }

    const currentQuantity = this.data.myOrders[dishId]?.quantity || 0;
    const newQuantity = currentQuantity + 1;

    util.showLoading('操作中...');
    try {
      await api.orderDish(
        this.data.tableId,
        this.data.userId,
        this.data.nickName,
        dishId,
        newQuantity,
        this.data.myOrders[dishId]?.note || ''
      );
      
      await this.loadMyOrders();
      await this.loadAllOrders();
      util.showSuccess('添加成功');
    } catch (error) {
      util.showError('操作失败');
    } finally {
      util.hideLoading();
    }
  },

  // 减少数量
  async decreaseQuantity(e) {
    const dishId = e.currentTarget.dataset.id;
    const currentQuantity = this.data.myOrders[dishId]?.quantity || 0;

    if (currentQuantity <= 0) {
      return;
    }

    const newQuantity = currentQuantity - 1;

    util.showLoading('操作中...');
    try {
      if (newQuantity === 0) {
        // 删除订单
        const orderId = this.data.myOrders[dishId].id;
        await api.deleteOrder(orderId);
      } else {
        // 更新订单
        const orderId = this.data.myOrders[dishId].id;
        await api.updateOrder(orderId, {
          quantity: newQuantity,
        });
      }

      await this.loadMyOrders();
      await this.loadAllOrders();
    } catch (error) {
      util.showError('操作失败');
    } finally {
      util.hideLoading();
    }
  },

  // 查看我的点菜
  viewMyOrders() {
    wx.navigateTo({
      url: `/pages/guest/order-dish/order-dish?tableId=${this.data.tableId}&userId=${this.data.userId}&nickName=${encodeURIComponent(this.data.nickName)}`,
    });
  },

  // 查看全部点菜
  viewAllOrders() {
    wx.navigateTo({
      url: `/pages/guest/order-dish/order-dish?tableId=${this.data.tableId}&userId=${this.data.userId}&nickName=${encodeURIComponent(this.data.nickName)}&viewAll=1`,
    });
  },

  // 关闭备注弹窗
  closeNoteModal() {
    this.setData({
      showNoteModal: false,
      noteText: '',
    });
  },

  onNoteInput(e) {
    this.setData({
      noteText: e.detail.value,
    });
  },

  async saveNote() {
    // 保存备注逻辑
    this.closeNoteModal();
  },

  stopPropagation() {},
});

