<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getTables } from '@/api/tables';
import { request } from '@/api/request';
import type { Table } from '@/types';

const authStore = useAuthStore();
const familyStore = useFamilyStore();

const user = computed(() => authStore.user);
const currentFamily = computed(() => familyStore.currentFamily);
const isOwner = computed(() => currentFamily.value?.role === 'OWNER');

const tables = ref<Table[]>([]);
const tableCount = ref(0);
const dishCount = ref(0);
const recentTables = ref<Table[]>([]);
const loading = ref(false);

const statusConfig: Record<string, { label: string; tone: 'plain' | 'active' | 'done' }> = {
  PLANNING: { label: '筹备中', tone: 'plain' },
  VOTING: { label: '投票中', tone: 'active' },
  LOCKED: { label: '已确定', tone: 'done' },
  ARCHIVED: { label: '已结束', tone: 'done' },
  draft: { label: '筹备中', tone: 'plain' },
  voting: { label: '投票中', tone: 'active' },
  confirmed: { label: '已确定', tone: 'done' },
  completed: { label: '已结束', tone: 'done' },
};

onLoad(async (query: any) => {
  if (query?.b || (query?.scene && decodeURIComponent(query.scene).match(/b=([a-zA-Z0-9]+)/))) {
    let bindToken = query.b;
    if (!bindToken && query?.scene) {
      const match = decodeURIComponent(query.scene).match(/b=([a-zA-Z0-9]+)/);
      if (match) bindToken = match[1];
    }
    if (bindToken) {
      uni.navigateTo({ url: `/pages/profile/bind-wechat?b=${bindToken}` });
      return;
    }
  }
});

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    uni.redirectTo({ url: '/pages/auth/login' });
    return;
  }

  if (!familyStore.hasFamily) {
    try {
      await familyStore.fetchFamilies();
    } catch (e) {
      console.error('获取家庭列表失败', e);
    }
    if (!familyStore.hasFamily) {
      uni.redirectTo({ url: '/pages/onboarding/welcome' });
      return;
    }
  }

  await loadData();
});

