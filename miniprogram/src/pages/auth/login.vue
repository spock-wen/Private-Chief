<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';

const authStore = useAuthStore();
const familyStore = useFamilyStore();
const loading = ref(false);
const emailError = ref('');
const passwordError = ref('');
const emailForm = reactive({
  email: '',
  password: ''
});

function validateLoginForm() {
  emailError.value = '';
  passwordError.value = '';

  if (!emailForm.email) {
    emailError.value = '请输入邮箱';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    emailError.value = '邮箱格式不正确';
  }

  if (!emailForm.password) {
    passwordError.value = '请输入密码';
  } else if (emailForm.password.length < 6) {
    passwordError.value = '密码至少 6 位';
  }

  return !emailError.value && !passwordError.value;
}

async function handleEmailLogin() {
  if (!validateLoginForm()) {
    return;
  }

  loading.value = true;
  try {
    await authStore.login({ email: emailForm.email, password: emailForm.password });
    
    try {
      await familyStore.fetchFamilies();
    } catch (e) {
      console.error('获取家庭列表失败', e);
    }
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      if (familyStore.hasFamily) {
        uni.switchTab({ url: '/pages/index/index' });
      } else {
        uni.redirectTo({ url: '/pages/onboarding/welcome' });
      }
    }, 500);
  } catch (error: any) {
    console.error('登录失败', error);
    uni.showToast({
      title: error?.message || '登录失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

async function handleWechatLogin() {
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
      throw new Error('获取微信授权失败');
    }

    await authStore.wechatLogin(code);
    
    try {
      await familyStore.fetchFamilies();
    } catch (e) {
      console.error('获取家庭列表失败', e);
    }
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      if (familyStore.hasFamily) {
        uni.switchTab({ url: '/pages/index/index' });
      } else {
        uni.redirectTo({ url: '/pages/onboarding/welcome' });
      }
    }, 500);
  } catch (error: any) {
    console.error('登录失败', error);
    uni.showToast({
      title: error?.message || '登录失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

function handleRegister() {
  uni.navigateTo({ url: '/pages/auth/register' });
}

function handleForgotPassword() {
  uni.showModal({
    title: '找回密码',
    content: '当前请联系家庭管理员重置密码。后续版本将支持自助找回。',
    showCancel: false,
    confirmText: '我知道了'
  });
}
</script>

<template>
  <view class="mp-page login-page">
    <view class="mp-shell">
      <view class="mp-header">
        <text class="brand-mark">SpockChef 私厨</text>
        <text class="mp-title">欢迎回来</text>
        <text class="mp-subtitle">登录后即可继续家庭聚餐与菜单管理。</text>
      </view>

      <view class="mp-card login-card">
        <view class="mp-field">
          <text class="mp-label">邮箱</text>
          <input
            v-model="emailForm.email"
            type="email"
            placeholder="请输入邮箱"
            class="mp-input"
            @input="emailError = ''"
          />
          <text v-if="emailError" class="mp-helper-text">{{ emailError }}</text>
        </view>

        <view class="mp-field">
          <view class="label-row">
            <text class="mp-label">密码</text>
            <text class="text-link" @click="handleForgotPassword">忘记密码？</text>
          </view>
          <input
            v-model="emailForm.password"
            type="password"
            placeholder="请输入密码"
            class="mp-input"
            @input="passwordError = ''"
          />
          <text v-if="passwordError" class="mp-helper-text">{{ passwordError }}</text>
        </view>

        <button
          class="mp-primary-btn"
          @click="handleEmailLogin"
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <view class="register-line">
          <text class="muted">还没有账号？</text>
          <text class="text-link" @click="handleRegister">立即注册</text>
        </view>

        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>

        <button
          class="wechat-btn"
          @click="handleWechatLogin"
          :loading="loading"
          :disabled="loading"
        >
          微信一键登录
        </button>
      </view>

      <view class="agreement-section">
        <text class="muted">登录即表示您同意</text>
        <text class="text-link" @click="uni.navigateTo({ url: '/pages/agreement/user-agreement' })">服务条款</text>
        <text class="muted">与</text>
        <text class="text-link" @click="uni.navigateTo({ url: '/pages/agreement/privacy-policy' })">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.login-page {
  position: relative;
}

.login-page::before {
  content: '';
  position: fixed;
  top: -140rpx;
  right: -100rpx;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  background: rgba(154, 91, 51, 0.08);
}

.brand-mark {
  display: inline-block;
  padding: 8rpx 22rpx;
  margin-bottom: 18rpx;
  border-radius: 999rpx;
  background: rgba(154, 91, 51, 0.12);
  color: var(--brand-600);
  font-size: 22rpx;
  font-weight: 600;
}

.login-card {
  padding: 36rpx;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.register-line {
  margin-top: 20rpx;
  text-align: center;
  font-size: 26rpx;
}

.muted {
  color: var(--text-500);
}

.text-link {
  color: var(--brand-500);
  font-weight: 600;
  margin-left: 8rpx;
}

.divider {
  margin: 28rpx 0;
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: var(--border-200);
}

.divider-text {
  font-size: 24rpx;
  color: var(--text-500);
}

.wechat-btn {
  height: 88rpx;
  background: #fff;
  border: 2rpx solid #7ecf9d;
  border-radius: var(--radius-pill);
  font-size: 28rpx;
  font-weight: 600;
  color: #07C160;
}

.wechat-btn::after {
  border: none;
}

.agreement-section {
  margin-top: 30rpx;
  text-align: center;
  font-size: 24rpx;
}
</style>
