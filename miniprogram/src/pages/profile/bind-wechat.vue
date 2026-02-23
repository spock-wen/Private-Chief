<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { bindWechatByToken, bindWechat } from '@/api/bind-account';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const bindToken = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');

onLoad((query: any) => {
  if (query?.b) {
    bindToken.value = query.b;
    handleBind();
  } else if (query?.scene) {
    const scene = decodeURIComponent(query.scene);
    const match = scene.match(/b=([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      bindToken.value = match[1];
      handleBind();
    }
  }
});

async function handleBind() {
  loading.value = true;
  
  try {
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });
    
    const code = (loginRes as any).code;
    if (!code) {
      error.value = '获取微信授权失败';
      return;
    }

    let res: any;
    if (bindToken.value) {
      // 从网页端扫码绑定
      res = await bindWechatByToken(bindToken.value, code);
    } else {
      // 直接绑定（从小程序内部进入）
      res = await bindWechat(code);
    }
    
    authStore.updateUser(res.user);
    success.value = true;
    
    uni.showToast({
      title: '绑定成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/profile/index' });
    }, 1500);
  } catch (err: any) {
    error.value = err?.message || '绑定失败';
    uni.showToast({
      title: error.value,
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-back" @tap="uni.navigateBack({ delta: 1 })">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">绑定微信</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <view v-if="loading" class="content">
      <text class="loading">正在绑定...</text>
    </view>
    
    <view v-else-if="success" class="content">
      <text class="success">✓</text>
      <text class="title">绑定成功</text>
      <text class="desc">您的微信已成功绑定到网页端账号</text>
    </view>
    
    <view v-else-if="error" class="content">
      <text class="error">✗</text>
      <text class="title">绑定失败</text>
      <text class="desc">{{ error }}</text>
      <button class="retry-btn" @click="handleBind">重试</button>
    </view>
    
    <view v-else class="content">
      <text class="title">微信绑定</text>
      <text class="desc">绑定微信账号以同步您的用餐偏好</text>
      <button class="bind-btn" @click="handleBind">立即绑定</button>
    </view>
  </view>
</template>

<style scoped>
/* 自定义导航栏 */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #DC2626;
}

.nav-status-bar {
  height: var(--status-bar-height, 44rpx);
}

.nav-content {
  height: 100rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24rpx 16rpx;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 36rpx;
  color: white;
}

.nav-title {
  font-size: 30rpx;
  font-weight: 500;
  color: white;
  flex: 1;
  text-align: center;
  line-height: 1;
  padding-bottom: 4rpx;
}

.nav-right {
  width: 60rpx;
}

.container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: calc(var(--status-bar-height, 44rpx) + 100rpx);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
  background: white;
  border-radius: 24rpx;
  margin: 30rpx;
  text-align: center;
}

.loading {
  font-size: 32rpx;
  color: #666;
}

.success {
  font-size: 80rpx;
  color: #52c41a;
  margin-bottom: 30rpx;
}

.error {
  font-size: 80rpx;
  color: #ff4d4f;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.desc {
  font-size: 28rpx;
  color: #666;
}

.retry-btn,
.bind-btn {
  margin-top: 40rpx;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}
</style>
