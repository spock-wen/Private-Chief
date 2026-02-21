<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';

const authStore = useAuthStore();
const familyStore = useFamilyStore();
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreedToTerms = ref(false);

const form = reactive({
  nickname: '',
  email: '',
  emailCode: '',
  password: ''
});

const fieldErrors = reactive({
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  terms: ''
});

// 验证码格式正确（6位数字）
const emailCodeFilled = computed(() => form.emailCode && /^\d{6}$/.test(form.emailCode));

// 可提交条件
const canSubmit = computed(
  () =>
    emailCodeFilled.value &&
    form.nickname &&
    form.email &&
    form.password &&
    form.password === confirmPassword.value &&
    form.password.length >= 6 &&
    agreedToTerms.value
);

// 修改邮箱时清空验证码
watch(
  () => form.email,
  (newEmail, oldEmail) => {
    if (oldEmail && newEmail !== oldEmail && form.emailCode) {
      form.emailCode = '';
      uni.showToast({
        title: '邮箱已变更，请重新获取验证码',
        icon: 'none'
      });
    }
  }
);

// 发送邮箱验证码
async function sendEmailCode() {
  clearFieldErrors();
  if (!form.email) {
    fieldErrors.email = '请输入邮箱';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    fieldErrors.email = '请输入正确的邮箱格式';
    return;
  }

  sendingCode.value = true;
  try {
    const result = await authStore.sendEmailCode(form.email);
    uni.showToast({
      title: '验证码已发送到您的邮箱',
      icon: 'success'
    });

    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    console.error('发送验证码失败', error);
    uni.showToast({
      title: error?.message || '发送失败',
      icon: 'none'
    });
  } finally {
    sendingCode.value = false;
  }
}

const clearFieldErrors = () => {
  Object.keys(fieldErrors).forEach((k) => (fieldErrors[k] = ''));
};

// 注册
async function handleRegister() {
  clearFieldErrors();

  if (!form.nickname) {
    fieldErrors.nickname = '请输入昵称';
    return;
  }
  if (!form.email) {
    fieldErrors.email = '请输入邮箱';
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    fieldErrors.email = '请输入正确的邮箱格式';
    return;
  }
  if (!form.emailCode || !/^\d{6}$/.test(form.emailCode)) {
    fieldErrors.emailCode = '请输入6位数字验证码';
    return;
  }
  if (form.password.length < 6) {
    fieldErrors.password = '密码至少需要6位字符';
    return;
  }
  if (form.password !== confirmPassword.value) {
    fieldErrors.confirmPassword = '两次输入的密码不一致';
    return;
  }
  if (!agreedToTerms.value) {
    fieldErrors.terms = '请同意服务条款和隐私政策';
    return;
  }

  loading.value = true;
  try {
    await authStore.register({
      nickname: form.nickname,
      email: form.email,
      password: form.password,
      emailCode: form.emailCode
    });
    
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    });

    setTimeout(() => {
      uni.redirectTo({ url: '/pages/onboarding/welcome' });
    }, 500);
  } catch (error: any) {
    console.error('注册失败', error);
    const errorMsg = error?.message || '注册失败';
    if (errorMsg.includes('已被注册')) {
      fieldErrors.email = '该邮箱已被注册';
      uni.showToast({
        title: '该邮箱已被注册，请直接登录',
        icon: 'none'
      });
    } else if (errorMsg.includes('验证码错误') || errorMsg.includes('验证码已过期')) {
      fieldErrors.emailCode = '验证码错误或已过期，请重新获取';
      uni.showToast({
        title: '验证码错误或已过期，请检查后重试或重新获取验证码',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: errorMsg,
        icon: 'none'
      });
    }
  } finally {
    loading.value = false;
  }
}

function handleLogin() {
  uni.navigateTo({ url: '/pages/auth/login' });
}
</script>

