import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const sessionId = ref(localStorage.getItem('sessionId') || '');
  const guestName = ref(localStorage.getItem('guestName') || '');

  if (!sessionId.value) {
    sessionId.value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', sessionId.value);
  }

  const setGuestName = (name: string) => {
    guestName.value = name;
    localStorage.setItem('guestName', name);
  };

  return {
    sessionId,
    guestName,
    setGuestName,
  };
});
