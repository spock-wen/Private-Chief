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
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">昵称</label>
            <input
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="至少6位字符"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
              minlength="6"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>

          <div class="text-center">
            <router-link
              to="/login"
              class="text-sm text-primary hover:underline"
            >
              已有账号？立即登录
            </router-link>
          </div>
        </form>
      </div>

      <!-- 提示信息 -->
      <div class="mt-6 text-center text-xs text-text-muted/60 animate-fade-in-up" style="animation-delay: 0.2s">
        <p>注册即表示您同意我们的服务条款和隐私政策</p>
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
const confirmPassword = ref('');

const form = reactive({
  nickname: '',
  email: '',
  password: '',
});

const handleRegister = async () => {
  if (!form.nickname || !form.email || !form.password) {
    toast.warning('请填写完整信息');
    return;
  }

  if (form.password.length < 6) {
    toast.warning('密码至少需要6位字符');
    return;
  }

  if (form.password !== confirmPassword.value) {
    toast.warning('两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    await authStore.register(form);
    toast.success('注册成功！');
    
    // 跳转到引导页
    router.push('/onboarding');
  } catch (error: any) {
    toast.error('注册失败：' + (error.response?.data?.message || error.message));
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

