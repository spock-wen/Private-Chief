<template>
  <ChefModal v-model="isOpen" title="邀请管理员" max-width="max-w-lg">
    <div class="space-y-6">
      <!-- 邀请码显示 -->
      <div class="space-y-3">
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
        <p class="text-xs text-text-muted">
          将此邀请码分享给您想邀请的人，他们可以使用此码加入家庭成为管理员
        </p>
      </div>

      <!-- 邀请码有效期 -->
      <div class="bg-primary/5 border border-primary/10 rounded-custom p-4">
        <div class="flex items-start gap-3">
          <InfoIcon :size="18" class="text-primary mt-0.5 flex-shrink-0" />
          <div class="text-sm text-text-muted space-y-1">
            <p class="font-bold text-text-dark">邀请码说明</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>邀请码有效期为 7 天</li>
              <li>可以邀请多位管理员</li>
              <li>管理员可以管理菜谱和饭桌</li>
              <li>只有家庭主人可以移除管理员</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 当前管理员列表 -->
      <div v-if="members.length > 0" class="space-y-3">
        <label class="text-sm font-bold text-text-dark">当前管理员</label>
        <div class="space-y-2">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between p-3 bg-accent/5 rounded-custom"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon :size="20" class="text-primary" />
              </div>
              <div>
                <p class="font-bold text-sm">{{ member.user.nickname }}</p>
                <p class="text-xs text-text-muted">{{ member.role === 'OWNER' ? '家庭主人' : '管理员' }}</p>
              </div>
            </div>
            <button
              v-if="member.role !== 'OWNER' && isOwner"
              @click="removeMember(member.id)"
              class="text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              移除
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button 
        type="button" 
        @click="isOpen = false" 
        class="px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all"
      >
        完成
      </button>
    </template>
  </ChefModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { InfoIcon, UserIcon } from 'lucide-vue-next';
import ChefModal from './ChefModal.vue';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useToast } from '@/composables/useToast';
import request from '@/api/request';

const props = defineProps<{
  modelValue: boolean;
  familyId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const familyStore = useFamilyStore();
const toast = useToast();
const isOpen = ref(props.modelValue);
const invitationCode = ref('');
const members = ref<any[]>([]);
const isOwner = computed(() => {
  const currentFamily = familyStore.currentFamily;
  if (!currentFamily) return false;
  return currentFamily.role === 'OWNER';
});

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
  if (val) {
    loadInvitationCode();
    loadMembers();
  }
});

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

// 加载邀请码
const loadInvitationCode = async () => {
  try {
    const familyId = props.familyId || familyStore.currentFamily?.id;
    if (!familyId) return;

    const response = await request.post('/families/invitations', { familyId });
    invitationCode.value = response.code;
  } catch (error: any) {
    toast.error('获取邀请码失败：' + (error.response?.data?.message || error.message));
  }
};

// 加载成员列表
const loadMembers = async () => {
  try {
    const familyId = props.familyId || familyStore.currentFamily?.id;
    if (!familyId) return;

    const family = await request.get(`/families/${familyId}`);
    members.value = family.members || [];
  } catch (error: any) {
    console.error('Failed to load members:', error);
  }
};

// 复制邀请码
const copyInvitationCode = async () => {
  try {
    await navigator.clipboard.writeText(invitationCode.value);
    toast.success('邀请码已复制到剪贴板');
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = invitationCode.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('邀请码已复制到剪贴板');
  }
};

// 移除成员
const removeMember = async (memberId: string) => {
  if (!confirm('确定要移除此管理员吗？')) return;

  try {
    const familyId = props.familyId || familyStore.currentFamily?.id;
    if (!familyId) return;

    await request.delete(`/families/${familyId}/members/${memberId}`);
    toast.success('已移除管理员');
    loadMembers();
  } catch (error: any) {
    toast.error('移除失败：' + (error.response?.data?.message || error.message));
  }
};
</script>

