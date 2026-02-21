<template>
  <div class="relative" ref="dropdownRef">
    <!-- 当前家庭显示 -->
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-4 py-2 rounded-custom border border-primary/10 hover:border-primary/30 transition-all bg-white"
    >
      <HomeIcon :size="18" class="text-primary" />
      <span class="font-bold text-sm">{{ currentFamily?.name || '选择家庭' }}</span>
      <ChevronDownIcon :size="16" :class="['transition-transform', isOpen && 'rotate-180']" />
    </button>

    <!-- 下拉菜单 -->
    <Transition name="dropdown">
      <div 
        v-if="isOpen" 
        class="absolute top-full mt-2 left-0 w-64 bg-white rounded-custom border border-primary/10 shadow-xl z-50 overflow-hidden"
      >
        <!-- 家庭列表 -->
        <div class="max-h-64 overflow-y-auto">
          <button
            v-for="family in families"
            :key="family.id"
            @click="switchFamily(family)"
            class="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <HomeIcon :size="16" class="text-primary" />
              </div>
              <div>
                <div class="font-bold text-sm">{{ family.name }}</div>
                <div class="text-xs text-text-muted">
                  {{ family.role === 'OWNER' ? '主人' : '管理员' }}
                </div>
              </div>
            </div>
            <CheckIcon 
              v-if="currentFamily?.id === family.id" 
              :size="18" 
              class="text-primary"
            />
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-primary/5"></div>

        <!-- 操作按钮 -->
        <div class="p-2 space-y-1">
          <router-link
            v-if="currentFamily"
            to="/family/settings"
            class="w-full px-4 py-2 text-left text-sm font-bold text-primary hover:bg-accent/10 rounded-custom transition-colors flex items-center gap-2"
            @click="isOpen = false"
          >
            <SettingsIcon :size="16" />
            家庭管理
          </router-link>
          <button
            @click="openCreateModal"
            class="w-full px-4 py-2 text-left text-sm font-bold text-primary hover:bg-accent/10 rounded-custom transition-colors flex items-center gap-2"
          >
            <PlusIcon :size="16" />
            创建新家庭
          </button>
          <button
            @click="openJoinModal"
            class="w-full px-4 py-2 text-left text-sm font-bold text-primary hover:bg-accent/10 rounded-custom transition-colors flex items-center gap-2"
          >
            <LinkIcon :size="16" />
            加入家庭
          </button>
        </div>
      </div>
    </Transition>

    <!-- 创建/加入弹窗 -->
    <CreateFamilyModal v-model="showCreateModal" @success="onFamilyCreated" />
    <JoinFamilyModal v-model="showJoinModal" @success="onFamilyJoined" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { HomeIcon, ChevronDownIcon, CheckIcon, PlusIcon, LinkIcon, SettingsIcon } from 'lucide-vue-next';
import { useFamilyStore } from '@/stores/useFamilyStore';
import CreateFamilyModal from './CreateFamilyModal.vue';
import JoinFamilyModal from './JoinFamilyModal.vue';

const familyStore = useFamilyStore();
const isOpen = ref(false);
const showCreateModal = ref(false);
const showJoinModal = ref(false);
const dropdownRef = ref<HTMLElement>();

const families = computed(() => familyStore.families);
const currentFamily = computed(() => familyStore.currentFamily);

const switchFamily = (family: any) => {
  familyStore.setCurrentFamily(family);
  isOpen.value = false;
};

const openCreateModal = () => {
  isOpen.value = false;
  showCreateModal.value = true;
};

const openJoinModal = () => {
  isOpen.value = false;
  showJoinModal.value = true;
};

const onFamilyCreated = () => {
  isOpen.value = false;
};

const onFamilyJoined = () => {
  isOpen.value = false;
};

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  familyStore.fetchFamilies();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

