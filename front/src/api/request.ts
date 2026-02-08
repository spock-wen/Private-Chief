import axios from 'axios';
import { useUserStore } from '@/stores/useUserStore';
import { useAuthStore } from '@/stores/useAuthStore';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器：自动添加会话ID和认证Token到请求头
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 如果有会话ID，添加到请求头（用于匿名客人）
    if (userStore.sessionId) {
      config.headers['X-Session-ID'] = userStore.sessionId;
    }

    // 如果已登录，添加 Authorization Token
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理会话ID和Token刷新
request.interceptors.response.use(
  (response) => {
    const userStore = useUserStore();

    // 检查响应头中是否有新的会话ID
    const newSessionId = response.headers['x-session-id'];
    if (newSessionId) {
      userStore.initializeSession(newSessionId);
    }

    return response.data;
  },
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    // 如果是 401 错误且还没有重试过，尝试刷新 Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果是刷新接口本身失败，直接登出
      if (originalRequest.url?.includes('/auth/refresh')) {
        authStore.logout();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // 如果没有 refreshToken，直接登出
      if (!authStore.refreshToken) {
        authStore.logout();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // 尝试刷新 Token
        await authStore.refresh();
        
        // 重新发送原始请求
        originalRequest.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        authStore.logout();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default request;
