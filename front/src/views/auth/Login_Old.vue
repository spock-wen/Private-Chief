<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 via-white to-primary/5 px-4">
    <div class="w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="serif-title text-5xl font-bold text-text-dark mb-2">
          SpockChef <span class="text-primary">私厨</span>
        </h1>
        <p class="text-text-muted">为您的家宴营造温暖、私密且专业的数字化助手</p>
      </div>

      <!-- 登录卡片 -->
      <div class="chef-card p-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <!-- Tab 切换 -->
        <div class="flex gap-4 mb-6 border-b border-primary/10">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'pb-3 px-2 font-bold text-sm transition-all relative',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-text-muted hover:text-text-dark'
            ]"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            ></div>
          </button>
        </div>

        <!-- 手机号登录 -->
        <form v-if="activeTab === 'phone'" @submit.prevent="handlePhoneLogin" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">手机号</label>
            <input
              v-model="phoneForm.phone"
              type="tel"
              placeholder="请输入手机号"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">验证码</label>
            <div class="flex gap-2">
              <input
                v-model="phoneForm.code"
                type="text"
                placeholder="请输入验证码"
                class="flex-1 px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
                required
              />
              <button
                type="button"
                @click="sendVerificationCode"
                :disabled="countdown > 0 || sendingCode"
                class="px-4 py-3 rounded-custom border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {{ countdown > 0 ? `${countdown}s` : sendingCode ? '发送中...' : '获取验证码' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录 / 注册' }}
          </button>
        </form>

        <!-- 邮箱登录 -->
        <form v-if="activeTab === 'email'" @submit.prevent="handleEmailLogin" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">邮箱</label>
            <input
              v-model="emailForm.email"
              type="email"
              placeholder="请输入邮箱"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">密码</label>
            <input
              v-model="emailForm.password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div class="text-center">
            <router-link
              to="/register"
              class="text-sm text-primary hover:underline"
            >
              还没有账号？立即注册
            </router-link>
          </div>
        </form>
      </div>

      <!-- 提示信息 -->
      <div class="mt-6 text-center text-xs text-text-muted/60 animate-fade-in-up" style="animation-delay: 0.2s">
        <p>登录即表示您同意我们的服务条款和隐私政策</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const activeTab = ref<'phone' | 'email'>('phone');
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);

const tabs: { id: 'phone' | 'email'; label: string }[] = [
  { id: 'phone', label: '手机号登录' },
  { id: 'email', label: '邮箱登录' },
];

const phoneForm = reactive({
  phone: '',
  code: '',
});

const emailForm = reactive({
  email: '',
  password: '',
});

// 发送验证码
const sendVerificationCode = async () => {
  if (!phoneForm.phone) {
    toast.warning('请输入手机号');
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    toast.warning('请输入正确的手机号');
    return;
  }

  sendingCode.value = true;
  try {
    const result = await authStore.sendCode(phoneForm.phone);
    toast.success('验证码已发送');
    
    // 开发环境显示验证码
    if (result.code) {
      toast.success(`验证码：${result.code}`);
    }

    // 开始倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    toast.error('发送失败：' + (error.response?.data?.message || error.message));
  } finally {
    sendingCode.value = false;
  }
};

// 手机号登录
const handlePhoneLogin = async () => {
  if (!phoneForm.phone || !phoneForm.code) {
    toast.warning('请填写完整信息');
    return;
  }

  loading.value = true;
  try {
    await authStore.phoneLogin(phoneForm.phone, phoneForm.code);
    toast.success('登录成功！');
    
    // 跳转到引导页或首页
    router.push('/onboarding');
  } catch (error: any) {
    toast.error('登录失败：' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

// 邮箱登录
const handleEmailLogin = async () => {
  if (!emailForm.email || !emailForm.password) {
    toast.warning('请填写完整信息');
    return;
  }

  loading.value = true;
  try {
    await authStore.login({ email: emailForm.email, password: emailForm.password });
    toast.success('登录成功！');
    
    // 跳转到引导页或首页
    router.push('/onboarding');
  } catch (error: any) {
    toast.error('登录失败：' + (error.response?.data?.message || error.message));
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

