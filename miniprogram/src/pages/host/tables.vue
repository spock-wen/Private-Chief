<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getTables, createTable as createTableApi } from '@/api/tables';
import type { Table } from '@/types';

const authStore = useAuthStore();
const familyStore = useFamilyStore();

const tables = ref<Table[]>([]);
const loading = ref(false);
const isCreateModalOpen = ref(false);
const loadError = ref('');
const formErrors = ref({
  hostName: '',
  name: '',
  time: ''
});

const newTable = ref({
  name: '',
  time: '',
  location: '',
  hostName: authStore.user?.nickname || ''
});

onMounted(async () => {
  await loadTables();
});

async function loadTables() {
  if (!familyStore.currentFamilyId) return;
  
  loading.value = true;
  loadError.value = '';
  try {
    tables.value = await getTables(familyStore.currentFamilyId);
  } catch (error) {
    console.error('加载饭桌列表失败', error);
    loadError.value = '加载失败，请检查网络后重试';
  } finally {
    loading.value = false;
  }
}

function goToTableDetail(tableId: string) {
  uni.navigateTo({ url: `/pages/table/detail?id=${tableId}` });
}

function openCreateModal() {
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
  formErrors.value = {
    hostName: '',
    name: '',
    time: ''
  };
  // 重置表单
  newTable.value = {
    name: '',
    time: '',
    location: '',
    hostName: authStore.user?.nickname || ''
  };
}

function validateCreateForm() {
  formErrors.value = {
    hostName: '',
    name: '',
    time: ''
  };

  if (!newTable.value.hostName.trim()) {
    formErrors.value.hostName = '请填写您的称呼';
  }
  if (!newTable.value.name.trim()) {
    formErrors.value.name = '请填写饭桌名称';
  }
  if (!newTable.value.time) {
    formErrors.value.time = '请选择聚餐时间';
  }

  return !formErrors.value.hostName && !formErrors.value.name && !formErrors.value.time;
}

