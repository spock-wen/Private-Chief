<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { createInvitation, getFamilyMembers, removeFamilyMember, getInvitations } from '@/api/families';
import type { FamilyInvitation } from '@/types';

const familyStore = useFamilyStore();
const loadingInvite = ref(false);
const inviteCode = ref('');
const loadingMembers = ref(false);
const members = ref<any[]>([]);
const loadingInvitations = ref(false);
const invitations = ref<FamilyInvitation[]>([]);
const isOwner = computed(() => familyStore.currentFamily?.role === 'OWNER');

function goToBindPhone() {
  uni.navigateTo({ url: '/pages/profile/bind-phone' });
}

function goToBindWechat() {
  uni.navigateTo({ url: '/pages/profile/bind-wechat' });
}

async function handleGenerateInviteCode() {
  if (!familyStore.currentFamily?.id) {
    uni.showToast({
      title: '请先选择家庭',
      icon: 'none'
    });
    return;
  }

  loadingInvite.value = true;
  try {
    const res: any = await createInvitation(familyStore.currentFamily.id, {});
    inviteCode.value = res?.inviteCode || res?.code || '';

    if (!inviteCode.value) {
      throw new Error('邀请码生成失败');
    }

    uni.setClipboardData({
      data: inviteCode.value,
      success: () => {
        uni.showToast({
          title: '邀请码已复制',
          icon: 'success'
        });
      }
    });
    await fetchInvitations();
  } catch (error: any) {
    console.error('生成邀请码失败', error);
    uni.showToast({
      title: error?.message || '生成失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loadingInvite.value = false;
  }
}

async function fetchInvitations() {
  if (!familyStore.currentFamily?.id) {
    invitations.value = [];
    return;
  }
  loadingInvitations.value = true;
  try {
    const data = await getInvitations(familyStore.currentFamily.id);
    invitations.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取邀请码列表失败', error);
    uni.showToast({
      title: '获取邀请码失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loadingInvitations.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function fetchMembers() {
  if (!familyStore.currentFamily?.id) {
    members.value = [];
    return;
  }

  loadingMembers.value = true;
  try {
    members.value = await getFamilyMembers(familyStore.currentFamily.id);
  } catch (error) {
    console.error('获取成员列表失败', error);
    uni.showToast({
      title: '获取成员失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loadingMembers.value = false;
  }
}

function handleRemoveMember(memberId: string) {
  if (!familyStore.currentFamily?.id) return;
  uni.showModal({
    title: '移除成员',
    content: '确定要移除此管理员吗？',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await removeFamilyMember(familyStore.currentFamily!.id, memberId);
        uni.showToast({
          title: '已移除',
          icon: 'success'
        });
        await fetchMembers();
      } catch (error: any) {
        console.error('移除成员失败', error);
        uni.showToast({
          title: error?.message || '移除失败，请检查网络后重试',
          icon: 'none'
        });
      }
    }
  });
}

onMounted(fetchMembers);
watch(() => familyStore.currentFamily?.id, fetchMembers);
onMounted(fetchInvitations);
watch(() => familyStore.currentFamily?.id, fetchInvitations);
</script>

<template>
  <view class="family-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-back" @tap="uni.navigateBack({ delta: 1 })">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">家庭设置</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <view class="page-content">
      <view class="hero-section">
        <view class="hero-content">
          <view class="logo-container">
            <view class="logo-badge">
              <text class="logo-text">SpockChef</text>
            </view>
          </view>
          <text class="hero-subtitle">管理您的家庭聚餐团队</text>
        </view>
      </view>

      <view v-if="familyStore.currentFamily" class="info-section">
        <text class="section-heading">家庭信息</text>
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">家庭名称</text>
            <text class="info-value">{{ familyStore.currentFamily.name }}</text>
          </view>
          <view v-if="familyStore.currentFamily.description" class="info-item">
            <text class="info-label">家庭描述</text>
            <text class="info-value">{{ familyStore.currentFamily.description }}</text>
          </view>
        </view>
      </view>

      <view class="member-section">
        <text class="section-heading">成员管理</text>
        <view class="action-buttons">
          <button class="action-button primary" @tap="goToBindPhone">
            <view class="button-content">
              <text class="button-icon">📱</text>
              <text class="button-text">绑定手机号</text>
            </view>
          </button>
          <button class="action-button secondary" @tap="goToBindWechat">
            <view class="button-content">
              <text class="button-icon">💬</text>
              <text class="button-text">绑定微信</text>
            </view>
          </button>
        </view>

        <view v-if="loadingMembers" class="loading-indicator">
          <text class="loading-text">正在加载成员...</text>
        </view>
        <view v-else-if="members.length === 0" class="empty-state">
          <text class="empty-icon">👥</text>
          <text class="empty-text">当前家庭暂无成员数据</text>
        </view>
        <view v-else class="member-list">
          <view v-for="member in members" :key="member.id" class="member-item">
            <view class="member-avatar">
              <text class="avatar-text">{{ (member.user?.nickname || '未命名用户').charAt(0).toUpperCase() }}</text>
            </view>
            <view class="member-details">
              <text class="member-name">{{ member.user?.nickname || '未命名用户' }}</text>
              <text class="member-role">{{ member.role === 'OWNER' ? '家庭主人' : '管理员' }}</text>
            </view>
            <button
              v-if="isOwner && member.role !== 'OWNER'"
              class="remove-button"
              @tap="handleRemoveMember(member.id)"
            >
              <text class="remove-icon">×</text>
            </button>
          </view>
        </view>
      </view>

      <view class="invite-section">
        <text class="section-heading">邀请成员</text>
        <view v-if="isOwner">
          <button class="invite-button" :loading="loadingInvite" :disabled="loadingInvite" @tap="handleGenerateInviteCode">
            <view class="button-content">
              <text class="button-icon">🎁</text>
              <text class="button-text">{{ loadingInvite ? '生成中...' : '生成邀请码并复制' }}</text>
            </view>
          </button>
          
          <view v-if="inviteCode" class="invite-code-display">
            <text class="code-label">当前邀请码：</text>
            <text class="code-value">{{ inviteCode }}</text>
          </view>

          <view class="invite-history">
            <view class="history-header">
              <text class="history-title">邀请码记录</text>
              <button class="refresh-button" @tap="fetchInvitations">
                <text class="refresh-icon">🔄</text>
                <text class="refresh-text">刷新</text>
              </button>
            </view>

            <view v-if="loadingInvitations" class="loading-indicator">
              <text class="loading-text">正在加载邀请码记录...</text>
            </view>
            <view v-else-if="!invitations.length" class="empty-state">
              <text class="empty-icon">📭</text>
              <text class="empty-text">暂无邀请码记录</text>
            </view>
            <view v-else class="invitation-list">
              <view v-for="item in invitations" :key="item.id" class="invitation-item">
                <view class="invitation-code">
                  <text class="code-text">{{ item.inviteCode }}</text>
                </view>
                <view class="invitation-meta">
                  <text class="meta-expiry">有效期至：{{ formatDate(item.expiresAt) }}</text>
                  <text class="meta-usage">已用 {{ item.usedCount }}/{{ item.maxUses }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="restricted-access">
          <text class="restricted-icon">🔒</text>
          <text class="restricted-text">仅家庭主人可生成邀请码</text>
          <text class="restricted-hint">请联系家庭主人邀请您加入管理</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 全局样式 */
.family-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

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

.page-content {
  padding: calc(var(--status-bar-height, 44rpx) + 100rpx + 24rpx) 24rpx 24rpx;
}

/* 导航栏 */
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding-top: 16rpx;
}

.nav-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.1);
  transition: all 0.2s ease;
}

.nav-btn:active {
  background: rgba(220, 38, 38, 0.2);
  transform: scale(0.95);
}

.nav-icon {
  font-size: 28rpx;
  color: #DC2626;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #450A0A;
}

.nav-placeholder {
  width: 48rpx;
}

/* 英雄区域 */
.hero-section {
  margin-bottom: 32rpx;
}

.hero-content {
  text-align: center;
  padding: 32rpx 0;
}

.logo-container {
  margin-bottom: 16rpx;
}

.logo-badge {
  width: 160rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4rpx 16rpx rgba(220, 38, 38, 0.3);
}

.logo-text {
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.hero-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #450A0A;
  margin-bottom: 8rpx;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 24rpx;
  color: #991B1B;
  line-height: 1.4;
}

/* 通用部分样式 */
.section-heading {
  font-size: 28rpx;
  font-weight: 600;
  color: #450A0A;
  margin-bottom: 16rpx;
  line-height: 1.3;
}

/* 信息部分 */
.info-section {
  margin-bottom: 32rpx;
}

.info-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(220, 38, 38, 0.08);
  border: 1rpx solid #FECACA;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #FEE2E2;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 24rpx;
  color: #991B1B;
  font-weight: 500;
}

.info-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #450A0A;
}

/* 成员部分 */
.member-section {
  margin-bottom: 32rpx;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  border: none;
  transition: all 0.2s ease;
}

.action-button::after {
  border: none;
}

.action-button.primary {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
}

.action-button.secondary {
  background: white;
  color: #DC2626;
  border: 1rpx solid #FECACA;
}

.action-button:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(220, 38, 38, 0.2);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.button-icon {
  font-size: 24rpx;
}

.button-text {
  font-size: 22rpx;
  font-weight: 600;
}

/* 成员列表 */
.member-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: white;
  border-radius: 12rpx;
  border: 1rpx solid #FECACA;
  box-shadow: 0 1rpx 6rpx rgba(220, 38, 38, 0.05);
}