async function loadData() {
  if (!familyStore.currentFamilyId) return;
  
  loading.value = true;
  try {
    // 获取饭桌列表
    tables.value = await getTables(familyStore.currentFamilyId);
    tableCount.value = tables.value.length;
    recentTables.value = tables.value.slice(0, 3);
    
    // 获取菜品数量
    const dishesRes = await request.get('/dishes', {
      params: { familyId: familyStore.currentFamilyId },
    });
    if (dishesRes && Array.isArray(dishesRes)) {
      dishCount.value = dishesRes.length;
    }
  } catch (error) {
    console.error('加载数据失败', error);
    uni.showToast({
      title: '加载失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

function handleInviteAdmin() {
  uni.navigateTo({ url: '/pages/family/settings' });
}

function handleSwitchFamily() {
  if (!familyStore.families.length) {
    uni.showToast({
      title: '暂无可切换家庭',
      icon: 'none'
    });
    return;
  }

  const itemList = familyStore.families.map(f => f.name);
  uni.showActionSheet({
    itemList,
    success: async (res) => {
      const selected = familyStore.families[res.tapIndex];
      if (!selected) return;
      familyStore.setCurrentFamily(selected.id);
      await loadData();
    }
  });
}

function goToTableDetail(tableId: string) {
  uni.navigateTo({ url: `/pages/table/detail?id=${tableId}` });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function statusLabel(status: string) {
  return statusConfig[status]?.label || '筹备中';
}

function statusTone(status: string) {
  const tone = statusConfig[status]?.tone || 'plain';
  if (tone === 'active') return 'status status-active';
  if (tone === 'done') return 'status status-done';
  return 'status status-plain';
}
</script>

<template>
  <view class="mp-page">
    <view class="mp-shell">
      <view class="header-row">
        <view class="family-switcher" @click="handleSwitchFamily">
          <text class="family-name">{{ currentFamily?.name || '选择家庭' }}</text>
          <text class="family-arrow">切换</text>
        </view>
        <view class="header-actions">
          <text v-if="isOwner" class="header-link" @click="handleInviteAdmin">家庭设置</text>
          <navigator url="/pages/profile/index" class="header-link">
            {{ user?.nickname || '我的' }}
          </navigator>
        </view>
      </view>

      <view class="mp-header">
        <text class="mp-title">今天想吃点什么？</text>
        <text class="mp-subtitle">从饭桌筹备到菜单整理，按下面两个入口继续。</text>
      </view>

      <navigator url="/pages/host/tables" class="mp-card action-card action-main">
        <view>
          <text class="action-title">发起饭桌</text>
          <text class="action-desc">创建聚餐、邀请成员投票、推进到锁单。</text>
        </view>
        <text class="action-link">进入我的饭桌</text>
      </navigator>

      <navigator url="/pages/menu/index" class="mp-card action-card">
        <view>
          <text class="action-title">管理菜单库</text>
          <text class="action-desc">统一维护家庭菜谱，便于后续快速选菜。</text>
        </view>
        <text class="action-link">进入菜单库</text>
      </navigator>

      <view class="metrics">
        <view class="mp-card metric-item">
          <text class="metric-value">{{ tableCount }}</text>
          <text class="metric-label">饭桌总数</text>
        </view>
        <view class="mp-card metric-item">
          <text class="metric-value">{{ dishCount }}</text>
          <text class="metric-label">菜单总数</text>
        </view>
      </view>

      <view class="recent-wrap">
        <text class="section-title">最近饭桌</text>
        <view v-if="loading" class="mp-card mp-empty">
          <text class="mp-empty-title">加载中</text>
          <text class="mp-empty-desc">正在同步最新饭桌数据...</text>
        </view>
        <view v-else-if="recentTables.length === 0" class="mp-card mp-empty">
          <text class="mp-empty-title">还没有饭桌</text>
          <text class="mp-empty-desc">从上方“发起饭桌”开始第一次聚餐。</text>
        </view>
        <view v-else class="recent-list">
          <navigator
            v-for="table in recentTables"
            :key="table.id"
            :url="`/pages/table/detail?id=${table.id}`"
            class="mp-card recent-item"
          >
            <view class="recent-row">
              <text class="recent-title">{{ table.name || '家庭聚餐' }}</text>
              <text :class="statusTone(table.status)">{{ statusLabel(table.status) }}</text>
            </view>
            <text class="recent-meta">{{ formatDate(table.createdAt) }} · {{ table.location || '地点待定' }}</text>
          </navigator>
        </view>
      </view>

      <view class="footer-note">
        <text>私厨助手</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22rpx;
}

.family-switcher {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: var(--bg-soft);
}

.family-name {
  font-size: 24rpx;
  color: var(--text-700);
  font-weight: 600;
}

.family-arrow {
  font-size: 22rpx;
  color: var(--brand-500);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-link {
  font-size: 24rpx;
  color: var(--text-700);
}

.action-card {
  margin-bottom: 18rpx;
  padding: 28rpx;
}

.action-main {
  border-color: rgba(154, 91, 51, 0.28);
}

.action-title {
  display: block;
  font-size: 34rpx;
  color: var(--text-900);
  font-weight: 700;
}

.action-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  color: var(--text-500);
  line-height: 1.6;
}

.action-link {
  display: inline-block;
  margin-top: 18rpx;
  font-size: 25rpx;
  color: var(--brand-500);
  font-weight: 600;
}

.metrics {
  margin: 4rpx 0 20rpx;
  display: flex;
  gap: 14rpx;
}

.metric-item {
  flex: 1;
  padding: 22rpx 20rpx;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 40rpx;
  color: var(--brand-600);
  font-weight: 700;
}

.metric-label {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  color: var(--text-500);
}

.recent-wrap {
  margin-top: 14rpx;
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 30rpx;
  color: var(--text-900);
  font-weight: 600;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.recent-item {
  padding: 24rpx;
}

.recent-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-title {
  font-size: 30rpx;
  color: var(--text-900);
  font-weight: 600;
}

.recent-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--text-500);
}

.status {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.status-plain {
  background: rgba(154, 91, 51, 0.12);
  color: var(--brand-600);
}

.status-active {
  background: rgba(168, 105, 42, 0.16);
  color: var(--warn-500);
}

.status-done {
  background: rgba(47, 125, 79, 0.14);
  color: var(--ok-500);
}

.footer-note {
  margin-top: 30rpx;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-500);
}
</style>