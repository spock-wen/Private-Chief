// pages/host/menu-manage/menu-manage.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
  data: {
    tableId: '',
    tableInfo: null,
    dishes: [],
    filteredDishes: [],
    categories: ['热菜', '凉菜', '汤品', '主食', '饮品'],
    currentCategory: 'all',
    showModal: false,
    editingDish: null,
    dishForm: {
      name: '',
      category: '',
      price: '',
      description: '',
      status: 'available',
      statusText: '可选择',
    },
    statusOptions: ['可选择', '推荐', '售罄'],
    categoryIndex: 0,
    statusIndex: 0,
  },

  onLoad(options) {
    const tableId = options.tableId;
    if (!tableId) {
      util.showError('参数错误');
      wx.navigateBack();
      return;
    }

    this.setData({ tableId });
    this.loadTableInfo();
    this.loadMenu();
  },

  // 加载饭桌信息
  async loadTableInfo() {
    try {
      const tableInfo = await api.getTable(this.data.tableId);
      this.setData({ tableInfo });
    } catch (error) {
      console.error('加载饭桌信息失败:', error);
    }
  },

  // 加载菜单
  async loadMenu() {
    util.showLoading('加载中...');
    try {
      const dishes = await api.getMenu(this.data.tableId);
      // 确保每个菜品都有 id 字段
      const dishesWithId = (dishes || []).map(dish => ({
        ...dish,
        id: dish.id || dish._id,
      }));
      this.setData({
        dishes: dishesWithId,
        filteredDishes: dishesWithId,
      });
    } catch (error) {
      util.showError('加载菜单失败');
    } finally {
      util.hideLoading();
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    let filteredDishes = this.data.dishes;

    if (category !== 'all') {
      filteredDishes = this.data.dishes.filter(dish => dish.category === category);
    }

    this.setData({
      currentCategory: category,
      filteredDishes,
    });
  },

  // 添加菜品
  addDish() {
    this.setData({
      showModal: true,
      editingDish: null,
      dishForm: {
        name: '',
        category: '',
        price: '',
        description: '',
        status: 'available',
        statusText: '可选择',
      },
      categoryIndex: 0,
      statusIndex: 0,
    });
  },

  // 编辑菜品
  editDish(e) {
    const dishId = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(d => (d.id === dishId || d._id === dishId));
    if (!dish) return;

    const categoryIndex = this.data.categories.indexOf(dish.category) || 0;
    const statusIndex = dish.status === 'available' ? 0 : dish.status === 'recommended' ? 1 : 2;

    this.setData({
      showModal: true,
      editingDish: dish,
      dishForm: {
        name: dish.name || '',
        category: dish.category || '',
        price: dish.price || '',
        description: dish.description || '',
        status: dish.status || 'available',
        statusText: dish.status === 'recommended' ? '推荐' : dish.status === 'soldout' ? '售罄' : '可选择',
      },
      categoryIndex,
      statusIndex,
    });
  },

  // 删除菜品
  async deleteDish(e) {
    const dishId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜品吗？',
      success: async (res) => {
        if (res.confirm) {
          util.showLoading('删除中...');
          try {
            await api.deleteDish(dishId);
            util.showSuccess('删除成功');
            this.loadMenu();
          } catch (error) {
            util.showError('删除失败');
          } finally {
            util.hideLoading();
          }
        }
      },
    });
  },

  // 表单输入
  onDishNameInput(e) {
    this.setData({
      'dishForm.name': e.detail.value,
    });
  },

  onCategoryChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      'dishForm.category': this.data.categories[index],
      categoryIndex: index,
    });
  },

  onPriceInput(e) {
    this.setData({
      'dishForm.price': e.detail.value,
    });
  },

  onDescriptionInput(e) {
    this.setData({
      'dishForm.description': e.detail.value,
    });
  },

  onStatusChange(e) {
    const index = parseInt(e.detail.value);
    const statusMap = ['available', 'recommended', 'soldout'];
    const statusTextMap = ['可选择', '推荐', '售罄'];
    
    this.setData({
      'dishForm.status': statusMap[index],
      'dishForm.statusText': statusTextMap[index],
      statusIndex: index,
    });
  },

  // 保存菜品
  async saveDish() {
    if (!this.data.dishForm.name.trim()) {
      util.showError('请输入菜品名称');
      return;
    }

    util.showLoading('保存中...');

    try {
      if (this.data.editingDish) {
        // 更新菜品
        const editingDishId = this.data.editingDish.id || this.data.editingDish._id;
        await api.updateDish(editingDishId, {
          name: this.data.dishForm.name,
          category: this.data.dishForm.category,
          price: parseFloat(this.data.dishForm.price) || 0,
          description: this.data.dishForm.description,
          status: this.data.dishForm.status,
        });
        util.showSuccess('更新成功');
      } else {
        // 添加菜品
        await api.addDish(this.data.tableId, {
          name: this.data.dishForm.name,
          category: this.data.dishForm.category,
          price: parseFloat(this.data.dishForm.price) || 0,
          description: this.data.dishForm.description,
          status: this.data.dishForm.status,
          createTime: new Date(),
        });
        util.showSuccess('添加成功');
      }

      this.closeModal();
      this.loadMenu();
    } catch (error) {
      util.showError(error.message || '保存失败');
    } finally {
      util.hideLoading();
    }
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  stopPropagation() {},

  // 分享饭桌
  shareTable() {
    const tableId = this.data.tableId;
    // 这里可以生成二维码或分享链接
    wx.showActionSheet({
      itemList: ['复制链接', '生成小程序码'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 复制链接
          const link = `pages/guest/enter-table/enter-table?tableId=${tableId}`;
          wx.setClipboardData({
            data: link,
            success: () => {
              util.showSuccess('链接已复制到剪贴板');
            },
          });
        } else if (res.tapIndex === 1) {
          // 生成小程序码（需要后端支持，这里暂时提示）
          util.showError('小程序码功能需要后端支持');
        }
      },
    });
  },

  // 查看点菜情况
  viewOrders() {
    wx.navigateTo({
      url: `/pages/host/view-orders/view-orders?tableId=${this.data.tableId}`,
    });
  },
});

