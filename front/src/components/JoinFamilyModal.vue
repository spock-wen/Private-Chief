<template>
  <ChefModal v-model="isOpen" title="加入家庭" max-width="max-w-md">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 邀请码输入 -->
      <div class="space-y-2">
        <label class="text-sm font-bold text-text-dark flex items-center gap-2">
          <KeyIcon :size="16" />
          邀请码
        </label>
        <input 
          v-model="inviteCode" 
          type="text" 
          placeholder="请输入6位邀请码（如：ABC123）" 
          class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all text-center text-2xl font-bold tracking-widest uppercase"
          maxlength="6"
          required
        />
        <p class="text-xs text-text-muted">请向家庭主人获取邀请码</p>
      </div>

      <!-- 提示信息 -->
      <div class="bg-accent/10 border border-primary/10 rounded-custom p-4 space-y-2">
        <div class="flex items-start gap-3">
          <InfoIcon :size="18" class="text-primary mt-0.5 flex-shrink-0" />
          <div class="text-sm text-text-muted space-y-1">
            <p class="font-bold text-text-dark">加入后您将成为家庭管理员</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>可以创建和管理菜品</li>
              <li>可以创建和管理饭桌</li>
              <li>可以查看家庭所有信息</li>
            </ul>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button 
        type="button" 
        @click="isOpen = false" 
        class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors"
      >
        取消
      </button>
      <button
        type="button"
        @click="handleSubmit" 
        :disabled="isLoading || inviteCode.length !== 6"
        class="px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? '加入中...' : '确认加入' }}
      </button>
    </template>
  </ChefModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { KeyIcon, InfoIcon } from 'lucide-vue-next';
import ChefModal from './ChefModal.vue';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useToast } from '@/composables/useToast';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [family: any];
}>();

const familyStore = useFamilyStore();
const toast = useToast();
const isOpen = ref(props.modelValue);
const isLoading = ref(false);
const inviteCode = ref('');

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
});

watch(isOpen, (val) => {
  emit('update:modelValue', val);
  if (!val) {
    inviteCode.value = '';
  }
});

const handleSubmit = async () => {
  if (inviteCode.value.length !== 6) {
    toast.warning('请输入6位邀请码');
    return;
  }

  isLoading.value = true;
  try {
    const family = await familyStore.joinFamily(inviteCode.value.toUpperCase());

    toast.success(`成功加入家庭：${family.name}`);
    emit('success', family);
    isOpen.value = false;
    inviteCode.value = '';
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    if (message.includes('Invalid invite code')) {
      toast.error('邀请码无效或已过期');
    } else if (message.includes('already a member')) {
      toast.error('您已经是该家庭的成员');
    } else if (message.includes('maximum uses')) {
      toast.error('邀请码已达到最大使用次数');
    } else {
      toast.error('加入失败：' + message);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

