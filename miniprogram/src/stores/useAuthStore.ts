import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { setToken, setRefreshToken, setUser, getToken, getRefreshToken, getUser, clearAuth } from '@/utils/storage';
import { wechatLogin as wechatLoginApi, login as loginApi } from '@/api/auth';
import type { User, LoginResponse } from '@/types';
import type { EmailLoginDto } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getToken());
  const refreshToken = ref<string | null>(getRefreshToken());
  const user = ref<User | null>(getUser());

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value);

  async function wechatLogin(code: string): Promise<LoginResponse> {
    const res = await wechatLoginApi({ code });
    accessToken.value = res.accessToken;
    refreshToken.value = res.refreshToken;
    user.value = res.user;
    
    setToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
    
    return res;
  }

  async function login(dto: EmailLoginDto): Promise<LoginResponse> {
    const res = await loginApi(dto);
    accessToken.value = res.accessToken;
    refreshToken.value = res.refreshToken;
    user.value = res.user;
    
    setToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
    
    return res;
  }

  function updateUser(updatedUser: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };
      setUser(user.value);
    }
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    clearAuth();
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    login,
    wechatLogin,
    updateUser,
    logout
  };
});
