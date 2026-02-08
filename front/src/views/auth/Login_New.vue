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
        <h2 class="text-2xl font-bold text-center mb-6">登录</h2>
        
        <form @submit.prevent="handleEmailLogin" class="space-y-4">
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
            <div class="flex justify-between items-center">
              <label class="text-sm font-bold text-text-dark">密码</label>
              <button
                type="button"
                @click="showForgotPassword"
                class="text-xs text-primary hover:underline"
              >
                忘记密码？
              </button>
            </div>
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

          <div class="text-center space-y-2">
            <router-link
              to="/register"
              class="text-sm text-primary hover:underline block"
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

const loading = ref(false);

const emailForm = reactive({
  email: '',
  password: '',
});

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

// 忘记密码
const showForgotPassword = () => {
  toast.info('密码重置功能开发中，请联系管理员');
  // TODO: 实现密码重置功能
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

