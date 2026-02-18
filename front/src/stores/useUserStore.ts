import { defineStore } from 'pinia';
import { ref } from 'vue';

const SESSION_STORAGE_KEY = 'spock_session_id';

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 恢复 sessionId，刷新后保持同一会话
  const sessionId = ref(localStorage.getItem(SESSION_STORAGE_KEY) || '');
  const guestName = ref(localStorage.getItem('guestName') || '');

  const initializeSession = (serverSessionId: string) => {
    if (serverSessionId) {
      sessionId.value = serverSessionId;
      localStorage.setItem(SESSION_STORAGE_KEY, serverSessionId);
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
