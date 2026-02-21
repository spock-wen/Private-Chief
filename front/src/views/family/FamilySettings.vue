<template>
  <div class="min-h-screen py-12 px-4 max-w-2xl mx-auto space-y-8 animate-fade-in-up">
    <div class="flex items-center justify-between">
      <nav class="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <span>/</span>
        <span class="text-primary">家庭管理</span>
      </nav>
      <router-link to="/" class="text-sm text-text-muted hover:text-primary transition-colors">
        返回
      </router-link>
    </div>

    <div v-if="!currentFamily" class="chef-card p-8 text-center text-text-muted">
      请先选择或创建一个家庭
    </div>

    <template v-else>
      <!-- 基本信息 -->
      <div class="chef-card p-8 space-y-6">
        <h2 class="serif-title text-xl font-bold text-text-dark">家庭信息</h2>
        <form @submit.prevent="handleSaveInfo" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">家庭头像（可选）</label>
            <div
              class="flex justify-center cursor-pointer"
              @click="avatarInputRef?.click()"
            >
              <div class="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center text-primary border-2 border-dashed border-primary/20 hover:border-primary/40 overflow-hidden transition-colors">
                <img
                  v-if="form.avatar"
                  :src="form.avatar"
                  alt="家庭头像"
                  class="w-full h-full object-cover"
                />
                <HomeIcon v-else :size="32" />
              </div>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarChange"
            />
            <p class="text-xs text-text-muted text-center">点击上传，支持 JPG、PNG、WebP，不超过 5MB</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">家庭名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="如：张家私厨"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
              required
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">家庭描述（可选）</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="介绍一下你的家庭特色..."
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all resize-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">默认地址（可选）</label>
            <input
              v-model="form.address"
              type="text"
              placeholder="如：北京市朝阳区"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-text-dark">详细地址（可选）</label>
            <input
              v-model="form.addressDetail"
              type="text"
              placeholder="门牌号、楼层等"
              class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
            />
          </div>
          <ChefButton type="submit" variant="primary" :disabled="saving" class="w-full">
            {{ saving ? '保存中...' : '保存' }}
          </ChefButton>
        </form>
      </div>

      <!-- 成员与邀请 -->
      <div class="chef-card p-8 space-y-6">
        <h2 class="serif-title text-xl font-bold text-text-dark">成员管理</h2>
        <p class="text-sm text-text-muted">邀请管理员加入家庭，共同管理菜谱和饭桌。</p>

        <!-- 邀请码（仅主人可见） -->
        <div v-if="isOwner" class="space-y-3">
          <label class="text-sm font-bold text-text-dark">邀请码</label>
          <div class="flex gap-2">
            <div class="flex-1 px-4 py-3 bg-accent/10 rounded-custom border border-primary/10 font-mono text-lg text-center tracking-wider">
              {{ invitationCode || '加载中...' }}
            </div>
            <button
              type="button"
              @click="copyInvitationCode"
              class="px-4 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all"
            >
              复制
            </button>
          </div>
          <p class="text-xs text-text-muted">分享此邀请码，他人可使用加入家庭成为管理员</p>
        </div>

        <!-- 成员列表 -->
        <div class="space-y-3">
          <label class="text-sm font-bold text-text-dark">当前成员</label>
          <div class="space-y-2">
            <div
              v-for="member in members"
              :key="member.id"
              class="flex items-center justify-between p-3 bg-accent/5 rounded-custom"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="member.user?.avatar"
                    :src="member.user.avatar"
                    :alt="member.user?.nickname"
                    class="w-full h-full object-cover"
                  />
                  <UserIcon v-else :size="20" class="text-primary" />
                </div>
                <div>
                  <p class="font-bold text-sm">{{ member.user?.nickname }}</p>
                  <p class="text-xs text-text-muted">{{ member.role === 'OWNER' ? '家庭主人' : '管理员' }}</p>
                </div>
              </div>
              <button
                v-if="member.role !== 'OWNER' && isOwner"
                @click="handleRemoveMember(member.id)"
                class="text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除家庭（仅主人可见） -->
      <div v-if="isOwner" class="chef-card p-8 border-red-100 border">
        <h2 class="serif-title text-xl font-bold text-red-600 mb-2">危险操作</h2>
        <p class="text-sm text-text-muted mb-4">删除家庭将同时删除该家庭下的所有菜谱、饭桌及相关数据，此操作不可恢复。</p>
        <button
          type="button"
          @click="handleDeleteFamily"
          class="px-6 py-2.5 rounded-custom font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-all"
        >
          删除家庭
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { HomeIcon, UserIcon } from 'lucide-vue-next';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useToast } from '@/composables/useToast';
import ChefButton from '@/components/ChefButton.vue';
import request from '@/api/request';