.member-avatar {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.member-details {
  flex: 1;
}

.member-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #450A0A;
  margin-bottom: 4rpx;
}

.member-role {
  font-size: 20rpx;
  color: #991B1B;
  opacity: 0.9;
}

.remove-button {
  width: 48rpx;
  height: 48rpx;
  background: rgba(220, 38, 38, 0.1);
  color: #DC2626;
  border: none;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-button::after {
  border: none;
}

.remove-button:active {
  background: rgba(220, 38, 38, 0.2);
  transform: scale(0.95);
}

.remove-icon {
  font-size: 24rpx;
  font-weight: bold;
}

/* 邀请部分 */
.invite-section {
  margin-bottom: 32rpx;
}

.invite-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  transition: all 0.2s ease;
}

.invite-button::after {
  border: none;
}

.invite-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.3);
}

.invite-button:disabled {
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

/* 邀请码显示 */
.invite-code-display {
  background: #FEF2F2;
  border: 1rpx solid #FECACA;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.code-label {
  font-size: 22rpx;
  color: #991B1B;
  font-weight: 500;
}

.code-value {
  font-size: 24rpx;
  font-weight: 700;
  color: #DC2626;
  margin-left: 8rpx;
  font-family: 'Courier New', monospace;
  letter-spacing: 1rpx;
}

/* 邀请历史 */
.invite-history {
  margin-top: 24rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.history-title {
  font-size: 22rpx;
  font-weight: 600;
  color: #450A0A;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FEF2F2;
  color: #DC2626;
  border: 1rpx solid #FECACA;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  transition: all 0.2s ease;
}

.refresh-button::after {
  border: none;
}

.refresh-button:active {
  background: #FEE2E2;
  transform: scale(0.95);
}

.refresh-icon {
  font-size: 16rpx;
}

.refresh-text {
  font-size: 20rpx;
  font-weight: 500;
}

/* 邀请列表 */
.invitation-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.invitation-item {
  background: white;
  border: 1rpx solid #FECACA;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 1rpx 6rpx rgba(220, 38, 38, 0.05);
}

.invitation-code {
  margin-bottom: 12rpx;
}

.code-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #450A0A;
  font-family: 'Courier New', monospace;
  letter-spacing: 1rpx;
}

.invitation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-expiry {
  font-size: 20rpx;
  color: #991B1B;
  opacity: 0.8;
}

.meta-usage {
  font-size: 20rpx;
  color: #DC2626;
  font-weight: 500;
}

/* 受限访问 */
.restricted-access {
  background: #FEF2F2;
  border: 1rpx solid #FECACA;
  border-radius: 12rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  margin-top: 16rpx;
}

.restricted-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
  display: block;
}

