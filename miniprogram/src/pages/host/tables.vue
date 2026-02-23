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
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-back" @tap="uni.navigateBack({ delta: 1 })">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">我的饭桌</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="mp-shell">
      <!-- 页面头部 -->
      <view class="page-header">
        <text class="header-subtitle">集中管理聚餐进度，快速进入详情继续操作。</text>
        <button class="create-btn" @click="openCreateModal">
          <text class="btn-icon">+</text>
          <text class="btn-text">发起聚餐</text>
        </button>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="state-card">
        <text class="state-title">加载中</text>
        <text class="state-desc">正在获取饭桌列表...</text>
      </view>
      
      <!-- 错误状态 -->
      <view v-else-if="loadError" class="state-card">
        <text class="state-title">数据加载失败</text>
        <text class="state-desc">{{ loadError }}</text>
        <button class="retry-btn" @click="loadTables">重新加载</button>
      </view>

      <!-- 空状态 -->
      <view v-else-if="tables.length === 0" class="state-card">
        <text class="state-icon">🍽️</text>
        <text class="state-title">还没有饭桌</text>
        <text class="state-desc">发起第一场聚餐，邀请家人一起投票。</text>
        <button class="create-btn-large" @click="openCreateModal">
          <text class="btn-icon">+</text>
          <text class="btn-text">发起聚餐</text>
        </button>
      </view>

      <!-- 饭桌列表 -->
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
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">时间</text>
              <text class="info-value">{{ formatDate(table.createdAt) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">参与</text>
              <text class="info-value">{{ table.guestCount || 0 }} 人</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="view-detail">查看详情 →</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建饭桌弹窗 -->
    <view v-if="isCreateModalOpen" class="modal-overlay" @click="closeCreateModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">发起新聚餐</text>
        
        <view class="form-section">
          <view class="form-field">
            <text class="field-label">您的称呼</text>
            <input
              v-model="newTable.hostName"
              type="text"
              placeholder="例如：王小明、王大厨..."
              class="field-input"
              @input="formErrors.hostName = ''"
            />
            <text v-if="formErrors.hostName" class="field-error">{{ formErrors.hostName }}</text>
          </view>

          <view class="form-field">
            <text class="field-label">饭桌名称</text>
            <input
              v-model="newTable.name"
              type="text"
              placeholder="例如：春分围炉、老友小聚..."
              class="field-input"
              @input="formErrors.name = ''"
            />
            <text v-if="formErrors.name" class="field-error">{{ formErrors.name }}</text>
          </view>

          <view class="form-field">
            <text class="field-label">聚餐时间</text>
            <input
              v-model="newTable.time"
              type="datetime-local"
              class="field-input"
              @input="formErrors.time = ''"
            />
            <text v-if="formErrors.time" class="field-error">{{ formErrors.time }}</text>
          </view>

          <view class="form-field">
            <text class="field-label">地点（选填）</text>
            <input
              v-model="newTable.location"
              type="text"
              placeholder="例如：翠微居、外滩源..."
              class="field-input"
            />
          </view>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="closeCreateModal">取消</button>
          <button class="confirm-btn" @click="createTable" :disabled="loading">
            {{ loading ? '筹备中...' : '确认发起' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 页面容器 - 为导航栏留出空间 */
.mp-shell {
  padding: 176rpx 24rpx 40rpx;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 0 8rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: #7F1D1D;
  flex: 1;
  line-height: 1.5;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 32rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.3);
}

.create-btn::after {
  border: none;
}

.create-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-icon {
  font-size: 32rpx;
  font-weight: 700;
}

.btn-text {
  font-size: 28rpx;
}

/* 状态卡片 */
.state-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.state-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 24rpx;
}

.state-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #450A0A;
  display: block;
  margin-bottom: 16rpx;
}

.state-desc {
  font-size: 28rpx;
  color: #7F1D1D;
  display: block;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.retry-btn {
  background: #FEF2F2;
  color: #DC2626;
  border: 2rpx solid #DC2626;
  border-radius: 32rpx;
  padding: 20rpx 48rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.retry-btn::after {
  border: none;
}

.create-btn-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 28rpx 64rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin: 0 auto;
  box-shadow: 0 6rpx 20rpx rgba(220, 38, 38, 0.3);
}

.create-btn-large::after {
  border: none;
}

.create-btn-large:active {
  transform: scale(0.98);
}

/* 饭桌列表 */
.table-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.table-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 2rpx solid #FEE2E2;
}

.table-card:active {
  transform: scale(0.99);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #450A0A;
  line-height: 1.3;
  flex: 1;
  margin-right: 16rpx;
}

.status-badge {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
}

.status-text {
  font-size: 24rpx;
  font-weight: 600;
}

.card-body {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 26rpx;
  color: #991B1B;
}

.info-value {
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 500;
}

.card-footer {
  border-top: 2rpx solid #FEF2F2;
  padding-top: 20rpx;
}

.view-detail {
  font-size: 28rpx;
  color: #DC2626;
  font-weight: 600;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 32rpx;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx;
  width: 100%;
  max-width: 640rpx;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #450A0A;
  display: block;
  margin-bottom: 40rpx;
  text-align: center;
}

.form-section {
  margin-bottom: 40rpx;
}

.form-field {
  margin-bottom: 32rpx;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #450A0A;
  display: block;
  margin-bottom: 16rpx;
}

.field-input {
  width: 100%;
  height: 88rpx;
  background: #FEF2F2;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #450A0A;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #DC2626;
  background: #FFFFFF;
}

.field-error {
  font-size: 24rpx;
  color: #DC2626;
  display: block;
  margin-top: 12rpx;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: #F3F4F6;
  color: #6B7280;
  border: none;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.cancel-btn::after {
  border: none;
}

.confirm-btn {
  flex: 1;
  height: 88rpx;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.confirm-btn::after {
  border: none;
}

.confirm-btn[disabled] {
  opacity: 0.6;
}
</style>