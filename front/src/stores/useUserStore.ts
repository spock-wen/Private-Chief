import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const sessionId = ref('');
  const guestName = ref(localStorage.getItem('guestName') || '');

  // 初始化时不要自动生成 sessionId，等待从服务器获取
  const initializeSession = (serverSessionId: string) => {
    // 只有当当前没有会话ID时才设置
    if (!sessionId.value && serverSessionId) {
      sessionId.value = serverSessionId;
      // 我们不存储到 localStorage，因为会话应该由服务器管理
    }
  };

  const setGuestName = (name: string) => {
    guestName.value = name;
    localStorage.setItem('guestName', name);
  };

  return {
    sessionId,
    guestName,
    initializeSession,
    setGuestName,
  };
});