.restricted-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #450A0A;
  margin-bottom: 8rpx;
  line-height: 1.3;
}

.restricted-hint {
  font-size: 20rpx;
  color: #991B1B;
  opacity: 0.8;
  line-height: 1.4;
}

/* 加载状态 */
.loading-indicator {
  text-align: center;
  padding: 40rpx 0;
  color: #991B1B;
  font-size: 22rpx;
}

.loading-text {
  line-height: 1.4;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48rpx 24rpx;
  background: #FEF2F2;
  border: 1rpx solid #FECACA;
  border-radius: 12rpx;
  margin-top: 16rpx;
}

.empty-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
  display: block;
}

.empty-text {
  font-size: 22rpx;
  color: #991B1B;
  line-height: 1.4;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 375rpx) {
  .page-content {
    padding: 172rpx 16rpx 16rpx;
  }
  
  .hero-title {
    font-size: 32rpx;
  }
  
  .hero-subtitle {
    font-size: 22rpx;
  }
  
  .action-buttons {
    gap: 12rpx;
  }
  
  .action-button {
    padding: 16rpx;
  }
  
  .button-text {
    font-size: 20rpx;
  }
}

@media (min-width: 768rpx) {
  .page-content {
    max-width: 600rpx;
    margin: 0 auto;
  }
  
  .action-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