<template>
  <view class="register-page">
    <view class="register-content">
      <!-- Logo 和标题 -->
      <view class="brand-section">
        <text class="brand-name serif-title">SpockChef <text class="brand-accent">私厨</text></text>
        <text class="brand-tagline">创建账号，开启您的私厨之旅</text>
      </view>

      <!-- 注册卡片 -->
      <view class="register-card">
        <text class="card-title">注册</text>

        <view class="form-section">
          <!-- 1. 邮箱 -->
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              class="form-input"
              :class="{ 'error': fieldErrors.email }"
            />
            <text v-if="fieldErrors.email" class="error-text">{{ fieldErrors.email }}</text>
          </view>

          <!-- 2. 邮箱验证码 -->
          <view class="form-item">
            <text class="form-label">邮箱验证码</text>
            <view class="code-input-row">
              <input
                v-model="form.emailCode"
                type="text"
                placeholder="请输入6位验证码"
                maxlength="6"
                class="form-input code-input"
                :class="{ 'error': fieldErrors.emailCode }"
              />
              <button
                class="code-btn"
                @click="sendEmailCode"
                :disabled="countdown > 0 || sendingCode || !form.email"
              >
                {{ countdown > 0 ? `${countdown}s` : sendingCode ? '发送中...' : '获取验证码' }}
              </button>
            </view>
            <text v-if="!form.emailCode" class="hint-text">验证码将发送到您的邮箱，5 分钟内有效</text>
            <text v-else-if="/^\d{6}$/.test(form.emailCode)" class="success-text">✓ 验证码已填写</text>
            <text v-else-if="form.emailCode" class="error-text">✗ 验证码应为6位数字</text>
            <text v-if="fieldErrors.emailCode" class="error-text">{{ fieldErrors.emailCode }}</text>
          </view>

          <!-- 3. 密码 -->
          <view class="form-item">
            <text class="form-label">密码</text>
            <view class="password-input-row">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="至少6位字符，建议包含字母和数字"
                class="form-input"
                :class="{ 'error': fieldErrors.password }"
              />
              <button
                class="eye-btn"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '👁️‍🗨️' : '👁️' }}
              </button>
            </view>
            <view class="password-hints">
              <text :class="form.password.length >= 6 ? 'hint-success' : 'hint-text'">
                {{ form.password.length >= 6 ? '✓' : '○' }} 至少6位字符
              </text>
              <text :class="/[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'hint-success' : 'hint-text'">
                {{ /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? '✓' : '○' }} 包含字母和数字（推荐）
              </text>
            </view>
            <text v-if="fieldErrors.password" class="error-text">{{ fieldErrors.password }}</text>
          </view>

          <!-- 4. 确认密码 -->
          <view class="form-item">
            <text class="form-label">确认密码</text>
            <view class="password-input-row">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="form-input"
                :class="{ 'error': fieldErrors.confirmPassword }"
              />
              <button
                class="eye-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '👁️‍🗨️' : '👁️' }}
              </button>
            </view>
            <text v-if="confirmPassword && form.password !== confirmPassword" class="error-text">
              ✗ 两次输入的密码不一致
            </text>
            <text v-else-if="confirmPassword && form.password === confirmPassword" class="success-text">
              ✓ 密码一致
            </text>
            <text v-if="fieldErrors.confirmPassword" class="error-text">{{ fieldErrors.confirmPassword }}</text>
          </view>

          <!-- 5. 昵称 -->
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称"
              class="form-input"
              :class="{ 'error': fieldErrors.nickname }"
            />
            <text v-if="fieldErrors.nickname" class="error-text">{{ fieldErrors.nickname }}</text>
          </view>

          <!-- 服务条款 -->
          <view class="terms-row">
            <input
              v-model="agreedToTerms"
              type="checkbox"
              class="terms-checkbox"
            />
            <text class="terms-text">
              我已阅读并同意
              <text class="terms-link" @click="uni.navigateTo({ url: '/pages/agreement/user-agreement' })">服务条款</text>
              和
              <text class="terms-link" @click="uni.navigateTo({ url: '/pages/agreement/privacy-policy' })">隐私政策</text>
            </text>
          </view>
          <text v-if="fieldErrors.terms" class="error-text">{{ fieldErrors.terms }}</text>

          <button
            class="primary-btn"
            @click="handleRegister"
            :loading="loading"
            :disabled="loading || !canSubmit"
          >
            {{ loading ? '注册中...' : canSubmit ? '注册' : '请完成以上信息' }}
          </button>

          <view class="login-link">
            <text>已有账号？</text>
            <text class="link-text" @click="handleLogin">立即登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(254, 243, 243, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  display: flex;
  flex-direction: column;
  padding: 60rpx 48rpx 60rpx;
}

