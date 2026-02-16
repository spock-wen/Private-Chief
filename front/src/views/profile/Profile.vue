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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import ChefButton from '@/components/ChefButton.vue';
import { useToast } from '@/composables/useToast';

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);
const avatarInputRef = ref<HTMLInputElement>();

const form = reactive({
  nickname: '',
  avatar: '',
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
