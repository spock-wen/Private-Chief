<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { request } from '@/api/request';
import type { Table, Dish } from '@/types';
import Icons from '@/components/Icons.vue';

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
  PLANNING: { label: '筹备中', class: 'status-plain', icon: 'edit' },
  VOTING: { label: '投票中', class: 'status-active', icon: 'fire' },
  LOCKED: { label: '已确定', class: 'status-done', icon: 'lock' },
  ARCHIVED: { label: '已结束', class: 'status-done', icon: 'check' },
  draft: { label: '筹备中', class: 'status-plain', icon: 'edit' },
  voting: { label: '投票中', class: 'status-active', icon: 'fire' },
  confirmed: { label: '已确定', class: 'status-done', icon: 'lock' },
  completed: { label: '已结束', class: 'status-done', icon: 'check' },
};

const categoryLabels = {
  HOT_DISH: '热菜',
  COLD_DISH: '凉菜',
  SOUP: '汤品',
  STAPLE: '主食',
  DRINK: '饮料'
};

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
    const data: Table = await request({
      url: `/tables/${tableId.value}`,
      method: 'GET',
      needAuth: true
    });
    table.value = data;
    
    if (data.totalExpense) {
      billingAmount.value = data.totalExpense;
    }
    
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
      await request({
        url: `/tables/${table.value.id}/votes/${dishId}`,
        method: 'DELETE',
        needAuth: true
      });
    } else {
      await request({
        url: `/tables/${table.value.id}/votes`,
        method: 'POST',
        data: { dishId },
        needAuth: true
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
    await request({
      url: `/tables/${table.value.id}/guests`,
      method: 'POST',
      data: {
        name: nameToUse,
        preferences: joinForm.value.preferences
      },
      needAuth: true
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
    await request({
      url: `/tables/${table.value.id}/billing`,
      method: 'PATCH',
      data: { totalExpense: billingAmount.value },
      needAuth: true
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
    await request({
      url: `/tables/${table.value.id}/status`,
      method: 'PATCH',
      data: { status: targetStatus },
      needAuth: true
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
  <view v-if="table" class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-back" @tap="uni.navigateBack({ delta: 1 })">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">{{ table.name }}</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="page-content">
      <view class="info-card">
        <view class="info-header">
          <text class="info-title">{{ table.name }}</text>
          <view :class="['status-badge', statusConfig[table.status]?.class]">
            <text class="status-icon">{{ statusConfig[table.status]?.icon }}</text>
            <text class="status-text">{{ statusConfig[table.status]?.label }}</text>
          </view>
        </view>
        <view class="info-meta">
          <view class="meta-item">
            <text class="meta-icon">📅</text>
            <text class="meta-text">{{ formatDate(table.time) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">📍</text>
            <text class="meta-text">{{ table.location || '地点待定' }}</text>
          </view>
        </view>

        <view v-if="isHost" class="host-actions">
          <template v-if="table.status === 'PLANNING' || table.status === 'draft'">
            <button class="action-btn primary" @click="confirmAdvanceStatus('VOTING')">
              <text>开启投票</text>
            </button>
          </template>
          <template v-if="table.status === 'VOTING'">
            <button class="action-btn success" @click="confirmAdvanceStatus('LOCKED')">
              <text>确认菜单</text>
            </button>
          </template>
          <template v-if="table.status === 'LOCKED' || table.status === 'confirmed'">
            <button class="action-btn neutral" @click="confirmAdvanceStatus('ARCHIVED')">
              <text>结束饭局</text>
            </button>
          </template>
        </view>
      </view>

      <view v-if="(table.status === 'VOTING' || table.status === 'voting') && allTimeTopDishes.length > 0" class="top-dishes-card">
        <view class="card-header">
          <text class="card-title">🏆 人气风向标</text>
          <text class="card-subtitle">当前全场最受期待的前三佳肴</text>
        </view>
        <view class="top-dishes-list">
          <view 
            v-for="(dish, index) in allTimeTopDishes" 
            :key="dish.id" 
            class="top-dish-item"
          >
            <text class="top-rank" :class="{ 'top-1': index === 0 }">#{{ index + 1 }}</text>
            <text class="top-name">{{ dish.name }}</text>
            <view class="top-votes">
              <text class="votes-count">{{ getVoteCount(dish.id) }}</text>
              <text class="votes-label">票</text>
            </view>
          </view>
        </view>
      </view>

      <view class="dishes-section">
        <view class="section-header">
          <text class="section-title">候选菜谱</text>
          <text class="section-subtitle">
            {{ (table.status === 'PLANNING' || table.status === 'draft') ? '挑选您想为客人准备的精选佳肴' : '客人们正在表达他们的偏好' }}
          </text>
        </view>

        <view v-if="table.candidateDishes.length === 0" class="empty-state">
          <text class="empty-icon">🍽️</text>
          <text class="empty-title">暂无候选菜品</text>
        </view>

        <view v-else class="dishes-content">
          <view v-for="(dishes, cat) in groupedDishes" :key="cat" class="category-group">
            <view v-if="dishes.length > 0" class="category-header">
              <text class="category-title">{{ categoryLabels[cat] || cat }}</text>
            </view>

            <view class="dishes-grid">
              <view 
                v-for="dish in dishes" 
                :key="dish.id" 
                class="dish-card"
              >
                <view class="dish-image-wrapper">
                  <image 
                    :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'" 
                    class="dish-image"
                    mode="aspectFill"
                  />
                  <view class="dish-overlay">
                    <text class="dish-name">{{ dish.name }}</text>
                    <view v-if="table.status === 'VOTING' || table.status === 'voting'" class="dish-rank">
                      <text>分类排名 #{{ getCategoryRank(dish.id, cat) }}</text>
                    </view>
                  </view>
                </view>

                <view class="dish-content">
                  <view class="dish-actions">
                    <button 
                      v-if="(table.status === 'VOTING' || table.status === 'voting') && isGuest"
                      @click="toggleVote(dish.id)"
                      :disabled="votingDishId === dish.id"
                      :class="['vote-btn', { 'voted': hasVoted(dish.id), 'disabled': votingDishId === dish.id }]"
                    >
                      <Icons :name="hasVoted(dish.id) ? 'heart' : 'heart-outline'" class="vote-icon" />
                      <text class="vote-text">{{ hasVoted(dish.id) ? '已想吃' : '我想吃' }}</text>
                    </button>
                    <button
                      v-else-if="(table.status === 'VOTING' || table.status === 'voting') && !isGuest"
                      disabled
                      class="vote-btn disabled"
                    >
                      <Icons name="heart-outline" class="vote-icon" />
                      <text class="vote-text">加入后可投票</text>
                    </button>

                    <view v-if="table.status === 'VOTING' || table.status === 'voting'" class="vote-count">
                      <Icons name="fire" class="vote-fire" />
                      <text class="vote-number">{{ getVoteCount(dish.id) }}</text>
                    </view>
                  </view>

                  <view v-if="table.status === 'VOTING' || table.status === 'voting'" class="popularity-bar">
                    <view class="popularity-track">
                      <view 
                        class="popularity-fill" 
                        :style="{ width: `${getPopularityWidth(dish.id)}%` }"
                      ></view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="invite-card">
        <view class="invite-header">
          <text class="invite-title">邀约好友</text>
          <text class="invite-subtitle">家宴的快乐源于分享，将饭桌链接发送给好友</text>
        </view>
        <view class="invite-link-box">
          <text class="invite-link">{{ inviteUrl }}</text>
        </view>
        <button class="invite-btn" @click="copyLink">
          <Icons name="copy" class="btn-icon" />
          <text>复制链接</text>
        </button>
      </view>

      <view v-if="table.status === 'LOCKED' || table.status === 'ARCHIVED' || table.status === 'confirmed' || table.status === 'completed'" class="billing-card">
        <view class="card-header">
          <text class="card-title">🧾 收支概览</text>
        </view>

        <view v-if="table.totalExpense" class="billing-content">
          <view class="billing-row">
            <text class="billing-label">总支出</text>
            <text class="billing-value">¥ {{ table.totalExpense.toFixed(2) }}</text>
          </view>
          <view class="billing-row">
            <text class="billing-label">参与人数</text>
            <text class="billing-value">{{ table.guests.length }} 人</text>
          </view>
          <view class="billing-row">
            <text class="billing-label">人均消费</text>
            <text class="billing-value highlight">¥ {{ (table.totalExpense / table.guests.length).toFixed(2) }}</text>
          </view>
        </view>

        <view v-else class="billing-empty">
          <text class="empty-text">暂未录入账单</text>
          <button v-if="isHost" class="action-btn primary" @click="isBillingModalOpen = true">
            <text>录入账单</text>
          </button>
        </view>
      </view>
    </view>

    <view v-if="isJoinModalOpen" class="modal-overlay" @click="isJoinModalOpen = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">加入饭桌</text>
        <text class="modal-desc">请输入您的昵称以参与投票</text>
        
        <view class="form-field">
          <text class="form-label">昵称</text>
          <input
            v-model="joinForm.name"
            class="form-input"
            placeholder="请输入昵称"
            maxlength="20"
          />
          <text v-if="joinNameError" class="form-error">{{ joinNameError }}</text>
        </view>

        <view class="form-field">
          <text class="form-label">饮食偏好（可选）</text>
          <textarea
            v-model="joinForm.preferences"
            class="form-textarea"
            placeholder="例如：不吃辣、素食等"
            maxlength="100"
          />
        </view>

        <view class="modal-actions">
          <button class="modal-btn secondary" @click="enterVisitorMode">
            <text>仅浏览</text>
          </button>
          <button class="modal-btn primary" @click="handleJoinTable">
            <text>加入</text>
          </button>
        </view>
      </view>
    </view>

    <view v-if="isBillingModalOpen" class="modal-overlay" @click="isBillingModalOpen = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">录入账单</text>
        
        <view class="form-field">
          <text class="form-label">总支出（元）</text>
          <input
            v-model="billingAmount"
            type="digit"
            class="form-input"
            placeholder="请输入总金额"
          />
          <text v-if="billingError" class="form-error">{{ billingError }}</text>
        </view>

        <view class="modal-actions">
          <button class="modal-btn secondary" @click="isBillingModalOpen = false">
            <text>取消</text>
          </button>
          <button class="modal-btn primary" @click="saveBilling">
            <text>保存</text>
          </button>
        </view>
      </view>
    </view>
  </view>

  <view v-else-if="loading" class="page loading-page">
    <text class="loading-icon">⏳</text>
    <text class="loading-text">加载中...</text>
  </view>

  <view v-else-if="loadError" class="page error-page">
    <text class="error-icon">❌</text>
    <text class="error-text">{{ loadError }}</text>
  </view>
</template>

<style scoped>
/* 自定义导航栏 */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #DC2626;
}

.nav-status-bar {
  height: var(--status-bar-height, 44rpx);
}

.nav-content {
  height: 100rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24rpx 16rpx;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 36rpx;
  color: white;
}

.nav-title {
  font-size: 30rpx;
  font-weight: 500;
  color: white;
  flex: 1;
  text-align: center;
  line-height: 1;
  padding-bottom: 4rpx;
}

.nav-right {
  width: 60rpx;
}

.page {
  min-height: 100vh;
  background: #FEF2F2;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.page-content {
  padding: calc(var(--status-bar-height, 44rpx) + 100rpx + 28rpx) 28rpx 40rpx;
}

@media screen and (max-width: 375px) {
  .page-content {
    padding: 112rpx 24rpx 32rpx;
  }
  
  .nav-header {
    margin-bottom: 20rpx;
  }
  
  .info-card {
    padding: 24rpx;
    margin-bottom: 20rpx;
  }
  
  .info-title {
    font-size: 32rpx;
  }
  
  .dishes-grid {
    grid-template-columns: 1fr;
  }
  
  .dish-image-wrapper {
    height: 180rpx;
  }
}

@media screen and (min-width: 414px) {
  .page-content {
    padding: 128rpx 32rpx 48rpx;
  }
  
  .nav-header {
    margin-bottom: 28rpx;
  }
  
  .info-card {
    padding: 32rpx;
    margin-bottom: 28rpx;
  }
  
  .info-title {
    font-size: 40rpx;
  }
  
  .dishes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dish-image-wrapper {
    height: 220rpx;
  }
}

@media screen and (min-width: 768px) {
  .dishes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.loading-page,
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16rpx;
}

.loading-icon,
.error-icon {
  font-size: 80rpx;
}

.loading-text,
.error-text {
  font-size: 28rpx;
  color: #991B1B;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
}

.nav-icon {
  font-size: 36rpx;
  color: #DC2626;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
}

.nav-placeholder {
  width: 72rpx;
}

.info-card {
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.info-title {
  font-size: 36rpx;
  color: #450A0A;
  font-weight: 700;
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.status-icon {
  font-size: 24rpx;
}

.status-text {
  font-size: 22rpx;
}

.status-plain {
  background: rgba(220, 38, 38, 0.1);
  color: #B91C1C;
}

.status-active {
  background: #DC2626;
  color: #fff;
}

.status-done {
  background: rgba(22, 163, 74, 0.14);
  color: #16A34A;
}

.info-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-icon {
  font-size: 28rpx;
}

.meta-text {
  font-size: 26rpx;
  color: #991B1B;
}

.host-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn::after {
  border: none;
}

.action-btn.primary {
  background: #DC2626;
  color: #fff;
}

.action-btn.success {
  background: #16A34A;
  color: #fff;
}

.action-btn.neutral {
  background: #991B1B;
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
}

.top-dishes-card {
  background: linear-gradient(135deg, #fffdf9 0%, #fef7ed 100%);
  border: 2rpx solid rgba(220, 38, 38, 0.3);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
}

.card-header {
  margin-bottom: 20rpx;
}

.card-title {
  display: block;
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.card-subtitle {
  display: block;
  font-size: 24rpx;
  color: #991B1B;
}

.top-dishes-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.top-dish-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  gap: 16rpx;
}

.top-rank {
  font-size: 32rpx;
  font-weight: 700;
  color: #991B1B;
  min-width: 48rpx;
}

.top-rank.top-1 {
  color: #DC2626;
}

.top-name {
  flex: 1;
  font-size: 26rpx;
  color: #450A0A;
  font-weight: 600;
}

.top-votes {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.votes-count {
  font-size: 28rpx;
  color: #DC2626;
  font-weight: 700;
}

.votes-label {
  font-size: 22rpx;
  color: #991B1B;
}

.dishes-section {
  margin-bottom: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.section-subtitle {
  display: block;
  font-size: 24rpx;
  color: #991B1B;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 32rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-title {
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
}

.dishes-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.category-title {
  padding: 8rpx 24rpx;
  background: rgba(220, 38, 38, 0.1);
  color: #B91C1C;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 999rpx;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.dish-card {
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.07);
}

.dish-image-wrapper {
  position: relative;
  height: 200rpx;
}

.dish-image {
  width: 100%;
  height: 100%;
}

.dish-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(47, 36, 28, 0.8) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16rpx;
}

.dish-name {
  display: block;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.dish-rank {
  display: inline-block;
  padding: 4rpx 12rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 999rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
}

.dish-content {
  padding: 16rpx;
}

.dish-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(220, 38, 38, 0.12);
  border: none;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #DC2626;
  transition: all 0.3s ease;
}

.vote-btn::after {
  border: none;
}

.vote-btn.voted {
  background: #DC2626;
  color: #fff;
}

.vote-btn.disabled {
  opacity: 0.5;
}

.vote-icon {
  font-size: 24rpx;
}

.vote-text {
  font-size: 24rpx;
}

.vote-count {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.vote-fire {
  font-size: 24rpx;
}

.vote-number {
  font-size: 26rpx;
  color: #450A0A;
  font-weight: 600;
}

.popularity-bar {
  margin-top: 8rpx;
}

.popularity-track {
  height: 6rpx;
  background: rgba(220, 38, 38, 0.12);
  border-radius: 999rpx;
  overflow: hidden;
}

.popularity-fill {
  height: 100%;
  background: #DC2626;
  border-radius: 999rpx;
  transition: width 1s ease-out;
}

.invite-card {
  background: #DC2626;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.3);
}

.invite-header {
  margin-bottom: 20rpx;
}

.invite-title {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.invite-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.invite-link-box {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  word-break: break-all;
}

.invite-link {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}

.invite-btn {
  width: 100%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #DC2626;
  transition: all 0.3s ease;
}

.invite-btn::after {
  border: none;
}

.invite-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 28rpx;
}

.billing-card {
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.billing-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.billing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #FEE2E2;
}

.billing-row:last-child {
  border-bottom: none;
}

.billing-label {
  font-size: 26rpx;
  color: #7F1D1D;
}

.billing-value {
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
}

.billing-value.highlight {
  color: #DC2626;
  font-size: 32rpx;
}

.billing-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #7F1D1D;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(47, 36, 28, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 32rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  display: block;
  font-size: 36rpx;
  color: #450A0A;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.modal-desc {
  display: block;
  font-size: 24rpx;
  color: #7F1D1D;
  margin-bottom: 24rpx;
}

.form-field {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #991B1B;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #450A0A;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #450A0A;
}

.form-error {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #DC2626;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-btn::after {
  border: none;
}

.modal-btn.primary {
  background: #DC2626;
  color: #fff;
}

.modal-btn.secondary {
  background: #FEF2F2;
  color: #991B1B;
}

.modal-btn:active {
  transform: scale(0.98);
}
</style>
