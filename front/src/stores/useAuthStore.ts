import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '../api/request';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  wechatOpenId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  // 从 localStorage 恢复状态
  const initFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken) {
      user.value = JSON.parse(storedUser);
      accessToken.value = storedAccessToken;
      refreshToken.value = storedRefreshToken;
    }
  };

  // 计算属性
  const isLoggedIn = computed(() => !!user.value && !!accessToken.value);

  // 登录
  const login = async (credentials: { email?: string; phone?: string; password: string }) => {
    const response: AuthTokens = await request.post('/auth/login', credentials);
    setAuth(response);
    return response;
  };

  // 手机号登录
  const phoneLogin = async (phone: string, code: string) => {
    const response: AuthTokens = await request.post('/auth/login/phone', { phone, code });
    setAuth(response);
    return response;
  };

  // 注册
  const register = async (data: {
    email?: string;
    phone?: string;
    password?: string;
    nickname: string;
    avatar?: string;
  }) => {
    const response: AuthTokens = await request.post('/auth/register', data);
    setAuth(response);
    return response;
  };

  // 微信登录
  const wechatLogin = async (openId: string, nickname?: string, avatar?: string) => {
    const response: AuthTokens = await request.post('/auth/login/wechat', {
      openId,
      nickname,
      avatar,
    });
    setAuth(response);
    return response;
  };

  // 发送验证码
  const sendCode = async (phone: string) => {
    return await request.post('/auth/send-code', { phone });
  };

  // 刷新 Token
  const refresh = async () => {
    try {
      const response: AuthTokens = await request.post('/auth/refresh');
      setAuth(response);
      return response;
    } catch (error) {
      // 刷新失败，清除认证信息
      logout();
      throw error;
    }
  };

  // 获取当前用户信息
  const fetchUser = async () => {
    try {
      const userData: User = await request.get('/auth/me');
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // 设置认证信息
  const setAuth = (tokens: AuthTokens) => {
    user.value = tokens.user;
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;

    // 保存到 localStorage
    localStorage.setItem('user', JSON.stringify(tokens.user));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  // 登出
  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    // 清除 localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // 初始化
  initFromStorage();

  return {
    user,
    accessToken,
    refreshToken,
    isLoggedIn,
    login,
    phoneLogin,
    register,
    wechatLogin,
    sendCode,
    refresh,
    fetchUser,
    logout,
  };
});

