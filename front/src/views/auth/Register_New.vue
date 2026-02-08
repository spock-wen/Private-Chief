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
              :disabled="emailVerified"
            />
          </div>

          <!-- 邮箱验证码 -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">邮箱验证码</label>
            <div class="flex gap-2">
              <input
                v-model="form.emailCode"
                type="text"
                placeholder="请输入验证码"
                class="flex-1 px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
                required
                :disabled="emailVerified"
              />
              <button
                type="button"
                @click="sendEmailCode"
                :disabled="countdown > 0 || sendingCode || emailVerified || !form.email"
                class="px-4 py-3 rounded-custom border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {{ emailVerified ? '已验证' : countdown > 0 ? `${countdown}s` : sendingCode ? '发送中...' : '获取验证码' }}
              </button>
            </div>
            <p v-if="!emailVerified" class="text-xs text-text-muted">
              验证码将发送到您的邮箱，请注意查收
            </p>
            <p v-else class="text-xs text-green-600">
              ✓ 邮箱已验证
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="至少6位字符，建议包含字母和数字"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
              minlength="6"
            />
            <div class="text-xs text-text-muted space-y-1">
              <p :class="form.password.length >= 6 ? 'text-green-600' : ''">
                {{ form.password.length >= 6 ? '✓' : '○' }} 至少6位字符
              </p>
              <p :class="/[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'text-green-600' : ''">
                {{ /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? '✓' : '○' }} 包含字母和数字（推荐）
              </p>
            </div>
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
            <p v-if="confirmPassword && form.password !== confirmPassword" class="text-xs text-red-600">
              ✗ 两次输入的密码不一致
            </p>
            <p v-else-if="confirmPassword && form.password === confirmPassword" class="text-xs text-green-600">
              ✓ 密码一致
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading || !emailVerified"
            class="w-full px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '注册中...' : emailVerified ? '注册' : '请先验证邮箱' }}
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
const sendingCode = ref(false);
const countdown = ref(0);
const emailVerified = ref(false);
const confirmPassword = ref('');

const form = reactive({
  nickname: '',
  email: '',
  emailCode: '',
  password: '',
});

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!form.email) {
    toast.warning('请输入邮箱');
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    toast.warning('请输入正确的邮箱格式');
    return;
  }

  sendingCode.value = true;
  try {
    // TODO: 调用发送邮箱验证码的 API
    // const result = await authStore.sendEmailCode(form.email);
    
    // 开发环境模拟
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockCode = '123456';
    
    toast.success('验证码已发送到您的邮箱');
    toast.info(`开发环境验证码：${mockCode}`);

    // 开始倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // 开发环境自动验证
    setTimeout(() => {
      if (form.emailCode === mockCode) {
        emailVerified.value = true;
        toast.success('邮箱验证成功！');
      }
    }, 100);
  } catch (error: any) {
    toast.error('发送失败：' + (error.response?.data?.message || error.message));
  } finally {
    sendingCode.value = false;
  }
};

// 验证邮箱验证码
const verifyEmailCode = () => {
  // 开发环境固定验证码
  if (form.emailCode === '123456') {
    emailVerified.value = true;
    toast.success('邮箱验证成功！');
  } else {
    toast.error('验证码错误');
  }
};

// 注册
const handleRegister = async () => {
  // 验证必填项
  if (!form.nickname || !form.email || !form.password) {
    toast.warning('请填写完整信息');
    return;
  }

  // 验证邮箱
  if (!emailVerified.value) {
    toast.warning('请先验证邮箱');
    return;
  }

  // 验证密码长度
  if (form.password.length < 6) {
    toast.warning('密码至少需要6位字符');
    return;
  }

  // 验证密码一致性
  if (form.password !== confirmPassword.value) {
    toast.warning('两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    await authStore.register({
      nickname: form.nickname,
      email: form.email,
      password: form.password,
    });
    toast.success('注册成功！');
    
    // 跳转到引导页
    router.push('/onboarding');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    if (errorMsg.includes('已被注册')) {
      toast.error('该邮箱已被注册，请直接登录');
    } else {
      toast.error('注册失败：' + errorMsg);
    }
  } finally {
    loading.value = false;
  }
};

// 监听验证码输入
import { watch } from 'vue';
watch(() => form.emailCode, (newCode) => {
  if (newCode === '123456' && !emailVerified.value) {
    verifyEmailCode();
  }
});
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

