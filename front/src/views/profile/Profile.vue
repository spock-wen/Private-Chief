<template>
  <div class="min-h-screen py-12 px-4 max-w-2xl mx-auto space-y-8 animate-fade-in-up">
    <div class="flex items-center justify-between">
      <nav class="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <span>/</span>
        <span class="text-primary">个人中心</span>
      </nav>
      <router-link to="/" class="text-sm text-text-muted hover:text-primary transition-colors">
        返回
      </router-link>
    </div>

    <div class="chef-card p-8 space-y-8">
      <h1 class="serif-title text-2xl font-bold text-text-dark">个人信息</h1>

      <form @submit.prevent="handleSave" class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-bold text-text-dark">头像（可选）</label>
          <div
            class="flex justify-center"
            @click="avatarInputRef?.click()"
          >
            <div class="w-24 h-24 rounded-full bg-accent/30 flex items-center justify-center text-primary font-bold text-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 cursor-pointer overflow-hidden transition-colors">
              <img
                v-if="form.avatar"
                :src="form.avatar"
                alt="头像"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-sm">点击上传</span>
            </div>
          </div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />
          <p class="text-xs text-text-muted text-center">从设备选择图片，支持 JPG、PNG、WebP，不超过 5MB</p>
        </div>

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

        <ChefButton type="submit" variant="primary" :disabled="loading" class="w-full">
          {{ loading ? '保存中...' : '保存' }}
        </ChefButton>
      </form>
    </div>

    <div class="chef-card p-8 space-y-6">
      <h2 class="serif-title text-xl font-bold text-text-dark">账号绑定</h2>
      
      <div class="flex items-center justify-between py-4 border-b border-primary/10">
        <div>
          <p class="font-medium text-text-dark">手机号</p>
          <p class="text-sm text-text-muted">{{ authStore.user?.phone || '未绑定' }}</p>
        </div>
        <ChefButton 
          v-if="!authStore.user?.phone"
          variant="outline" 
          size="sm"
          @click="showBindPhoneModal = true"
        >
          绑定
        </ChefButton>
        <ChefButton 
          v-else
          variant="outline" 
          size="sm"
          @click="handleUnbindPhone"
        >
          解绑
        </ChefButton>
      </div>

      <div class="flex items-center justify-between py-4">
        <div>
          <p class="font-medium text-text-dark">微信</p>
          <p class="text-sm text-text-muted">{{ authStore.user?.wechatOpenId ? '已绑定' : '未绑定' }}</p>
        </div>
        <ChefButton 
          v-if="!authStore.user?.wechatOpenId"
          variant="outline" 
          size="sm"
          @click="openBindWechatModal"
        >
          绑定
        </ChefButton>
        <ChefButton 
          v-else
          variant="outline" 
          size="sm"
          @click="handleUnbindWechat"
        >
          解绑
        </ChefButton>
      </div>
    </div>

    <div v-if="showBindPhoneModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showBindPhoneModal = false">
      <div class="bg-white rounded-custom p-6 w-full max-w-md space-y-4">
        <h3 class="text-lg font-bold text-text-dark">绑定手机号</h3>
        <div class="space-y-2">
          <input
            v-model="bindPhoneForm.phone"
            type="tel"
            placeholder="请输入手机号"
            class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none"
            maxlength="11"
          />
        </div>
        <div class="flex gap-2">
          <input
            v-model="bindPhoneForm.code"
            type="text"
            placeholder="验证码"
            class="flex-1 px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none"
            maxlength="6"
          />
          <ChefButton 
            variant="outline" 
            size="sm"
            :disabled="countdown > 0 || bindPhoneForm.phone.length !== 11"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </ChefButton>
        </div>
        <div class="flex gap-3">
          <ChefButton variant="outline" class="flex-1" @click="showBindPhoneModal = false">取消</ChefButton>
          <ChefButton variant="primary" class="flex-1" :disabled="bindLoading" @click="handleBindPhone">
            {{ bindLoading ? '绑定中...' : '确认绑定' }}
          </ChefButton>
        </div>
      </div>
    </div>

    <div v-if="showBindWechatModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showBindWechatModal = false">
      <div class="bg-white rounded-custom p-6 w-full max-w-md space-y-4 text-center">
        <h3 class="text-lg font-bold text-text-dark">绑定微信</h3>
        <p class="text-text-muted">请使用微信扫描下方小程序码，在小程序中完成绑定</p>
        <div class="flex justify-center py-4">
          <img 
            v-if="wechatQrcode"
            :src="wechatQrcode" 
            alt="微信小程序码" 
            class="w-48 h-48"
          />
          <div v-else class="w-48 h-48 bg-gray-100 flex items-center justify-center">
            <p class="text-text-muted text-sm">{{ qrcodeLoading ? '加载中...' : '加载失败' }}</p>
          </div>
        </div>
        <p class="text-xs text-text-muted">打开微信扫一扫，扫描小程序码后在「个人中心」绑定账号</p>
        <ChefButton variant="outline" class="w-full" @click="showBindWechatModal = false">关闭</ChefButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import ChefButton from '@/components/ChefButton.vue';
