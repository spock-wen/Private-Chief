<template>
  <div class="max-w-7xl mx-auto py-12 px-4 space-y-8 animate-fade-in-up">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <nav class="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
          <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
          <span>/</span>
          <span class="text-primary">我的饭桌</span>
        </nav>
        <h1 class="serif-title text-4xl font-bold text-text-dark flex items-center">
          我的饭桌
        </h1>
      </div>
      <ChefButton variant="primary" @click="isCreateModalOpen = true">
        <PlusIcon :size="18" />
        发起聚餐
      </ChefButton>
    </div>

    <div v-if="tables.length === 0" class="py-20 text-center space-y-4">
      <div class="w-48 h-48 mx-auto bg-primary/5 rounded-full flex items-center justify-center">
        <UtensilsIcon :size="64" class="text-primary/20" />
      </div>
      <p class="text-text-dark/40">还没有饭桌，快去发起一场聚餐吧</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChefCard v-for="table in tables" :key="table.id" class="hover:border-primary transition-all cursor-pointer flex flex-col justify-between" @click="router.push(`/table/${table.id}`)">
        <div>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold">{{ table.name }}</h3>
            <span :class="[
              'px-2 py-1 rounded-full text-[10px] font-bold border',
              statusConfig[table.status].class
            ]">
              {{ statusConfig[table.status].label }}
            </span>
          </div>
          <div class="space-y-2 text-sm text-text-dark/60">
            <div class="flex items-center gap-2">
              <CalendarIcon :size="14" />
              {{ formatDate(table.time) }}
            </div>
            <div class="flex items-center gap-2">
              <MapPinIcon :size="14" />
              {{ table.location || '翠微居' }}
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-primary/5 flex justify-between items-center">
          <span class="text-xs text-text-dark/40">{{ table.guests?.length || 0 }} 人参与</span>
          <ChevronRightIcon :size="18" class="text-primary" />
        </div>
      </ChefCard>
    </div>

    <!-- Create Table Modal -->
    <ChefModal v-model="isCreateModalOpen" title="发起一场新聚餐" max-width="max-w-2xl">
      <form id="createTableForm" @submit.prevent="createTable" class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-bold text-text-dark">您的称呼</label>
          <input 
            v-model="newTable.hostName" 
            type="text" 
            placeholder="例如：王小明、王大厨..." 
            class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
            required
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-bold text-text-dark">饭桌名称</label>
          <input 
            v-model="newTable.name" 
            type="text" 
            placeholder="例如：春分围炉、老友小聚..." 
            class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
            required
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-bold text-text-dark">聚餐时间</label>
          <input 
            v-model="newTable.time" 
            type="datetime-local" 
            class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
            required
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-bold text-text-dark">地点</label>
          <input 
            v-model="newTable.location" 
            type="text" 
            placeholder="例如：翠微居、外滩源..." 
            class="w-full px-4 py-3 rounded-custom border border-primary/10 focus:border-primary/30 outline-none transition-all"
          />
        </div>
      </form>
      <template #footer>
        <button type="button" @click="isCreateModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors">取消</button>
        <ChefButton variant="primary" type="submit" form="createTableForm" :disabled="isLoading">
          {{ isLoading ? '筹备中...' : '确认发起' }}
        </ChefButton>
      </template>
    </ChefModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { PlusIcon, UtensilsIcon, CalendarIcon, MapPinIcon, ChevronRightIcon } from 'lucide-vue-next';
import ChefButton from '../../components/ChefButton.vue';
import ChefCard from '../../components/ChefCard.vue';
import ChefModal from '../../components/ChefModal.vue';
import request from '../../api/request';
import type { Table } from '../../types';
import { TableStatus } from '../../types';
import { useUserStore } from '../../stores/useUserStore';

const router = useRouter();
const userStore = useUserStore();
const tables = ref<Table[]>([]);
const isCreateModalOpen = ref(false);
const isLoading = ref(false);

const newTable = reactive({
  name: '',
  time: '',
  location: '',
  hostName: userStore.guestName || ''
});

const statusConfig: Record<TableStatus, { label: string; class: string }> = {
  [TableStatus.PLANNING]: { label: '筹备中', class: 'bg-accent/20 text-primary border-primary/20' },
  [TableStatus.VOTING]: { label: '投票中', class: 'bg-red-50 text-red-500 border-red-200' },
  [TableStatus.LOCKED]: { label: '已锁定', class: 'bg-green-50 text-green-600 border-green-200' },
  [TableStatus.ARCHIVED]: { label: '已结束', class: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const fetchTables = async () => {
  try {
    tables.value = await request.get('/tables', { params: { sessionId: userStore.sessionId } });
  } catch (err) {
    console.error(err);
  }
};

const createTable = async () => {
  console.log('createTable called', newTable);
  if (!newTable.name || !newTable.time || !newTable.hostName) {
    console.warn('createTable validation failed');
    alert('请填写完整信息');
    return;
  }
  isLoading.value = true;
  try {
    // 确保时间格式为 ISO 字符串
    const payload = {
      ...newTable,
      time: new Date(newTable.time).toISOString(),
      hostSessionId: userStore.sessionId
    };
    console.log('sending payload', payload);
    const table: Table = await request.post('/tables', payload);
    console.log('createTable success', table);
    
    // 更新本地存储的昵称
    userStore.setGuestName(newTable.hostName);
    
    isCreateModalOpen.value = false;
    router.push(`/table/${table.id}`);
  } catch (err: any) {
    console.error('createTable error', err);
    alert('创建失败：' + (err.response?.data?.message || err.message));
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

onMounted(fetchTables);
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
