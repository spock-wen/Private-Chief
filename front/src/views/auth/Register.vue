<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 via-white to-primary/5 px-4">
    <div class="w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="serif-title text-5xl font-bold text-text-dark mb-2">
          SpockChef <span class="text-primary">私厨</span>
        </h1>
        <p class="text-text-muted">创建账号，开启您的私厨之旅</p>
      </div>

      <!-- 注册卡片 -->
      <div class="chef-card p-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <h2 class="text-2xl font-bold text-center mb-6">注册</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- 1. 邮箱 -->
          <div class="space-y-2">
            <label for="register-email" class="text-sm font-bold text-text-dark">邮箱</label>
            <input
              id="register-email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              :class="{ 'border-red-500': fieldErrors.email }"
              required
              @input="fieldErrors.email = ''"
            />
            <p v-if="fieldErrors.email" class="text-xs text-red-600" role="alert">{{ fieldErrors.email }}</p>
          </div>

          <!-- 2. 邮箱验证码 -->
          <div class="space-y-2">
            <label for="register-code" class="text-sm font-bold text-text-dark">邮箱验证码</label>
            <div class="flex gap-2">
              <input
                id="register-code"
                v-model="form.emailCode"
                type="text"
                placeholder="请输入6位验证码"
                maxlength="6"
                pattern="[0-9]*"
                inputmode="numeric"
                class="flex-1 px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
                :class="{ 'border-red-500': fieldErrors.emailCode }"
                required
                @input="fieldErrors.emailCode = ''"
              />
              <button
                type="button"
                @click="sendEmailCode"
                :disabled="countdown > 0 || sendingCode || !form.email"
                class="px-4 py-3 rounded-custom border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {{ countdown > 0 ? `${countdown}s` : sendingCode ? '发送中...' : '获取验证码' }}
              </button>
            </div>
            <p v-if="!form.emailCode" class="text-xs text-text-muted">
              验证码将发送到您的邮箱，5 分钟内有效
            </p>
            <p v-else-if="emailCodeFilled" class="text-xs text-green-600">
              ✓ 验证码已填写
            </p>
            <p v-else class="text-xs text-red-600">
              ✗ 验证码应为6位数字
            </p>
            <p v-if="fieldErrors.emailCode" class="text-xs text-red-600" role="alert">{{ fieldErrors.emailCode }}</p>
          </div>

          <!-- 3. 密码 -->
          <div class="space-y-2">
            <label for="register-password" class="text-sm font-bold text-text-dark">密码</label>
            <div class="relative">
              <input
                id="register-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="至少6位字符，建议包含字母和数字"
                class="w-full px-4 py-3 pr-12 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
                :class="{ 'border-red-500': fieldErrors.password }"
                required
                minlength="6"
                @input="fieldErrors.password = ''"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-dark transition-colors cursor-pointer"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" :size="18" />
                <EyeOffIcon v-else :size="18" />
              </button>
            </div>
            <div class="text-xs text-text-muted space-y-1">
              <p :class="form.password.length >= 6 ? 'text-green-600' : ''">
                {{ form.password.length >= 6 ? '✓' : '○' }} 至少6位字符
              </p>
              <p :class="/[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'text-green-600' : ''">
                {{ /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? '✓' : '○' }} 包含字母和数字（推荐）
              </p>
            </div>
            <p v-if="fieldErrors.password" class="text-xs text-red-600" role="alert">{{ fieldErrors.password }}</p>
          </div>

          <!-- 4. 确认密码 -->
          <div class="space-y-2">
            <label for="register-confirm" class="text-sm font-bold text-text-dark">确认密码</label>
            <div class="relative">
              <input
                id="register-confirm"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="w-full px-4 py-3 pr-12 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
                :class="{ 'border-red-500': fieldErrors.confirmPassword }"
                required
                @input="fieldErrors.confirmPassword = ''"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-dark transition-colors cursor-pointer"
                :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeIcon v-if="!showConfirmPassword" :size="18" />
                <EyeOffIcon v-else :size="18" />
              </button>
            </div>
            <p v-if="confirmPassword && form.password !== confirmPassword" class="text-xs text-red-600">
              ✗ 两次输入的密码不一致
            </p>
            <p v-else-if="confirmPassword && form.password === confirmPassword" class="text-xs text-green-600">
              ✓ 密码一致
            </p>
            <p v-if="fieldErrors.confirmPassword" class="text-xs text-red-600" role="alert">{{ fieldErrors.confirmPassword }}</p>
          </div>

          <!-- 5. 昵称 -->
          <div class="space-y-2">
            <label for="register-nickname" class="text-sm font-bold text-text-dark">昵称</label>
            <input
              id="register-nickname"
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              :class="{ 'border-red-500': fieldErrors.nickname }"
              required
              @input="fieldErrors.nickname = ''"
            />
            <p v-if="fieldErrors.nickname" class="text-xs text-red-600" role="alert">{{ fieldErrors.nickname }}</p>
          </div>

          <!-- 服务条款 -->
          <div class="flex items-start gap-2">
            <input
              id="register-terms"
              v-model="agreedToTerms"
              type="checkbox"
              class="mt-1 rounded border-primary/30 text-primary focus:ring-primary cursor-pointer"
            />
            <label for="register-terms" class="text-xs text-text-muted cursor-pointer">
              我已阅读并同意
              <a href="#" class="text-primary hover:underline">服务条款</a>
              和
              <a href="#" class="text-primary hover:underline">隐私政策</a>
            </label>
          </div>
          <p v-if="fieldErrors.terms" class="text-xs text-red-600" role="alert">{{ fieldErrors.terms }}</p>

          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="w-full px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ loading ? '注册中...' : canSubmit ? '注册' : '请完成以上信息' }}
          </button>

          <div class="text-center">
            <router-link
              to="/login"
              class="text-sm text-primary hover:underline cursor-pointer"
            >
              已有账号？立即登录
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

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
  password: '',
});