async function createTable() {
  if (!validateCreateForm()) {
    return;
  }

  if (!familyStore.currentFamily) {
    uni.showToast({
      title: '请先选择一个家庭',
      icon: 'none'
    });
    return;
  }

  loading.value = true;
  try {
    const created = await createTableApi({
      name: newTable.value.name.trim(),
      time: new Date(newTable.value.time).toISOString(),
      location: newTable.value.location?.trim() || undefined,
      familyId: familyStore.currentFamily.id
    });

    uni.showToast({
      title: '饭桌创建成功',
      icon: 'success'
    });
    
    closeCreateModal();
    if (created?.id) {
      setTimeout(() => {
        uni.navigateTo({ url: `/pages/table/detail?id=${created.id}` });
      }, 250);
    } else {
      await loadTables();
    }
  } catch (error: any) {
    console.error('创建饭桌失败', error);
    uni.showToast({
      title: error?.message || '创建失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    draft: { label: '筹备中', bg: '#FEF3C7', color: '#D97706' },
    voting: { label: '投票中', bg: '#DBEAFE', color: '#2563EB' },
    confirmed: { label: '已确定', bg: '#D1FAE5', color: '#059669' },
    completed: { label: '已完成', bg: '#F3F4F6', color: '#6B7280' },
  };
  return configs[status] || configs.draft;
}
</script>

<template>
  <view class="mp-page">
    <view class="mp-shell">
      <view class="header-row">
        <view class="mp-header">
          <text class="mp-title">我的饭桌</text>
          <text class="mp-subtitle">集中管理聚餐进度，快速进入详情继续操作。</text>
        </view>
        <button class="mp-primary-btn add-btn" @click="openCreateModal">发起聚餐</button>
      </view>

    <view>
      <view v-if="loading" class="loading-state">
        <view class="mp-card mp-empty">
          <text class="mp-empty-title">加载中</text>
          <text class="mp-empty-desc">正在获取饭桌列表...</text>
        </view>
      </view>
      
      <view v-else-if="loadError" class="mp-card mp-empty">
        <text class="mp-empty-title">数据加载失败</text>
        <text class="mp-empty-desc">{{ loadError }}</text>
        <button class="mp-secondary-btn retry-btn" @click="loadTables">重新加载</button>
      </view>

      <view v-else-if="tables.length === 0" class="mp-card mp-empty">
        <text class="mp-empty-title">还没有饭桌</text>
        <text class="mp-empty-desc">发起第一场聚餐，邀请家人一起投票。</text>
        <button class="mp-primary-btn retry-btn" @click="openCreateModal">发起聚餐</button>
      </view>

      <view v-else class="table-list">
        <view 
          v-for="table in tables" 
          :key="table.id" 
          class="table-card"
          @click="goToTableDetail(table.id)"
        >
          <view class="card-header">
            <text class="card-title">{{ table.name || '家庭聚餐' }}</text>
            <view class="status-badge" :style="{ background: getStatusConfig(table.status).bg }">
              <text class="status-text" :style="{ color: getStatusConfig(table.status).color }">
                {{ getStatusConfig(table.status).label }}
              </text>
            </view>
          </view>
          <view class="card-info">
            <view class="info-item">
              <text class="info-text">{{ formatDate(table.createdAt) }}</text>
            </view>
            <view class="info-item">
              <text class="info-text">{{ table.guestCount || 0 }} 人参与</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="arrow-icon">查看详情</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建饭桌弹窗 -->
    <view v-if="isCreateModalOpen" class="modal-overlay" @click="closeCreateModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">发起新聚餐</text>
        
        <view class="form-section">
          <view class="mp-field">
            <text class="mp-label">您的称呼</text>
            <input
              v-model="newTable.hostName"
              type="text"
              placeholder="例如：王小明、王大厨..."
              class="mp-input"
              @input="formErrors.hostName = ''"
            />
            <text v-if="formErrors.hostName" class="mp-helper-text">{{ formErrors.hostName }}</text>
          </view>

          <view class="mp-field">
            <text class="mp-label">饭桌名称</text>
            <input
              v-model="newTable.name"
              type="text"
              placeholder="例如：春分围炉、老友小聚..."
              class="mp-input"
              @input="formErrors.name = ''"
            />
            <text v-if="formErrors.name" class="mp-helper-text">{{ formErrors.name }}</text>
          </view>

          <view class="mp-field">
            <text class="mp-label">聚餐时间</text>
            <input
              v-model="newTable.time"
              type="datetime-local"
              class="mp-input"
              @input="formErrors.time = ''"
            />
            <text v-if="formErrors.time" class="mp-helper-text">{{ formErrors.time }}</text>
          </view>

          <view class="mp-field">
            <text class="mp-label">地点</text>
            <input
              v-model="newTable.location"
              type="text"
              placeholder="例如：翠微居、外滩源..."
              class="mp-input"
            />
          </view>
        </view>

        <view class="modal-actions">
          <button class="mp-secondary-btn half-btn" @click="closeCreateModal">取消</button>
          <button class="mp-primary-btn half-btn" @click="createTable" :loading="loading">
            {{ loading ? '筹备中...' : '确认发起' }}
          </button>
        </view>
      </view>
    </view>
    </view>
  </view>
</template>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.add-btn {
  width: 220rpx;
  height: 84rpx;
  font-size: 26rpx;
}

.loading-state {
  margin-bottom: 16rpx;
}

.retry-btn {
  width: 260rpx;
  margin: 22rpx auto 0;
}

.table-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.table-card {
  background: var(--bg-surface);
  border: 2rpx solid var(--border-200);
  border-radius: var(--radius-lg);
  padding: 24rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-900);
  line-height: 1.2;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
}

.status-text {
  font-size: 22rpx;
  font-weight: 600;
}

.card-info {
  display: flex;
  gap: 18rpx;
  margin-top: 10rpx;
}

.info-item {
  flex: 1;
}

.info-text {
  font-size: 24rpx;
  color: var(--text-500);
}

.card-footer {
  margin-top: 12rpx;
}

.arrow-icon {
  font-size: 24rpx;
  color: var(--brand-500);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(47, 36, 28, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 34rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
  border: 2rpx solid var(--border-200);
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-900);
  display: block;
  margin-bottom: 20rpx;
}

.form-section {
  margin-bottom: 18rpx;
}

.modal-actions {
  display: flex;
  gap: 14rpx;
}

.half-btn {
  flex: 1;
}
</style>