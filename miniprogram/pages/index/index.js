// pages/index/index.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
  },

  onLoad() {
    // 检查是否已登录
    if (api.checkLoginStatus()) {
      const app = getApp();
      this.setData({
        hasUserInfo: true,
        userInfo: app.globalData.userInfo
      });
    }
  },

  onShow() {
    // 检查登录状态
    if (api.checkLoginStatus()) {
      const app = getApp();
      this.setData({
        hasUserInfo: true,
        userInfo: app.globalData.userInfo
      });
    }
  },

  // 用户点击登录
  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          hasUserInfo: true,
          userInfo: res.userInfo
        });
        
        // 调用登录API
        api.loginUser(res.userInfo).then(result => {
          console.log('登录成功', result);
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        }).catch(error => {
          console.error('登录失败', error);
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        });
      }
    });
  },

  // 创建饭桌
  createTable() {
    // 检查用户是否已登录并设为主人
    if (!api.checkLoginStatus()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            this.login();
          }
        }
      });
      return;
    }

    const app = getApp();
    if (!app.isHost()) {
      wx.showModal({
        title: '提示',
        content: '您需要设置为主人角色才能创建饭桌',
        success: (res) => {
          if (res.confirm) {
            // 设置用户为主人角色
            api.setHostRole().then(() => {
              console.log('设置主人角色成功');
              wx.navigateTo({
                url: '/pages/host/create-table/create-table',
              });
            }).catch(error => {
              console.error('设置主人角色失败', error);
              wx.showToast({
                title: '设置失败',
                icon: 'none'
              });
            });
          }
        }
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/host/create-table/create-table',
    });
  },

  // 进入饭桌（扫码/链接）
  enterTable() {
    // 可以扫码或输入链接
    wx.navigateTo({
      url: '/pages/guest/enter-table/enter-table',
    });
  },

  // 管理菜单
  manageMenu() {
    if (!api.checkLoginStatus()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            this.login();
          }
        }
      });
      return;
    }

    const app = getApp();
    if (!app.isHost()) {
      wx.showModal({
        title: '提示',
        content: '您需要设置为主人角色才能管理菜单',
        success: (res) => {
          if (res.confirm) {
            // 设置用户为主人角色
            api.setHostRole().then(() => {
              wx.navigateTo({
                url: '/pages/host/menu-manage/menu-manage',
              });
            }).catch(error => {
              console.error('设置主人角色失败', error);
              wx.showToast({
                title: '设置失败',
                icon: 'none'
              });
            });
          }
        }
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/host/menu-manage/menu-manage',
    });
  },
});