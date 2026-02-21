<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { request } from '@/api/request';
import type { Table, Dish } from '@/types';

const authStore = useAuthStore();
const familyStore = useFamilyStore();
const tableId = ref('');

const table = ref<Table | null>(null);
const loading = ref(false);
const votingDishId = ref<string | null>(null);
const isJoinModalOpen = ref(false);
const isVisitorMode = ref(false);
const isBillingModalOpen = ref(false);
const billingAmount = ref<number | null>(null);
const loadError = ref('');
const joinNameError = ref('');
const billingError = ref('');

const joinForm = ref({
  name: '',
  preferences: ''
});

const user = computed(() => authStore.user);
const isHost = computed(() => {
  if (!table.value) return false;
  return table.value.creatorId === user.value?.id;
});

const isGuest = computed(() => {
  if (!table.value || !user.value) return false;
  return table.value.guests.some(g => g.userId === user.value.id);
});

const statusConfig = {
  PLANNING: { label: '筹备中', class: 'bg-accent-20 text-text-muted border-primary-20' },
  VOTING: { label: '投票中 🔥', class: 'bg-primary text-white border-transparent' },
  LOCKED: { label: '已锁定 🔒', class: 'bg-success-10 text-success border-success-30' },
  ARCHIVED: { label: '已结束 ✅', class: 'bg-gray-100 text-gray-500 border-gray-300 opacity-60' },
  draft: { label: '筹备中', class: 'bg-accent-20 text-text-muted border-primary-20' },
  voting: { label: '投票中 🔥', class: 'bg-primary text-white border-transparent' },
  confirmed: { label: '已确定 🔒', class: 'bg-success-10 text-success border-success-30' },
  completed: { label: '已结束 ✅', class: 'bg-gray-100 text-gray-500 border-gray-300 opacity-60' },
};

const categoryLabels = {
  HOT_DISH: '热菜',
  COLD_DISH: '凉菜',
  SOUP: '汤品',
  STAPLE: '主食',
  DRINK: '饮料'
};

const activeTab = ref('ALL');

const groupedDishes = computed(() => {
  if (!table.value) return {};
  const groups: Record<string, Dish[]> = {};
  
  const dishesToShow = (table.value.status === 'LOCKED' || table.value.status === 'ARCHIVED' || table.value.status === 'confirmed' || table.value.status === 'completed')
    ? table.value.candidateDishes.filter(d => table.value?.finalDishIds?.includes(d.id))
    : table.value.candidateDishes;

  dishesToShow.forEach(dish => {
    const category = dish.category || 'OTHER';
    if (!groups[category]) groups[category] = [];
    groups[category].push(dish);
  });

  // 分类内按票数排序
  Object.keys(groups).forEach(cat => {
    groups[cat].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));
  });

  return groups;
});

const allTimeTopDishes = computed(() => {
  if (!table.value) return [];
  return [...table.value.candidateDishes]
    .filter(d => getVoteCount(d.id) > 0)
    .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
    .slice(0, 3);
});

const inviteUrl = computed(() => {
  return tableId.value ? `/pages/table/detail?id=${tableId.value}` : '';
});

function getVoteCount(dishId: string) {
  if (!table.value) return 0;
  return table.value.guests.reduce((acc, g) => {
    return acc + (g.votes?.filter(v => v.dishId === dishId).length || 0);
  }, 0);
}

function hasVoted(dishId: string) {
  if (!table.value || !user.value) return false;
  const myGuest = table.value.guests.find(g => g.userId === user.value.id);
  return myGuest?.votes?.some(v => v.dishId === dishId) || false;
}

function getVotersForDish(dishId: string) {
  if (!table.value) return [];
  return table.value.guests.filter(g => 
    g.votes?.some(v => v.dishId === dishId)
  );
}

function getCategoryRank(dishId: string, category: string) {
  const dishesInCat = groupedDishes.value[category] || [];
  const index = dishesInCat.findIndex(d => d.id === dishId);
  return index > -1 ? index + 1 : null;
}

function getPopularityWidth(dishId: string) {
  if (!table.value) return 0;
  const count = getVoteCount(dishId);
  if (count === 0) return 0;
  const maxVotes = Math.max(...table.value.candidateDishes.map(d => getVoteCount(d.id)));
  return (count / maxVotes) * 100;
}

