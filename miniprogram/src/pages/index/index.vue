<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getTables } from '@/api/tables';
import { request } from '@/api/request';
import type { Table } from '@/types';
import Icons from '@/components/Icons.vue';

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
    tables.value = await getTables(familyStore.currentFamilyId);
    tableCount.value = tables.value.length;
    recentTables.value = tables.value.slice(0, 3);
    
    const dishesRes = await request({
      url: '/dishes',
      method: 'GET',
      data: { familyId: familyStore.currentFamilyId },
      needAuth: true
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
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-title">饭桌</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="page-content">
      <view class="header">
        <view class="family-selector" @click="handleSwitchFamily">
          <view class="family-info">
            <text class="family-name">{{ currentFamily?.name || '选择家庭' }}</text>
            <text class="family-hint">点击切换</text>
          </view>
          <view class="family-icon">
            <text class="icon-chevron">›</text>
          </view>
        </view>
        <view class="header-actions">
          <navigator v-if="isOwner" url="/pages/family/settings" class="header-btn">
            <text class="btn-text">设置</text>
          </navigator>
        </view>
      </view>

      <view class="welcome-section">
        <text class="welcome-title">今天想吃点什么？</text>
        <text class="welcome-subtitle">从筹备到结算，一站式管理家庭聚餐</text>
      </view>

      <view class="quick-actions">
        <navigator url="/pages/host/tables" class="action-card primary-action">
          <view class="action-icon">
            <Icons name="plus" class="icon-svg" />
          </view>
          <view class="action-content">
            <text class="action-title">发起饭桌</text>
            <text class="action-desc">创建聚餐、邀请成员、投票选菜</text>
          </view>
          <view class="action-arrow">
            <Icons name="arrow-right" class="arrow-svg" />
          </view>
        </navigator>
      </view>

      <view class="stats-section">
        <view class="stat-card">
          <text class="stat-value">{{ tableCount }}</text>
          <text class="stat-label">饭桌总数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ dishCount }}</text>
          <text class="stat-label">菜单总数</text>
        </view>
      </view>

      <view class="recent-section">
        <view class="section-header">
          <text class="section-title">最近饭桌</text>
          <navigator v-if="tables.length > 0" url="/pages/host/tables" class="section-link">
            <text class="link-text">查看全部</text>
            <text class="icon-chevron">›</text>
          </navigator>
        </view>

        <view v-if="loading" class="empty-state">
          <text class="empty-icon">加载中</text>
          <text class="empty-title">正在同步最新数据...</text>
        </view>

        <view v-else-if="recentTables.length === 0" class="empty-state">
          <view class="empty-illustration">
            <Icons name="dish" class="empty-icon-svg" />
          </view>
          <text class="empty-title">还没有饭桌</text>
          <text class="empty-desc">点击上方"发起饭桌"开始第一次家庭聚餐</text>
        </view>

        <view v-else class="recent-list">
          <navigator
            v-for="table in recentTables"
            :key="table.id"
            :url="`/pages/table/detail?id=${table.id}`"
            class="recent-card"
          >
            <view class="recent-header">
              <text class="recent-title">{{ table.name || '家庭聚餐' }}</text>
              <view :class="statusTone(table.status)">
                <text>{{ statusLabel(table.status) }}</text>
              </view>
            </view>
            <view class="recent-footer">
              <text class="recent-time">{{ formatDate(table.createdAt) }}</text>
              <text class="recent-location">{{ table.location || '地点待定' }}</text>
            </view>
          </navigator>
        </view>
      </view>

      <view class="footer">
        <text class="footer-text">私厨助手</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FEF2F2;
  padding-top: 144rpx;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.page-content {
  padding: 48rpx 32rpx 64rpx;
}

@media screen and (max-width: 375px) {
  .page-content {
    padding: 32rpx 24rpx 48rpx;
  }
  
  .welcome-title {
    font-size: 48rpx;
  }
  
  .welcome-subtitle {
    font-size: 24rpx;
  }
  
  .action-icon {
    width: 72rpx;
    height: 72rpx;
  }
  
  .action-title {
    font-size: 28rpx;
  }
  
  .stat-value {
    font-size: 48rpx;
  }
}

@media screen and (min-width: 414px) {
  .page-content {
    padding: 64rpx 48rpx 96rpx;
  }
  
  .welcome-title {
    font-size: 64rpx;
  }
  
  .welcome-subtitle {
    font-size: 32rpx;
  }
  
  .action-icon {
    width: 96rpx;
    height: 96rpx;
  }
  
  .action-title {
    font-size: 36rpx;
  }
  
  .stat-value {
    font-size: 56rpx;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.family-selector {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  margin-right: 16rpx;
}

.family-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.family-name {
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
}

.family-hint {
  font-size: 20rpx;
  color: #991B1B;
}

.family-icon {
  font-size: 32rpx;
  color: #DC2626;
}

.header-actions {
  display: flex;
  gap: 8rpx;
}

.header-btn {
  padding: 0 24rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  transition: all 150ms ease;
}

.header-btn:active {
  background: #FEF2F2;
  border-color: #DC2626;
}

.btn-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #450A0A;
}

.welcome-section {
  margin-bottom: 48rpx;
}

.welcome-title {
  display: block;
  font-size: 56rpx;
  color: #450A0A;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 16rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 28rpx;
  color: #7F1D1D;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.action-card {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
  transition: all 300ms ease;
}

.action-card:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
}

.primary-action {
  border-color: #DC2626;
  background: linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%);
}

.action-icon {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #DC2626;
  border-radius: 16rpx;
  margin-right: 24rpx;
}

.icon-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.action-title {
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
}

.action-desc {
  font-size: 24rpx;
  color: #991B1B;
  line-height: 1.5;
}

.action-arrow {
  font-size: 40rpx;
  color: #DC2626;
}

.stats-section {
  display: flex;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
}

.stat-value {
  font-size: 56rpx;
  color: #DC2626;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #991B1B;
}

.recent-section {
  margin-bottom: 48rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
}

.section-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.link-text {
  font-size: 24rpx;
  color: #DC2626;
  font-weight: 500;
}

.icon-chevron {
  font-size: 28rpx;
  color: #DC2626;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 96rpx 48rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
}

.empty-illustration {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FEF2F2;
  border-radius: 50%;
  margin-bottom: 32rpx;
}

.empty-icon-svg {
  width: 64rpx;
  height: 64rpx;
  color: #DC2626;
}

.empty-title {
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #7F1D1D;
  text-align: center;
}

.icon-svg {
  width: 40rpx;
  height: 40rpx;
  color: #FFFFFF;
}

.arrow-svg {
  width: 32rpx;
  height: 32rpx;
  color: #DC2626;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recent-card {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
  transition: all 300ms ease;
}

.recent-card:active {
  transform: scale(0.98);
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.recent-title {
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.status-plain {
  background: #FEF2F2;
  color: #DC2626;
}

.status-active {
  background: #DC2626;
  color: #fff;
}

.status-done {
  background: #FEF2F2;
  color: #16A34A;
}

.recent-footer {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.recent-time,
.recent-location {
  font-size: 24rpx;
  color: #991B1B;
}

.footer {
  text-align: center;
  padding: 48rpx 0;
}

.footer-text {
  font-size: 20rpx;
  color: #991B1B;
}
</style>
