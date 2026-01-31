// pages/profile/profile.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    isHost: false,
    isFirstHost: false,
    hasUserInfo: false,
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    if (api.checkLoginStatus()) {
      const userInfo = app.globalData.userInfo;
      const isHost = app.globalData.userRole === 'host';
      const isFirstHost = app.globalData.isFirstHost || false;

      this.setData({
        userInfo: userInfo,
        hasUserInfo: !!userInfo,
        isHost: isHost,
        isFirstHost: isFirstHost,
      });
    } else {
      this.setData({
        userInfo: null,
        hasUserInfo: false,
        isHost: false,
        isFirstHost: false,
      });
    }
  },

  // 登录
  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        // 调用登录API
        api.loginUser(res.userInfo).then(result => {
          console.log('登录成功', result);
          this.loadUserInfo();
          util.showSuccess('登录成功');
        }).catch(error => {
          console.error('登录失败', error);
          util.showError('登录失败');
        });
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error);
      },
    });
  },

  // 修改昵称
  updateNickName() {
    if (!api.checkLoginStatus()) {
      util.showError('请先登录');
      return;
    }

    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: async (res) => {
        if (res.confirm && res.content) {
          util.showLoading('更新中...');
          try {
            await api.updateUserInfo({
              nickName: res.content,
            });
            this.loadUserInfo();
            util.showSuccess('更新成功');
          } catch (error) {
            util.showError('更新失败');
          } finally {
            util.hideLoading();
          }
        }
      },
    });
  },

  // 修改头像
  updateAvatar() {
    if (!api.checkLoginStatus()) {
      util.showError('请先登录');
      return;
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        util.showLoading('上传中...');
        try {
          await api.updateUserInfo({
            avatarUrl: tempFilePath, // 这里需要先上传到云存储
          });
          this.loadUserInfo();
          util.showSuccess('更新成功');
        } catch (error) {
          util.showError('更新失败');
        } finally {
          util.hideLoading();
        }
      },
    });
  },

  // 跳转到AI助手
  navigateToAi() {
    wx.navigateTo({
      url: '/pages/ai-assistant/index',
    });
  },

  // 取消主人身份
  removeHostRole() {
    if (!this.data.isHost) {
      util.showError('您不是主人');
      return;
    }

    if (this.data.isFirstHost) {
      util.showError('第一个主人不可取消身份');
      return;
    }

    wx.showModal({
      title: '确认取消',
      content: '确定要取消主人身份吗？',
      success: async (res) => {
        if (res.confirm) {
          util.showLoading('处理中...');
          try {
            await api.removeHostRole();
            this.loadUserInfo();
            util.showSuccess('取消成功');
          } catch (error) {
            util.showError(error.message || '取消失败');
          } finally {
            util.hideLoading();
          }
        }
      },
    });
  },
});