const router = useRouter();
const familyStore = useFamilyStore();
const toast = useToast();

const currentFamily = computed(() => familyStore.currentFamily);
const isOwner = computed(() => currentFamily.value?.role === 'OWNER');

const saving = ref(false);
const invitationCode = ref('');
const members = ref<any[]>([]);
const avatarInputRef = ref<HTMLInputElement>();

const form = reactive({
  name: '',
  description: '',
  avatar: '',
  address: '',
  addressDetail: '',
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

const loadFamilyData = () => {
  if (!currentFamily.value) return;
  form.name = currentFamily.value.name;
  form.description = currentFamily.value.description || '';
  form.avatar = currentFamily.value.avatar || '';
  form.address = currentFamily.value.address || '';
  form.addressDetail = currentFamily.value.addressDetail || '';
};

const loadInvitationCode = async () => {
  if (!currentFamily.value?.id || !isOwner.value) return;
  try {
    const res = await request.post('/families/invitations', {
      familyId: currentFamily.value.id,
      maxUses: 1,
      expiresInDays: 7,
    });
    invitationCode.value = res.inviteCode || '';
  } catch (err: any) {
    toast.error('获取邀请码失败：' + (err.response?.data?.message || err.message));
  }
};

const loadMembers = async () => {
  if (!currentFamily.value?.id) return;
  try {
    const family = await request.get(`/families/${currentFamily.value.id}`);
    members.value = family.members || [];
  } catch (err) {
    console.error('Failed to load members', err);
  }
};

const handleSaveInfo = async () => {
  if (!currentFamily.value?.id || !form.name.trim()) return;
  saving.value = true;
  try {
    await familyStore.updateFamily(currentFamily.value.id, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      avatar: form.avatar || undefined,
      address: form.address.trim() || undefined,
      addressDetail: form.addressDetail.trim() || undefined,
    });
    toast.success('保存成功');
  } catch (err: any) {
    toast.error(err.response?.data?.message || '保存失败');
  } finally {
    saving.value = false;
  }
};

const copyInvitationCode = async () => {
  try {
    await navigator.clipboard.writeText(invitationCode.value);
    toast.success('邀请码已复制到剪贴板');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = invitationCode.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('邀请码已复制到剪贴板');
  }
};

const handleRemoveMember = async (memberId: string) => {
  if (!confirm('确定要移除此管理员吗？')) return;
  if (!currentFamily.value?.id) return;
  try {
    await familyStore.removeMember(currentFamily.value.id, memberId);
    toast.success('已移除管理员');
    loadMembers();
  } catch (err: any) {
    toast.error(err.response?.data?.message || '移除失败');
  }
};

const handleDeleteFamily = async () => {
  if (!confirm(`确定要删除家庭「${currentFamily.value?.name}」吗？此操作不可恢复。`)) return;
  if (!currentFamily.value?.id) return;
  try {
    await familyStore.deleteFamily(currentFamily.value.id);
    toast.success('家庭已删除');
    if (familyStore.hasFamily) {
      router.push('/');
    } else {
      router.push('/onboarding');
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || '删除失败');
  }
};

onMounted(() => {
  loadFamilyData();
  loadInvitationCode();
  loadMembers();
});
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