const fieldErrors = reactive<Record<string, string>>({
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  terms: '',
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

// 修改邮箱时清空验证码并提示
watch(
  () => form.email,
  (newEmail, oldEmail) => {
    if (oldEmail && newEmail !== oldEmail && form.emailCode) {
      form.emailCode = '';
      toast.warning('邮箱已变更，请重新获取验证码');
    }
  }
);

// 监听验证码输入
watch(
  () => form.emailCode,
  () => {
    if (fieldErrors.emailCode) fieldErrors.emailCode = '';
  }
);

// 发送邮箱验证码
const sendEmailCode = async () => {
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
    const result = (await authStore.sendEmailCode(form.email)) as {
      message?: string;
      code?: string;
      tip?: string;
    };
    toast.success((result.message || '验证码已发送到您的邮箱') + '，5 分钟内有效');
    if (result.code) {
      toast.info(`开发环境验证码：${result.code}`);
    }

    form.emailCode = '';

    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message;
    fieldErrors.emailCode = '发送失败：' + msg;
    toast.error(msg);
  } finally {
    sendingCode.value = false;
  }
};

const clearFieldErrors = () => {
  Object.keys(fieldErrors).forEach((k) => (fieldErrors[k] = ''));
};

// 注册
const handleRegister = async () => {
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
      emailCode: form.emailCode,
    });
    toast.success('注册成功！');
    router.push('/onboarding');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    if (errorMsg.includes('已被注册')) {
      fieldErrors.email = '该邮箱已被注册';
      toast.error('该邮箱已被注册，请直接登录');
    } else if (errorMsg.includes('验证码错误') || errorMsg.includes('验证码已过期')) {
      fieldErrors.emailCode = '验证码错误或已过期，请重新获取';
      toast.error('验证码错误或已过期，请检查后重试或重新获取验证码');
    } else {
      toast.error('注册失败：' + errorMsg);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
