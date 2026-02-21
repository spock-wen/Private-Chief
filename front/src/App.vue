<template>
  <div class="min-h-screen bg-bg-warm">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <ChefToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ChefToast from './components/ChefToast.vue';
import { useUserStore } from './stores/useUserStore';
import request from './api/request';

// 初始化会话
onMounted(async () => {
  const userStore = useUserStore();

  // 尝试获取会话ID，如果还没有的话
  if (!userStore.sessionId) {
    try {
      // 调用会话初始化端点
      await request.get('/session/init');
      // 会话ID将在响应拦截器中自动初始化
    } catch (error) {
      console.warn('Failed to initialize session:', error);
      // 即使初始化失败，应用也可以继续运行
    }
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>