import { useToast } from '@/composables/useToast';
import api from '@/api/request';

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);
const avatarInputRef = ref<HTMLInputElement>();

const form = reactive({
  nickname: '',
  avatar: '',
});

const showBindPhoneModal = ref(false);
const showBindWechatModal = ref(false);
const bindLoading = ref(false);
const countdown = ref(0);
const wechatQrcode = ref('');
const qrcodeLoading = ref(false);

const bindPhoneForm = reactive({
  phone: '',
  code: '',
});

const handleAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    toast.warning('图片大小不能超过 5MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    if (ev.target?.result) form.avatar = ev.target.result as string;
  };
  reader.readAsDataURL(file);
  target.value = '';
};

onMounted(() => {
  if (authStore.user) {
    form.nickname = authStore.user.nickname;
    form.avatar = authStore.user.avatar || '';
  }
});

const handleSave = async () => {
  if (!form.nickname.trim()) {
    toast.warning('昵称不能为空');
    return;
  }

  loading.value = true;
  try {
    await authStore.updateProfile({
      nickname: form.nickname.trim(),
      avatar: form.avatar || undefined,
    });
    toast.success('保存成功');
  } catch (err: any) {
    toast.error(err.response?.data?.message || '保存失败');
  } finally {
    loading.value = false;
  }
};

const handleSendCode = async () => {
  if (bindPhoneForm.phone.length !== 11) {
    toast.warning('请输入正确的手机号');
    return;
  }
  
  try {
    const res: any = await api.post('/auth/send-code', { phone: bindPhoneForm.phone });
    toast.success(res.message || '验证码已发送');
    
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (err: any) {
    toast.error(err?.response?.data?.message || '发送失败');
  }
};

const handleBindPhone = async () => {
  if (bindPhoneForm.phone.length !== 11 || bindPhoneForm.code.length < 4) {
    toast.warning('请填写完整信息');
    return;
  }

  bindLoading.value = true;
  try {
    const res: any = await api.post('/auth/bind-phone', bindPhoneForm);
    authStore.updateUser(res.user);
    toast.success('绑定成功');
    showBindPhoneModal.value = false;
    bindPhoneForm.phone = '';
    bindPhoneForm.code = '';
  } catch (err: any) {
    toast.error(err?.response?.data?.message || '绑定失败');
  } finally {
    bindLoading.value = false;
  }
};

const handleUnbindPhone = async () => {
  if (!authStore.user?.wechatOpenId && !authStore.user?.email) {
    toast.warning('解绑后您将无法登录，请先绑定其他登录方式');
    return;
  }

  try {
    const res: any = await api.post('/auth/unbind-phone');
    authStore.updateUser(res.user);
    toast.success('解绑成功');
  } catch (err: any) {
    toast.error(err?.response?.data?.message || '解绑失败');
  }
};

const openBindWechatModal = async () => {
  showBindWechatModal.value = true;
  qrcodeLoading.value = true;
  wechatQrcode.value = '';
  
  try {
    const res: any = await api.get('/qrcode/bind-wechat');
    wechatQrcode.value = res.url;
  } catch (err: any) {
    toast.error(err?.response?.data?.message || '获取小程序码失败');
  } finally {
    qrcodeLoading.value = false;
  }
};

const handleUnbindWechat = async () => {
  if (!authStore.user?.phone && !authStore.user?.email) {
    toast.warning('解绑后您将无法登录，请先绑定其他登录方式');
    return;
  }

  try {
    const res: any = await api.post('/auth/unbind-wechat');
    authStore.updateUser(res.user);
    toast.success('解绑成功');
  } catch (err: any) {
    toast.error(err?.response?.data?.message || '解绑失败');
  }
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
