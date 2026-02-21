<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getBindInfo } from '@/api/bind-account';

const authStore = useAuthStore();
const familyStore = useFamilyStore();

const user = computed(() => authStore.user);
const currentFamily = computed(() => familyStore.currentFamily);
const isOwner = computed(() => currentFamily.value?.role === 'OWNER');

const bindInfo = ref({
  hasPhone: false,
  hasWechat: false,
  phone: ''
});

const menuItems = [
  {
    id: 'bind-phone',
    title: '绑定手机号',
    icon: '📱',
    subtitle: bindInfo.value.hasPhone ? bindInfo.value.phone : '未绑定',
    url: '/pages/profile/bind-phone'
  },
  {
    id: 'bind-wechat',
    title: '绑定微信',
    icon: '💬',
    subtitle: bindInfo.value.hasWechat ? '已绑定' : '未绑定',
    url: '/pages/profile/bind-wechat'
  },
  {
    id: 'family-settings',
    title: '家庭设置',
    icon: '🏠',
    subtitle: currentFamily.value?.name || '未加入家庭',
    url: '/pages/family/settings'
  },
  {
    id: 'user-agreement',
    title: '用户协议',
    icon: '📄',
    subtitle: '',
    url: '/pages/agreement/user-agreement'
  },
  {
    id: 'privacy-policy',
    title: '隐私政策',
    icon: '🔒',
    subtitle: '',
    url: '/pages/agreement/privacy-policy'
  }
];

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await fetchBindInfo();
  }
});

async function fetchBindInfo() {
  try {
    const info = await getBindInfo();
    bindInfo.value = {
      hasPhone: info.hasPhone || false,
      hasWechat: info.hasWechat || false,
      phone: info.phone || ''
    };
  } catch (error) {
    console.error('获取绑定信息失败:', error);
  }
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.redirectTo({ url: '/pages/auth/login' });
      }
    }
  });
}

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<template>
  <view class="container min-h-screen bg-bg-warm">
    <!-- 顶部渐变背景 -->
    <view class="bg-gradient-to-br from-primary to-text-muted h-64 relative overflow-hidden">
      <view class="absolute inset-0 opacity-10">
        <view class="w-full h-full flex items-center justify-center">
          <text class="text-[240px]">👤</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="-mt-24 px-6 pb-20">
      <!-- 用户信息卡片 -->
      <view class="chef-card p-6 mb-8 relative z-10 bg-white/90 backdrop-blur-md">
        <view class="flex flex-col items-center text-center space-y-4">
          <!-- 头像 -->
          <view class="w-32 h-32 bg-accent-30 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <text class="text-6xl">{{ user?.nickname?.charAt(0) || '我' }}</text>
          </view>
          
          <!-- 用户信息 -->
          <div class="space-y-2">
            <text class="serif-title text-2xl font-bold text-text-dark">{{ user?.nickname || '用户' }}</text>
            <text class="text-text-muted text-sm">{{ user?.email || '未设置邮箱' }}</text>
            <text v-if="currentFamily" class="text-primary text-xs font-bold mt-1">
              {{ currentFamily.name }} · {{ isOwner ? '主人' : '成员' }}
            </text>
          </div>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="chef-card mb-8 overflow-hidden">
        <view 
          v-for="item in menuItems" 
          :key="item.id"
          class="menu-item flex items-center justify-between p-6 border-b border-primary-10 last-border-b-0 hover-bg-primary-5 transition-colors"
          @click="navigateTo(item.url)"
        >
          <view class="flex items-center gap-4">
            <view class="w-12 h-12 bg-primary-10 rounded-custom flex items-center justify-center text-xl">
              {{ item.icon }}
            </view>
            <div class="space-y-1">
              <text class="font-bold text-text-dark">{{ item.title }}</text>
              <text v-if="item.subtitle" class="text-text-muted text-xs">{{ item.subtitle }}</text>
            </div>
          </view>
          <text class="text-text-muted">›</text>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <button 
        class="w-full py-4 bg-primary-10 text-primary font-bold rounded-custom hover-bg-primary-20 transition-colors mb-8"
        @click="handleLogout"
      >
        退出登录
      </button>

      <!-- 版本信息 -->
      <view class="text-center">
        <text class="text-text-muted/40 text-xs font-medium uppercase tracking-[0.2em]">SpockChef 私厨 v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: var(--color-bg-warm);
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--color-primary), var(--color-text-muted));
}

.h-64 {
  height: 16rem;
}

.-mt-24 {
  margin-top: -6rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.space-y-2 {
  gap: 0.5rem;
}

.space-y-4 {
  gap: 1rem;
}

.text-center {
  text-align: center;
}

.text-xl {
  font-size: 1.25rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-6xl {
  font-size: 3.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.text-text-dark {
  color: var(--color-text-dark);
}

.text-text-muted {
  color: var(--color-text-muted);
}

.text-primary {
  color: var(--color-primary);
}

.bg-accent {
  background-color: var(--color-accent);
}

.bg-white {
  background-color: #FFFFFF;
}

.bg-primary {
  background-color: var(--color-primary);
}

.bg-accent-30 {
    background-color: rgba(253, 230, 138, 0.3);
  }

  .bg-primary-10 {
    background-color: rgba(217, 119, 6, 0.1);
  }

  .bg-primary-20 {
    background-color: rgba(217, 119, 6, 0.2);
  }

  .bg-white-90 {
    background-color: rgba(255, 255, 255, 0.9);
  }

  .border {
    border-width: 1px;
  }

  .border-4 {
    border-width: 4px;
  }

  .border-b {
    border-bottom-width: 1px;
  }

  .border-white {
    border-color: #FFFFFF;
  }

  .border-primary-10 {
    border-color: rgba(217, 119, 6, 0.1);
  }

  .rounded-full {
    border-radius: 9999px;
  }

  .rounded-custom {
    border-radius: var(--radius-custom);
  }

  .shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .relative {
    position: relative;
  }

  .absolute {
    position: absolute;
  }

  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .z-10 {
    z-index: 10;
  }

  .w-32 {
    width: 8rem;
  }

  .h-32 {
    height: 8rem;
  }

  .w-12 {
    width: 3rem;
  }

  .h-12 {
    height: 3rem;
  }

  .w-full {
    width: 100%;
  }

  .opacity-10 {
    opacity: 0.1;
  }

  .backdrop-blur-md {
    backdrop-filter: blur(12px);
  }

  .last-border-b-0:last-child {
    border-bottom-width: 0;
  }

  .hover-bg-primary-5:hover {
    background-color: rgba(217, 119, 6, 0.05);
  }

  .hover-bg-primary-20:hover {
    background-color: rgba(217, 119, 6, 0.2);
  }

  .transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

.serif-title {
  font-family: 'Noto Serif SC', serif;
}

.chef-card {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(217, 119, 6, 0.1);
  border-radius: var(--radius-custom);
  box-shadow: var(--shadow-warm);
  transition: all 0.3s;
}

.menu-item {
  transition: all 0.2s ease;
}

.menu-item:active {
  background-color: rgba(217, 119, 6, 0.05);
}
</style>