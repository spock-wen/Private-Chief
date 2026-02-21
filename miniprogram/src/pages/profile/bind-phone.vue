<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { sendPhoneCode, bindPhone } from '@/api/bind-account';

const authStore = useAuthStore();

const phone = ref('');
const code = ref('');
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);

const canSendCode = computed(() => {
  return /^1\d{10}$/.test(phone.value) && countdown.value === 0 && !sendingCode.value;
});

const canSubmit = computed(() => {
  return /^1\d{10}$/.test(phone.value) && /^\d{4,6}$/.test(code.value) && !loading.value;
});

async function handleSendCode() {
  if (!canSendCode.value) return;
  
  sendingCode.value = true;
  try {
    const res: any = await sendPhoneCode(phone.value);
    uni.showToast({
      title: res.message || '验证码已发送',
      icon: 'none'
    });
    
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    uni.showToast({
      title: error?.message || '发送失败',
      icon: 'none'
    });
  } finally {
    sendingCode.value = false;
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;
  
  loading.value = true;
  try {
    const res: any = await bindPhone(phone.value, code.value);
    authStore.updateUser(res.user);
    uni.showToast({
      title: '绑定成功',
      icon: 'success'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error?.message || '绑定失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <view class="page-container">
    <view class="header-section">
      <text class="page-title">绑定手机号</text>
      <text class="page-desc">绑定后可在网页端使用手机号登录</text>
    </view>

    <view class="form-section">
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <view class="input-wrapper">
            <text class="input-prefix">+86</text>
            <input 
              v-model="phone" 
              class="form-input" 
              type="number"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">验证码</text>
          <view class="input-wrapper code-wrapper">
            <input 
              v-model="code" 
              class="form-input code-input" 
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <button 
              class="code-btn" 
              :class="{ disabled: !canSendCode }"
              :disabled="!canSendCode"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>
      </view>

      <button 
        class="submit-btn" 
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        :loading="loading"
        @click="handleSubmit"
      >
        确认绑定
      </button>
    </view>

    <view class="tips-section">
      <view class="tip-item">
        <text class="tip-icon">•</text>
        <text class="tip-text">绑定手机号后，可使用手机号+验证码在网页端登录</text>
      </view>
      <view class="tip-item">
        <text class="tip-icon">•</text>
        <text class="tip-text">一个手机号只能绑定一个账号</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #FAFAFA;
}

.header-section {
  background: linear-gradient(135deg, #DC2626 0%, #F87171 100%);
  padding: 48rpx 32rpx 64rpx;
}

.page-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 12rpx;
}

.page-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  padding: 24rpx;
  margin-top: -32rpx;
}

.form-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #450A0A;
  display: block;
  margin-bottom: 16rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #FAFAFA;
  border: 2rpx solid #F3F4F6;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 96rpx;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #DC2626;
}

.input-prefix {
  font-size: 30rpx;
  font-weight: 500;
  color: #450A0A;
  margin-right: 16rpx;
  padding-right: 16rpx;
  border-right: 2rpx solid #E5E7EB;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
  color: #450A0A;
}

.code-wrapper {
  padding: 0 16rpx 0 24rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  min-width: 180rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #DC2626 0%, #F87171 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 36rpx;
  font-size: 26rpx;
  font-weight: 500;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn.disabled {
  background: #E5E7EB;
  color: #9CA3AF;
}

.code-btn::after {
  border: none;
}

.submit-btn {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #DC2626 0%, #F87171 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 52rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 32rpx rgba(220, 38, 38, 0.3);
}

.submit-btn.disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  box-shadow: none;
}

.submit-btn::after {
  border: none;
}

.tips-section {
  padding: 32rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tip-icon {
  font-size: 24rpx;
  color: #DC2626;
  margin-top: 4rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #991B1B;
  opacity: 0.7;
  line-height: 1.6;
}
</style>
