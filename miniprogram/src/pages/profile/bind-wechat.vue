<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { bindWechatByToken } from '@/api/bind-account';
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
    } else {
      error.value = '无效的绑定链接';
    }
  } else {
    error.value = '无效的绑定链接';
  }
});

async function handleBind() {
  if (!bindToken.value) {
    error.value = '无效的绑定链接';
    return;
  }

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

    const res: any = await bindWechatByToken(bindToken.value, code);
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
      <text class="desc">请从网页端扫描小程序码进行绑定</text>
    </view>
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
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

.retry-btn {
  margin-top: 40rpx;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}
</style>
