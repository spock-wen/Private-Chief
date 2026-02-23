<template>
  <!-- 饭桌图标 - 活跃状态 -->
  <view v-if="name === 'table-active'" class="tab-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-linecap="round"/>
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10-10" stroke-linecap="round"/>
      <path d="M12 6v2" stroke-linecap="round"/>
      <path d="M12 16v2" stroke-linecap="round"/>
      <path d="M8 12h8" stroke-linecap="round"/>
      <path d="M12 8v8" stroke-linecap="round"/>
    </svg>
  </view>

  <!-- 饭桌图标 - 未激活状态 -->
  <view v-else-if="name === 'table'" class="tab-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-linecap="round"/>
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10-10" stroke-linecap="round"/>
      <path d="M12 6v2" stroke-linecap="round"/>
      <path d="M12 16v2" stroke-linecap="round"/>
      <path d="M8 12h8" stroke-linecap="round"/>
    </svg>
  </view>

  <!-- 菜单图标 - 活跃状态 -->
  <view v-else-if="name === 'menu-active'" class="tab-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18" stroke-linecap="round"/>
      <path d="M3 10h18" stroke-linecap="round"/>
      <path d="M3 14h18" stroke-linecap="round"/>
      <path d="M3 18h18" stroke-linecap="round"/>
      <path d="M8 2v20" stroke-linecap="round"/>
      <path d="M16 2v20" stroke-linecap="round"/>
      <path d="M8 2l8 4v12l-8 4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="10" r="2" fill="currentColor"/>
      <circle cx="12" cy="14" r="2" fill="currentColor"/>
    </svg>
  </view>

  <!-- 菜单图标 - 未激活状态 -->
  <view v-else-if="name === 'menu'" class="tab-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18" stroke-linecap="round"/>
      <path d="M3 10h18" stroke-linecap="round"/>
      <path d="M3 14h18" stroke-linecap="round"/>
      <path d="M3 18h18" stroke-linecap="round"/>
      <path d="M8 2v20" stroke-linecap="round"/>
      <path d="M16 2v20" stroke-linecap="round"/>
      <path d="M8 2l8 4v12l-8 4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </view>

  <!-- 我的图标 - 活跃状态 -->
  <view v-else-if="name === 'profile-active'" class="tab-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="7" r="4" fill="currentColor"/>
      <path d="M12 11v4" stroke-linecap="round"/>
      <path d="M10 15h4" stroke-linecap="round"/>
      <circle cx="12" cy="18" r="1" fill="currentColor"/>
    </svg>
  </view>

  <!-- 我的图标 - 未激活状态 -->
  <view v-else-if="name === 'profile'" class="tab-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="7" r="4" fill="currentColor"/>
    </svg>
  </view>

  <!-- 默认插槽 -->
  <view v-else class="tab-icon">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<style scoped>
.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
}

.tab-icon svg {
  width: 100%;
  height: 100%;
}
</style>
