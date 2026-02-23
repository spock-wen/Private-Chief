<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getBindInfo } from '@/api/bind-account';
import Icons from '@/components/Icons.vue';

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

const menuItems = computed(() => [
  {
    id: 'bind-phone',
    title: '绑定手机号',
    icon: 'phone',
    subtitle: bindInfo.value.hasPhone ? bindInfo.value.phone : '未绑定',
    url: '/pages/profile/bind-phone'
  },
  {
    id: 'bind-wechat',
    title: '绑定微信',
    icon: 'wechat',
    subtitle: bindInfo.value.hasWechat ? '已绑定' : '未绑定',
    url: '/pages/profile/bind-wechat'
  },
  {
    id: 'family-settings',
    title: '家庭设置',
    icon: 'home',
    subtitle: currentFamily.value?.name || '未加入家庭',
    url: '/pages/family/settings'
  },
  {
    id: 'user-agreement',
    title: '用户协议',
    icon: 'file',
    subtitle: '',
    url: '/pages/agreement/user-agreement'
  },
  {
    id: 'privacy-policy',
    title: '隐私政策',
    icon: 'lock',
    subtitle: '',
    url: '/pages/agreement/privacy-policy'
  }
]);

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

function navigateTo(url: string) {
  uni.navigateTo({ url });
}
</script>

<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-title">我的</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="header-bg"></view>
    
    <view class="page-content">
      <view class="user-card">
        <view class="avatar">
          <text class="avatar-text">{{ user?.nickname?.charAt(0) || '我' }}</text>
        </view>
        
        <view class="user-info">
          <text class="user-name">{{ user?.nickname || '用户' }}</text>
          <text class="user-email">{{ user?.email || '未设置邮箱' }}</text>
          <view v-if="currentFamily" class="family-badge">
            <text class="family-name">{{ currentFamily.name }}</text>
            <text class="family-role">{{ isOwner ? '主人' : '成员' }}</text>
          </view>
        </view>
      </view>

      <view class="menu-list">
        <view 
          v-for="item in menuItems" 
          :key="item.id"
          class="menu-item"
          @click="navigateTo(item.url)"
        >
          <view class="menu-left">
            <view class="menu-icon">
              <Icons :name="item.icon" class="icon-svg" />
            </view>
            <view class="menu-content">
              <text class="menu-title">{{ item.title }}</text>
              <text v-if="item.subtitle" class="menu-subtitle">{{ item.subtitle }}</text>
            </view>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <button class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </button>

      <view class="footer">
        <text class="footer-text">私厨助手 v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FEF2F2;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.header-bg {
  height: 320rpx;
  background: linear-gradient(135deg, #DC2626 0%, #FCA5A5 100%);
  margin-top: calc(var(--status-bar-height, 44rpx) + 100rpx);
}

.header-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255, 0.1);
}

.page-content {
  padding: 0 32rpx 64rpx;
  margin-top: calc(-120rpx - env(safe-area-inset-top, 0));
  position: relative;
  z-index: 1;
}

@media screen and (max-width: 375px) {
  .page-content {
    padding: 0 24rpx 48rpx;
  }
  
  .user-card {
    padding: 48rpx 24rpx;
  }
  
  .avatar {
    width: 140rpx;
    height: 140rpx;
  }
  
  .avatar-text {
    font-size: 48rpx;
  }
}

@media screen and (min-width: 414px) {
  .page-content {
    padding: 0 48rpx 96rpx;
  }
  
  .user-card {
    padding: 64rpx 48rpx;
  }
  
  .avatar {
    width: 180rpx;
    height: 180rpx;
  }
  
  .avatar-text {
    font-size: 56rpx;
  }
}

.user-card {
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
  padding: 64rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  background: #DC2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #fff;
  box-shadow: 0 10rpx 15rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 24rpx;
}

.avatar-text {
  font-size: 56rpx;
  color: #fff;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 40rpx;
  color: #450A0A;
  font-weight: 700;
}

.user-email {
  font-size: 28rpx;
  color: #991B1B;
}

.family-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 24rpx;
  background: #FEF2F2;
  border-radius: 999rpx;
  margin-top: 8rpx;
}

.family-name {
  font-size: 24rpx;
  color: #DC2626;
  font-weight: 600;
}

.family-role {
  font-size: 20rpx;
  color: #DC2626;
}

.menu-list {
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #FECACA;
  transition: all 300ms ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #FEF2F2;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
}

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  background: #FEF2F2;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 36rpx;
}

.menu-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.menu-title {
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
}

.menu-subtitle {
  font-size: 24rpx;
  color: #991B1B;
}

.menu-arrow {
  font-size: 36rpx;
  color: #991B1B;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FEF2F2;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #DC2626;
  margin-bottom: 32rpx;
  transition: all 300ms ease;
}

.logout-btn::after {
  border: none;
}

.logout-btn:active {
  transform: scale(0.98);
  background: #DC2626;
  color: #fff;
}

.footer {
  text-align: center;
  padding: 48rpx 0;
}

.footer-text {
  font-size: 20rpx;
  color: #991B1B;
}
</style>