.register-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48rpx;
}

.brand-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.brand-name {
  font-size: 56rpx;
  font-weight: 700;
  color: #450A0A;
  line-height: 1.2;
}

.brand-accent {
  color: #DC2626;
}

.brand-tagline {
  font-size: 26rpx;
  color: #991B1B;
  opacity: 0.7;
  max-width: 600rpx;
  line-height: 1.4;
}

.serif-title {
  font-family: 'Georgia', serif;
}

.register-card {
  width: 100%;
  max-width: 640rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 40rpx rgba(69, 10, 10, 0.08);
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #450A0A;
  text-align: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #450A0A;
}

.form-input {
  width: 100%;
  height: 96rpx;
  padding: 0 32rpx;
  border: 2rpx solid rgba(220, 38, 38, 0.1);
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #450A0A;
  background: #FAFAFA;
}

.form-input:focus {
  border-color: rgba(220, 38, 38, 0.3);
  background: #FFFFFF;
}

.form-input.error {
  border-color: #EF4444;
}

.code-input-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.code-input {
  flex: 1;
}

.code-btn {
  padding: 0 32rpx;
  height: 96rpx;
  border: 2rpx solid rgba(220, 38, 38, 0.2);
  border-radius: 24rpx;
  background: #FFFFFF;
  color: #DC2626;
  font-size: 28rpx;
  font-weight: 600;
}

.code-btn::after {
  border: none;
}

.code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-input-row {
  position: relative;
  display: flex;
  align-items: center;
}

.eye-btn {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 32rpx;
  padding: 0;
}

.eye-btn::after {
  border: none;
}

.password-hints {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-top: 4rpx;
}

.hint-text {
  font-size: 24rpx;
  color: #991B1B;
  opacity: 0.7;
}

.hint-success {
  font-size: 24rpx;
  color: #10B981;
}

.success-text {
  font-size: 24rpx;
  color: #10B981;
  margin-top: 4rpx;
}

.error-text {
  font-size: 24rpx;
  color: #EF4444;
  margin-top: 4rpx;
}

.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 8rpx;
}

.terms-checkbox {
  margin-top: 8rpx;
  transform: scale(1.2);
}

.terms-text {
  flex: 1;
  font-size: 24rpx;
  color: #991B1B;
  opacity: 0.7;
  line-height: 1.4;
}

.terms-link {
  color: #DC2626;
  font-weight: 500;
}

.primary-btn {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(135deg, #DC2626 0%, #F87171 100%);
  border-radius: 24rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  box-shadow: 0 8rpx 32rpx rgba(220, 38, 38, 0.3);
  margin-top: 16rpx;
}

.primary-btn::after {
  border: none;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  font-size: 26rpx;
  color: #991B1B;
  opacity: 0.7;
  margin-top: 16rpx;
}

.link-text {
  color: #DC2626;
  font-weight: 500;
  margin-left: 8rpx;
}

.hint-text {
  font-size: 24rpx;
  color: #991B1B;
  opacity: 0.7;
  margin-top: 4rpx;
}
</style>