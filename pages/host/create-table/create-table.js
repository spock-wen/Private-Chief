// pages/host/create-table/create-table.js
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tableName: '',
    diningDate: '',
    diningTime: '',
    remark: '',
    collectPreferences: false,
    needPhoneAuth: false,
  },

  onLoad() {
    // 设置默认日期为今天
    const today = new Date();
    this.setData({
      diningDate: util.formatDate(today),
    });
  },

  onTableNameInput(e) {
    this.setData({
      tableName: e.detail.value,
    });
  },

  onDateChange(e) {
    this.setData({
      diningDate: e.detail.value,
    });
  },

  onTimeChange(e) {
    this.setData({
      diningTime: e.detail.value,
    });
  },

  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value,
    });
  },

  onPreferencesChange(e) {
    this.setData({
      collectPreferences: e.detail.value.length > 0,
    });
  },

  onPhoneAuthChange(e) {
    this.setData({
      needPhoneAuth: e.detail.value.length > 0,
    });
  },

  async createTable() {
    if (!this.data.tableName.trim()) {
      util.showError('请输入饭桌名称');
      return;
    }

    util.showLoading('创建中...');

    try {
      const tableId = await api.createTable({
        name: this.data.tableName,
        diningDate: this.data.diningDate,
        diningTime: this.data.diningTime,
        remark: this.data.remark,
        collectPreferences: this.data.collectPreferences,
        needPhoneAuth: this.data.needPhoneAuth,
        createTime: new Date(),
        status: 'active',
      });

      util.hideLoading();
      util.showSuccess('创建成功');

      // 跳转到菜单管理页面
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/host/menu-manage/menu-manage?tableId=${tableId}`,
        });
      }, 1500);
    } catch (error) {
      util.hideLoading();
      util.showError(error.message || '创建失败');
    }
  },
});


