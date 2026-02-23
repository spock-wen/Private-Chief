<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import Icons from '@/components/Icons.vue';

const authStore = useAuthStore();
const familyStore = useFamilyStore();
const loading = ref(false);
const emailError = ref('');
const passwordError = ref('');
const showPassword = ref(false);
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
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <text class="nav-title">登录</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="mp-shell">
      <view class="hero-section">
        <view class="brand-badge">
          <text class="badge-text">SpockChef</text>
        </view>
        <text class="hero-title">欢迎回来</text>
        <text class="hero-subtitle">登录后即可继续家庭聚餐与菜单管理</text>
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
          <view class="password-input-row">
            <input
              v-model="emailForm.password"
              :password="!showPassword"
              placeholder="请输入密码"
              class="mp-input"
              @input="passwordError = ''"
            />
            <view
              class="eye-btn"
              @click="showPassword = !showPassword"
            >
              <Icons :name="showPassword ? 'eye' : 'eye-off'" class="eye-icon" />
            </view>
          </view>
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: #FEF2F2;
}

.login-page::before {
  content: '';
  position: fixed;
  top: -140rpx;
  right: -100rpx;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  background: #DC2626;
  opacity: 0.08;
}

.mp-shell {
  width: 100%;
  padding: 80rpx 28rpx 60rpx;
  max-width: 750rpx;
}

.hero-section {
  margin-bottom: 64rpx;
}

.brand-badge {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-bottom: 24rpx;
  border-radius: 999rpx;
  background: #DC2626;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
}

.badge-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}

.hero-title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #450A0A;
  margin-bottom: 16rpx;
  line-height: 1.3;
}

.hero-subtitle {
  display: block;
  font-size: 28rpx;
  color: #7F1D1D;
  line-height: 1.6;
}

.login-card {
  padding: 48rpx;
  margin-bottom: 48rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 15rpx rgba(0, 0, 0, 0.1);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.register-line {
  margin-top: 24rpx;
  text-align: center;
  font-size: 24rpx;
}

.muted {
  color: #991B1B;
}

.text-link {
  color: #DC2626;
  font-weight: 600;
  margin-left: 8rpx;
  cursor: pointer;
  transition: color 150ms ease;
}

.text-link:active {
  color: #B91C1C;
}

.divider {
  margin: 32rpx 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: #FECACA;
}

.divider-text {
  font-size: 24rpx;
  color: #991B1B;
}

.wechat-btn {
  height: 92rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #450A0A;
  transition: all 150ms ease;
}

.wechat-btn:active {
  background: #FEF2F2;
  border-color: #DC2626;
  color: #DC2626;
}

.wechat-btn::after {
  border: none;
}

.agreement-section {
  margin-top: 48rpx;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.8;
}

.password-input-row {
  position: relative;
  display: flex;
  align-items: center;
}

.eye-btn {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 32rpx;
  padding: 0;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.eye-btn::after {
  border: none;
}

.eye-icon {
  font-size: 32rpx;
}

.mp-primary-btn {
  width: 100%;
  height: 92rpx;
  background: #DC2626;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  border-radius: 16rpx;
  margin-top: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mp-primary-btn::after {
  border: none;
}

.mp-primary-btn[disabled] {
  opacity: 0.6;
}

/* 响应式调整 */
@media screen and (max-width: 375px) {
  .mp-shell {
    padding: 60rpx 24rpx 50rpx;
  }
  
  .hero-section {
    margin-bottom: 48rpx;
  }
  
  .hero-title {
    font-size: 48rpx;
  }
  
  .login-card {
    padding: 32rpx;
    margin-bottom: 32rpx;
  }
}

@media screen and (min-width: 414px) {
  .mp-shell {
    padding: 100rpx 32rpx 70rpx;
  }
  
  .hero-section {
    margin-bottom: 96rpx;
  }
  
  .hero-title {
    font-size: 64rpx;
  }
  
  .login-card {
    padding: 64rpx;
    margin-bottom: 64rpx;
  }
}
</style>
