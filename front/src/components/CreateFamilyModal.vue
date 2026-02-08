<template>
  <ChefModal v-model="isOpen" title="创建家庭" max-width="max-w-2xl">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 家庭名称 -->
      <div class="space-y-2">
        <label class="text-sm font-bold text-text-dark flex items-center gap-2">
          <HomeIcon :size="16" />
          家庭名称
        </label>
        <input 
          v-model="form.name" 
          type="text" 
          placeholder="例如：张家私厨、老王家小馆..." 
          class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
          required
        />
        <p class="text-xs text-text-muted">这个名称将显示在菜谱和饭桌中</p>
      </div>

      <!-- 家庭描述 -->
      <div class="space-y-2">
        <label class="text-sm font-bold text-text-dark flex items-center gap-2">
          <FileTextIcon :size="16" />
          家庭描述（可选）
        </label>
        <textarea 
          v-model="form.description" 
          placeholder="介绍一下你的家庭特色..." 
          rows="3"
          class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all resize-none"
        />
      </div>

      <!-- 默认地址 -->
      <div class="space-y-2">
        <label class="text-sm font-bold text-text-dark flex items-center gap-2">
          <MapPinIcon :size="16" />
          默认聚餐地址（可选）
        </label>
        <input 
          v-model="form.address" 
          type="text" 
          placeholder="例如：上海市徐汇区..." 
          class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
        />
        <p class="text-xs text-text-muted">创建饭桌时会自动填充此地址</p>
      </div>

      <!-- 详细地址 -->
      <div class="space-y-2">
        <label class="text-sm font-bold text-text-dark">详细地址（可选）</label>
        <input 
          v-model="form.addressDetail" 
          type="text" 
          placeholder="例如：3号楼502室" 
          class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
        />
      </div>

      <!-- 提示信息 -->
      <div class="bg-accent/10 border border-primary/10 rounded-custom p-4 space-y-2">
        <div class="flex items-start gap-3">
          <InfoIcon :size="18" class="text-primary mt-0.5 flex-shrink-0" />
          <div class="text-sm text-text-muted space-y-1">
            <p class="font-bold text-text-dark">创建后您将成为家庭主人</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>可以管理家庭菜谱库和饭桌</li>
              <li>可以邀请其他人成为管理员</li>
              <li>拥有家庭的最高管理权限</li>
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
        :disabled="isLoading || !form.name"
        class="px-6 py-3 bg-primary text-white rounded-custom font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? '创建中...' : '确认创建' }}
      </button>
    </template>
  </ChefModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { HomeIcon, FileTextIcon, MapPinIcon, InfoIcon } from 'lucide-vue-next';
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

const form = reactive({
  name: '',
  description: '',
  address: '',
  addressDetail: '',
});

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
});

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

const handleSubmit = async () => {
  if (!form.name.trim()) {
    toast.warning('请输入家庭名称');
    return;
  }

  isLoading.value = true;
  try {
    const family = await familyStore.createFamily({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      address: form.address.trim() || undefined,
      addressDetail: form.addressDetail.trim() || undefined,
    });

    toast.success('家庭创建成功！');
    
    // 显示邀请提示
    setTimeout(() => {
      toast.info('您可以在首页点击"邀请管理员"按钮邀请其他人加入');
    }, 1500);
    
    emit('success', family);
    isOpen.value = false;
    
    // 重置表单
    Object.assign(form, {
      name: '',
      description: '',
      address: '',
      addressDetail: '',
    });
  } catch (error: any) {
    toast.error('创建失败：' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};
</script>