async function fetchTable() {
  if (!tableId.value) return;
  
  loading.value = true;
  loadError.value = '';
  try {
    const data: Table = await request.get(`/tables/${tableId.value}`);
    table.value = data;
    
    if (data.totalExpense) {
      billingAmount.value = data.totalExpense;
    }
    
    // 检查用户是否已经加入
    const hasJoined = data.guests.some(g => g.userId === user.value?.id);
    if (!hasJoined && data.status === 'VOTING') {
      isJoinModalOpen.value = true;
    }
  } catch (error) {
    console.error('获取餐桌详情失败:', error);
    loadError.value = '加载失败，请检查网络后重试';
  } finally {
    loading.value = false;
  }
}

async function toggleVote(dishId: string) {
  if (!table.value || votingDishId.value || !user.value) return;
  
  votingDishId.value = dishId;
  try {
    if (hasVoted(dishId)) {
      await request.delete(`/tables/${table.value.id}/votes/${dishId}`);
    } else {
      await request.post(`/tables/${table.value.id}/votes`, {
        dishId
      });
    }
    await fetchTable();
  } catch (error) {
    console.error('投票操作失败:', error);
    uni.showToast({
      title: '投票失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    votingDishId.value = null;
  }
}

async function handleJoinTable() {
  if (!table.value) return;
  
  const nameToUse = joinForm.value.name.trim() || user.value?.nickname;
  if (!nameToUse) {
    joinNameError.value = '请输入昵称';
    return;
  }
  if (nameToUse.length > 20) {
    joinNameError.value = '昵称不能超过 20 个字';
    return;
  }
  
  loading.value = true;
  joinNameError.value = '';
  try {
    await request.post(`/tables/${table.value.id}/guests`, {
      name: nameToUse,
      preferences: joinForm.value.preferences
    });
    isJoinModalOpen.value = false;
    isVisitorMode.value = false;
    await fetchTable();
  } catch (error) {
    console.error('加入餐桌失败:', error);
    uni.showToast({
      title: '加入失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

async function saveBilling() {
  if (!table.value || billingAmount.value === null) return;
  if (billingAmount.value <= 0) {
    billingError.value = '请输入大于 0 的金额';
    return;
  }
  
  loading.value = true;
  billingError.value = '';
  try {
    await request.patch(`/tables/${table.value.id}/billing`, {
      totalExpense: billingAmount.value
    });
    isBillingModalOpen.value = false;
    uni.showToast({ title: '账单已录入', icon: 'success' });
    await fetchTable();
  } catch (error) {
    console.error('结算失败:', error);
    uni.showToast({
      title: '结算失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

async function confirmAdvanceStatus(targetStatus: string) {
  if (!table.value) return;
  
  loading.value = true;
  try {
    await request.patch(`/tables/${table.value.id}/status`, {
      status: targetStatus
    });
    uni.showToast({ title: '状态已更新', icon: 'success' });
    await fetchTable();
  } catch (error) {
    console.error('更新状态失败:', error);
    uni.showToast({
      title: '操作失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

function enterVisitorMode() {
  isJoinModalOpen.value = false;
  isVisitorMode.value = true;
}

function copyLink() {
  uni.setClipboardData({
    data: inviteUrl.value,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' });
    }
  });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

onLoad((query: Record<string, any>) => {
  tableId.value = query?.id ? String(query.id) : '';
});

onMounted(() => {
  fetchTable();
});
</script>

<template>
  <view v-if="table" class="container min-h-screen bg-bg-warm py-6 px-4 animate-fade-in-up">
    <!-- 顶部导航 -->
    <view class="flex items-center justify-between mb-6">
      <button @click="uni.navigateBack({ delta: 1 })" class="p-2 -ml-2 hover-bg-primary-10 rounded-full transition-colors text-primary">
        <text class="text-xl">←</text>
      </button>
      <view class="text-center">
        <text class="font-bold text-text-dark">{{ table.name }}</text>
      </view>
      <view class="w-8"></view>
    </view>

    <!-- 餐桌信息 -->
    <view class="chef-card p-6 mb-8">
      <view class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <text class="serif-title text-3xl font-bold text-text-dark">{{ table.name }}</text>
            <view 
              class="px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-500 shadow-sm"
              :class="statusConfig[table.status]?.class || 'bg-accent-20 text-text-muted border-primary-20'"
            >
              {{ statusConfig[table.status]?.label || '筹备中' }}
            </view>
          </div>
          <div class="flex flex-wrap items-center gap-4 text-sm text-text-muted">
            <text class="flex items-center gap-1.5">📅 {{ formatDate(table.time) }}</text>
            <text class="flex items-center gap-1.5">📍 {{ table.location || '翠微居' }}</text>
          </div>
        </div>

        <!-- 主人控制面板 -->
        <div v-if="isHost" class="flex flex-wrap gap-3">
          <template v-if="table.status === 'PLANNING' || table.status === 'draft'">
            <button 
              @click="confirmAdvanceStatus('VOTING')"
              class="px-6 py-2 bg-primary text-white rounded-custom font-bold text-sm shadow-warm"
            >
              开启投票
            </button>
          </template>
          <template v-if="table.status === 'VOTING'">
            <button 
              @click="confirmAdvanceStatus('LOCKED')"
              class="px-6 py-2 bg-success text-white rounded-custom font-bold text-sm shadow-warm"
            >
              确认菜单
            </button>
          </template>
          <template v-if="table.status === 'LOCKED' || table.status === 'confirmed'">
            <button 
              @click="confirmAdvanceStatus('ARCHIVED')"
              class="px-6 py-2 bg-gray-600 text-white rounded-custom font-bold text-sm shadow-warm"
            >
              结束饭局
            </button>
          </template>
        </div>
      </view>
    </view>

    <!-- 人气风向标 -->
    <view v-if="(table.status === 'VOTING' || table.status === 'voting') && allTimeTopDishes.length > 0" class="chef-card p-6 mb-8 bg-gradient-to-r from-primary-10 via-accent-30 to-primary-10 border border-primary-10 shadow-warm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary-20">
          <text class="text-xl">🏆</text>
        </div>
        <div class="flex-1">
          <text class="serif-title text-lg font-bold text-text-dark">人气风向标</text>
          <text class="text-xs text-text-muted">当前全场最受期待的前三佳肴</text>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 mt-4">
        <div 
          v-for="(dish, index) in allTimeTopDishes" 
          :key="dish.id" 
          class="flex items-center gap-3 bg-white-80 backdrop-blur-sm px-4 py-2 rounded-custom border border-primary-10 shadow-sm"
        >
          <text class="text-xl font-black italic" :class="index === 0 ? 'text-primary' : 'text-text-muted'">#{{ index + 1 }}</text>
          <text class="text-sm font-bold text-text-dark">{{ dish.name }}</text>
          <text class="text-[10px] bg-primary-10 text-primary px-2 py-0.5 rounded-full font-bold">{{ getVoteCount(dish.id) }} 票</text>
        </div>
      </div>
    </view>

    <!-- 主要内容区 -->
    <div class="grid grid-cols-1 gap-8">
      <!-- 左侧：候选菜品 -->
      <div class="space-y-8">
        <div class="chef-card p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div class="space-y-1">
              <text class="serif-title text-2xl font-bold text-text-dark">候选菜谱</text>
              <text class="text-xs text-text-muted">
                {{ (table.status === 'PLANNING' || table.status === 'draft') ? '挑选您想为客人准备的精选佳肴' : '客人们正在表达他们的偏好' }}
              </text>
            </div>
          </div>

          <div v-if="table.candidateDishes.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
            <text class="text-6xl">🍽️</text>
            <text class="serif-title text-xl italic">暂无候选菜品</text>
          </div>

          <div v-else class="space-y-12">
            <div v-for="(dishes, cat) in groupedDishes" :key="cat">
              <div v-if="dishes.length > 0" class="space-y-6">
                <div class="flex items-center gap-3">
                  <div class="h-px flex-1 bg-gradient-to-r from-transparent to-primary-10"></div>
                  <text class="text-xs font-bold text-primary uppercase tracking-[0.2em] px-4 py-1 bg-primary-5 rounded-full border border-primary-10">
                    {{ categoryLabels[cat] || cat }}
                  </text>
                  <div class="h-px flex-1 bg-gradient-to-l from-transparent to-primary-10"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="dish in dishes" 
                    :key="dish.id" 
                    class="chef-card group overflow-hidden bg-white-80 border-primary-5 hover-border-primary-20 transition-all duration-500"
                  >
                    <div class="h-40 overflow-hidden relative">
                      <image 
                        :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'" 
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-text-dark-60 via-transparent to-transparent"></div>
                      <div class="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <div>
                          <text class="text-white font-bold serif-title text-lg drop-shadow-md block leading-tight">{{ dish.name }}</text>
                          <text v-if="table.status === 'VOTING' || table.status === 'voting'" class="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                            分类排名 #{{ getCategoryRank(dish.id, cat) }}
                          </text>
                        </div>
                        <text class="text-white/80 text-[10px] uppercase tracking-widest font-bold bg-black-20 backdrop-blur-md px-2 py-0.5 rounded shadow-sm border border-white-10">{{ categoryLabels[dish.category] || dish.category }}</text>
                      </div>
                    </div>

                    <div class="p-4 space-y-4">
                      <div class="flex justify-between items-center">
                        <!-- 投票按钮 -->
                        <button 
                          v-if="(table.status === 'VOTING' || table.status === 'voting') && isGuest"
                          @click="toggleVote(dish.id)"
                          :disabled="votingDishId === dish.id"
                          :class="[
                            'flex items-center gap-2 px-5 py-2 rounded-custom text-xs font-bold transition-all duration-500',
                            hasVoted(dish.id) 
                              ? 'bg-primary text-white shadow-lg shadow-primary-30 scale-105' 
                              : 'bg-accent-20 text-primary hover-bg-accent-40 active-scale-90',
                            votingDishId === dish.id ? 'opacity-70 cursor-not-allowed' : ''
                          ]"
                        >
                          <text>{{ hasVoted(dish.id) ? '❤️' : '🤍' }}</text>
                          <text>{{ hasVoted(dish.id) ? '已想吃' : '我想吃' }}</text>
                        </button>
                        <button
                          v-else-if="(table.status === 'VOTING' || table.status === 'voting') && !isGuest"
                          disabled
                          class="flex items-center gap-2 px-5 py-2 rounded-custom text-xs font-bold bg-primary-10 text-primary-60 cursor-not-allowed"
                        >
                          <text>🤍</text>
                          <text>加入后可投票</text>
                        </button>

                        <!-- 投票数 -->
                        <div v-if="table.status === 'VOTING' || table.status === 'voting'" class="flex items-center gap-2">
                          <text class="text-primary text-lg">🔥</text>
                          <text class="text-xs font-bold text-text-dark">{{ getVoteCount(dish.id) }}</text>
                        </div>
                      </div>

                      <!-- 人气条 -->
                      <div v-if="table.status === 'VOTING' || table.status === 'voting'" class="space-y-1.5">
                        <div class="h-1.5 bg-primary-5 rounded-full overflow-hidden">
                          <div 
                            class="h-full bg-primary shadow-[0_0_10px_rgba(217,119,6,0.5)] transition-all duration-1000 ease-out" 
                            :style="{ width: `${getPopularityWidth(dish.id)}%` }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：信息面板 -->
      <div class="space-y-6">
        <!-- 邀约好友 -->
        <div class="chef-card p-6 bg-gradient-to-br from-primary to-text-muted text-white">
          <div class="space-y-3">
            <text class="serif-title text-xl font-bold">邀约好友</text>
            <text class="text-white/70 text-xs">家宴的快乐源于分享。将饭桌链接发送给好友，共同拟定这份期待。</text>
          </div>
          <div class="bg-white-10 backdrop-blur-md p-3 rounded-custom border border-white-20 break-all text-[10px] font-mono select-all mt-4">
            {{ inviteUrl }}
          </div>
          <button @click="copyLink" class="w-full bg-white text-primary hover-bg-accent hover-text-text-dark border-none shadow-lg rounded-custom py-3 mt-4 font-bold transition-colors">
            <text class="flex items-center justify-center gap-2">
              <text>📋</text>
              复制链接
            </text>
          </button>
        </div>

        <!-- 账单摘要 -->
        <div v-if="table.status === 'LOCKED' || table.status === 'ARCHIVED' || table.status === 'confirmed' || table.status === 'completed'" class="chef-card p-6">
          <div class="flex items-center gap-2 text-text-dark mb-4">
            <text class="text-xl">🧾</text>
            <text class="serif-title text-xl font-bold">收支概览</text>
          </div>

          <div v-if="table.totalExpense" class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <text class="text-text-muted">总支出</text>
              <text class="text-xl font-bold text-primary serif-title">¥ {{ table.totalExpense.toFixed(2) }}</text>
            </div>
            <div class="flex justify-between items-center text-sm">
              <text class="text-text-muted">参与人数</text>
              <text class="font-bold text-text-dark">{{ table.guests.length }} 位</text>
            </div>
            <div v-if="table.guests.length === 0" class="pt-4 border-t border-primary-5 text-center">
              <text class="text-sm text-text-muted italic">暂无参与客人，无法计算 AA</text>
            </div>
            <div v-else class="pt-4 border-t border-primary-5 flex justify-between items-center">
              <text class="text-xs font-bold text-text-dark uppercase tracking-widest">人均 AA</text>
              <div class="text-right">
                <text class="text-2xl font-bold text-primary serif-title">¥ {{ (table.totalExpense / table.guests.length).toFixed(2) }}</text>
                <text class="text-[10px] text-text-muted/40 mt-1 italic">自动计算，公开透明</text>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6 space-y-4">
            <text class="text-sm text-text-muted/60 italic">主人尚未录入结算金额</text>
            <button v-if="isHost" @click="isBillingModalOpen = true" class="w-full bg-primary text-white hover-bg-primary-90 py-3 rounded-custom font-bold text-sm transition-colors">
              录入账单
            </button>
          </div>
        </div>

        <!-- 嘉宾列表 -->
        <div class="chef-card p-6">
          <div class="flex items-center justify-between mb-4">
            <text class="serif-title text-xl font-bold text-text-dark">围炉好友</text>
            <text class="px-2 py-0.5 bg-primary-10 text-primary text-[10px] font-bold rounded-full">{{ table.guests.length }} 人</text>
          </div>
          <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            <div v-for="guest in table.guests" :key="guest.id" class="flex items-center gap-3 group">
              <div class="w-10 h-10 rounded-full bg-accent-30 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                {{ guest.name.charAt(0) }}
              </div>
              <div class="flex-1">
                <text class="text-sm font-bold text-text-dark flex items-center gap-2">
                  {{ guest.name }}
                  <text v-if="guest.userId === table.creatorId" class="text-[9px] font-normal px-1.5 py-0.5 bg-primary-10 text-primary rounded-full">主人</text>
                </text>
                <text v-if="guest.preferences" class="text-[10px] text-text-muted/60 italic truncate">{{ guest.preferences }}</text>
              </div>
              <div class="flex gap-1">
                <div v-for="(v, index) in guest.votes" :key="index" class="w-1 h-1 rounded-full bg-primary-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 访客模式提示 -->
    <div
      v-if="isVisitorMode && !isGuest"
      class="fixed bottom-0 left-0 right-0 z-50 bg-primary-95 text-white py-3 px-4 flex items-center justify-between shadow-lg"
    >
      <text class="text-sm font-bold">访客模式 · 加入后可参与投票</text>
      <button
        @click="isJoinModalOpen = true"
        class="bg-white text-primary hover-bg-accent border-none px-4 py-2 rounded-custom font-bold transition-colors"
      >
        加入围炉
      </button>
    </div>

    <!-- 加入模态框 -->
    <uni-popup v-model="isJoinModalOpen" mode="center" class="w-[90%] max-w-md">
      <div class="chef-card p-6">
        <text class="serif-title text-xl font-bold text-text-dark mb-4 block text-center">加入围炉</text>
        <div class="space-y-4">
          <div class="bg-primary-5 rounded-xl p-4 flex items-start gap-3">
            <text class="text-primary text-xl shrink-0 mt-0.5">ℹ️</text>
            <div class="text-sm text-text-muted">
              <text class="font-bold text-text-dark mb-1 block">加入围炉</text>
              <text class="text-xs">加入后可对候选菜品投票，表达您的偏好。</text>
            </div>
          </div>
          <div class="space-y-3">
            <div class="space-y-1.5">
              <text class="text-[10px] font-bold text-text-dark/60 uppercase tracking-widest">您的昵称</text>
              <input 
                v-model="joinForm.name" 
                type="text" 
                placeholder="怎么称呼您？" 
                class="w-full px-4 py-3 rounded-custom border border-primary-10 focus:border-primary-30 outline-none transition-all"
                maxlength="20"
                @input="joinNameError = ''"
              />
              <text v-if="joinNameError" class="field-error">{{ joinNameError }}</text>
            </div>
            <div class="space-y-1.5">
              <text class="text-[10px] font-bold text-text-dark/60 uppercase tracking-widest">忌口/偏好 (可选)</text>
              <textarea 
                v-model="joinForm.preferences" 
                placeholder="如：不吃香菜、海鲜过敏..." 
                rows="2"
                class="w-full px-4 py-3 rounded-custom border border-primary-10 focus:border-primary-30 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              @click="enterVisitorMode"
              class="flex-1 px-6 py-3 text-sm font-bold text-text-muted hover-text-text-dark transition-colors border border-primary-10 rounded-custom"
            >
              先逛逛
            </button>
            <button
              @click="handleJoinTable"
              :disabled="!joinForm.name.trim() && !user?.nickname"
              class="flex-1 px-6 py-3 text-sm font-bold bg-primary text-white hover-bg-primary-90 transition-colors rounded-custom shadow-warm"
            >
              {{ loading ? '加入中...' : '加入围炉' }}
            </button>
          </div>
        </div>
      </div>
    </uni-popup>

    <!-- 账单模态框 -->
    <uni-popup v-model="isBillingModalOpen" mode="center" class="w-[90%] max-w-md">
      <div class="chef-card p-6">
        <text class="serif-title text-xl font-bold text-text-dark mb-4 block text-center">录入饭单结算</text>
        <div class="space-y-4">
          <div class="space-y-1.5">
            <text class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">总支出金额 (元)</text>
            <input 
              v-model="billingAmount" 
              type="number" 
              step="0.01"
              placeholder="请输入本次聚餐的总花费" 
              class="w-full px-4 py-3 rounded-custom border border-primary-10 focus:border-primary-30 outline-none transition-all text-xl font-bold serif-title text-primary"
              @input="billingError = ''"
            />
            <text v-if="billingError" class="field-error">{{ billingError }}</text>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              @click="isBillingModalOpen = false"
              class="flex-1 px-6 py-3 text-sm font-bold text-text-dark/40 hover-text-text-dark transition-colors"
            >
              取消
            </button>
            <button
              @click="saveBilling"
              :disabled="!billingAmount || loading"
              class="flex-1 px-6 py-3 text-sm font-bold bg-primary text-white hover-bg-primary-90 transition-colors rounded-custom shadow-warm"
            >
              {{ loading ? '保存中...' : '确认结算' }}
            </button>
          </div>
        </div>
      </div>
    </uni-popup>
  </view>
  <view v-else class="container min-h-screen bg-bg-warm flex items-center justify-center px-4">
    <div class="text-center space-y-4">
      <text class="text-6xl">{{ loadError ? '⚠️' : '⏳' }}</text>
      <text class="serif-title text-xl font-bold text-text-dark">
        {{ loadError ? '加载失败' : '加载中...' }}
      </text>
      <text v-if="loadError" class="text-sm text-text-muted">{{ loadError }}</text>
      <button
        v-if="loadError"
        @click="fetchTable"
        class="px-6 py-3 text-sm font-bold bg-primary text-white rounded-custom shadow-warm"
      >
        重新加载
      </button>
    </div>
  </view>
</template>

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

.container {
  min-height: 100vh;
  background-color: var(--color-bg-warm);
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.py-20 {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-8 {
  gap: 2rem;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-xl {
  font-size: 1.25rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-3xl {
  font-size: 1.875rem;
}

.text-6xl {
  font-size: 3.75rem;
}

.font-bold {
  font-weight: 700;
}

.font-normal {
  font-weight: 400;
}

.font-italic {
  font-style: italic;
}

.text-text-dark {
  color: var(--color-text-dark);
}

.text-text-muted {
  color: var(--color-text-muted);
}

.text-primary {
  color: var(--color-primary);
}

.text-white {
  color: #FFFFFF;
}

.text-success {
  color: #10B981;
}

.text-gray-500 {
  color: #6B7280;
}

.bg-bg-warm {
  background-color: var(--color-bg-warm);
}

.bg-primary {
  background-color: var(--color-primary);
}

.bg-accent {
  background-color: var(--color-accent);
}

.bg-white {
  background-color: #FFFFFF;
}

.bg-gray-600 {
  background-color: #4B5563;
}

.bg-primary-5 {
    background-color: rgba(217, 119, 6, 0.05);
  }

  .bg-primary-10 {
    background-color: rgba(217, 119, 6, 0.1);
  }

  .bg-primary-20 {
    background-color: rgba(217, 119, 6, 0.2);
  }

  .bg-accent-20 {
    background-color: rgba(253, 230, 138, 0.2);
  }

  .bg-accent-30 {
    background-color: rgba(253, 230, 138, 0.3);
  }

  .bg-success-10 {
    background-color: rgba(16, 185, 129, 0.1);
  }

  .bg-black-20 {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .bg-white-10 {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .bg-white-80 {
    background-color: rgba(255, 255, 255, 0.8);
  }

  .bg-white-90 {
    background-color: rgba(255, 255, 255, 0.9);
  }

  .border {
    border-width: 1px;
  }

  .border-2 {
    border-width: 2px;
  }

  .border-b {
    border-bottom-width: 1px;
  }

  .border-primary-10 {
    border-color: rgba(217, 119, 6, 0.1);
  }

  .border-primary-20 {
    border-color: rgba(217, 119, 6, 0.2);
  }

  .border-primary-30 {
    border-color: rgba(217, 119, 6, 0.3);
  }

  .border-success-30 {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .border-white {
    border-color: #FFFFFF;
  }

  .border-white-10 {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .border-white-20 {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .border-transparent {
    border-color: transparent;
  }

.rounded-custom {
  border-radius: var(--radius-custom);
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-warm {
  box-shadow: var(--shadow-warm);
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bottom-3 {
  bottom: 0.75rem;
}

.left-4 {
  left: 1rem;
}

.right-4 {
  right: 1rem;
}

.z-50 {
  z-index: 50;
}

.w-10 {
  width: 2.5rem;
}

.h-10 {
  height: 2.5rem;
}

.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.w-8 {
  width: 2rem;
}

.h-40 {
  height: 10rem;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.max-w-md {
  max-width: 28rem;
}

.max-w-xs {
  max-width: 20rem;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

.break-all {
  word-break: break-all;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.object-cover {
  object-fit: cover;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-1 {
  flex: 1;
}

.scale-105 {
  transform: scale(1.05);
}

.scale-110 {
  transform: scale(1.1);
}

.scale-90 {
  transform: scale(0.9);
}

.rotate-12 {
  transform: rotate(12deg);
}

.-translate-y-1 {
  transform: translateY(-0.25rem);
}

.opacity-40 {
  opacity: 0.4;
}

.opacity-60 {
  opacity: 0.6;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-90 {
  opacity: 0.9;
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

.bg-gradient-to-t {
  background-image: linear-gradient(to top, var(--tw-gradient-stops));
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-primary {
  --tw-gradient-from: var(--color-primary);
}

.from-text-dark-60 {
  --tw-gradient-from: rgba(67, 20, 7, 0.6);
}

.to-text-muted {
  --tw-gradient-to: var(--color-text-muted);
}

.to-transparent {
  --tw-gradient-to: transparent;
}

.via-accent-30 {
  --tw-gradient-via: rgba(253, 230, 138, 0.3);
}

.via-transparent {
  --tw-gradient-via: transparent;
}

.hover-bg-primary-10:hover {
  background-color: rgba(217, 119, 6, 0.1);
}

.hover-bg-primary-20:hover {
  background-color: rgba(217, 119, 6, 0.2);
}

.hover-bg-primary-90:hover {
  background-color: rgba(217, 119, 6, 0.9);
}

.hover-bg-accent:hover {
  background-color: var(--color-accent);
}

.hover-bg-accent-40:hover {
  background-color: rgba(253, 230, 138, 0.4);
}

.hover-text-primary:hover {
  color: var(--color-primary);
}

.hover-text-text-dark:hover {
  color: var(--color-text-dark);
}

.hover-text-text-muted:hover {
  color: var(--color-text-muted);
}

.hover-border-primary-20:hover {
  border-color: rgba(217, 119, 6, 0.2);
}

.hover-scale-110:hover {
  transform: scale(1.1);
}

.active-scale-90:active {
  transform: scale(0.9);
}

.active-scale-98:active {
  transform: scale(0.98);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.duration-700 {
  transition-duration: 700ms;
}

.duration-1000 {
  transition-duration: 1000ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.serif-title {
  font-family: 'Noto Serif SC', serif;
}

.chef-card {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(217, 119, 6, 0.1);
  border-radius: var(--radius-custom);
  box-shadow: var(--shadow-warm);
  transition: all 0.3s;
}

/* 响应式布局 */
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-8 {
  gap: 2rem;
}

.field-error {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #DC2626;
}

/* 移除了媒体查询相关的类定义，因为它们会导致WXSS编译错误 */
</style>