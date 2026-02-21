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

  const isLoggedIn = computed(() => !!user.value && !!accessToken.value);

  const login = async (credentials: { email?: string; phone?: string; password: string }) => {
    const response: AuthTokens = await request.post('/auth/login', credentials);
    setAuth(response);
    return response;
  };

  const phoneLogin = async (phone: string, code: string) => {
    const response: AuthTokens = await request.post('/auth/login/phone', { phone, code });
    setAuth(response);
    return response;
  };

  const register = async (data: {
    email?: string;
    phone?: string;
    password?: string;
    nickname: string;
    avatar?: string;
    emailCode?: string;
  }) => {
    const response: AuthTokens = await request.post('/auth/register', data);
    setAuth(response);
    return response;
  };

  const wechatLogin = async (openId: string, nickname?: string, avatar?: string) => {
    const response: AuthTokens = await request.post('/auth/login/wechat', {
      openId,
      nickname,
      avatar,
    });
    setAuth(response);
    return response;
  };

  const sendCode = async (phone: string) => {
    return await request.post('/auth/send-code', { phone });
  };

  const sendEmailCode = async (email: string) => {
    return await request.post('/auth/send-email-code', { email });
  };

  const refresh = async () => {
    try {
      const response: AuthTokens = await request.post('/auth/refresh');
      setAuth(response);
      return response;
    } catch (error) {
      logout();
      throw error;
    }
  };

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

  const updateProfile = async (data: { nickname?: string; avatar?: string }) => {
    const userData: User = await request.patch('/auth/me', data);
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  };

  const setAuth = (tokens: AuthTokens) => {
    user.value = tokens.user;
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;

    localStorage.setItem('user', JSON.stringify(tokens.user));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

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
    sendEmailCode,
    refresh,
    fetchUser,
    updateProfile,
    updateUser,
    logout,
  };
});
