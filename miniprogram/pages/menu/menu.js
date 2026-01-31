// pages/menu/menu.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    dishes: [],
    filteredDishes: [],
    categories: ['热菜', '冷菜', '汤品', '酒水'],
    currentCategory: 'all',
    isHost: false,
    loading: false,
    watcher: null, // 实时监听器
  },

  onLoad() {
    this.checkLogin();
    this.loadMenu();
    this.startWatch();
  },

  onUnload() {
    this.stopWatch();
  },

  // 检查登录状态
  checkLogin() {
    const isHost = api.checkLoginStatus() && app.globalData.userRole === 'host';
    this.setData({ isHost });
  },

  // 加载菜单
  async loadMenu() {
    if (this.data.loading) return;

    this.setData({ loading: true });
    util.showLoading('加载中...');

    try {
      const dishes = await api.getGlobalMenu();
      
      // 确保每个菜品都有 id 字段
      const dishesWithId = dishes.map(dish => ({
        ...dish,
        id: dish.id || dish._id,
      }));

      this.setData({
        dishes: dishesWithId,
        filteredDishes: this.getFilteredDishes(dishesWithId),
      });
    } catch (error) {
      console.error('加载菜单失败:', error);
      util.showError('加载菜单失败');
    } finally {
      this.setData({ loading: false });
      util.hideLoading();
    }
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

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMenu().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 管理菜单（仅主人）
  manageMenu() {
    if (!this.data.isHost) {
      util.showError('只有主人才能管理菜单');
      return;
    }

    // 直接跳转到菜单管理页面
    wx.navigateTo({
      url: '/pages/host/menu-manage/menu-manage',
    });
  },

  // 开始实时监听
  startWatch() {
    const db = wx.cloud.database();
    const watcher = db.collection('menus').watch({
      onChange: (snapshot) => {
        console.log('菜单更新:', snapshot);
        // 重新加载菜单
        this.loadMenu();
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
});

