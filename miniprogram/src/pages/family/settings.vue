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
  <view class="container">
    <view class="header">
      <text class="title">家庭设置</text>
    </view>

    <view v-if="familyStore.currentFamily" class="family-info">
      <view class="info-item">
        <text class="label">家庭名称</text>
        <text class="value">{{ familyStore.currentFamily.name }}</text>
      </view>
      <view v-if="familyStore.currentFamily.description" class="info-item">
        <text class="label">家庭描述</text>
        <text class="value">{{ familyStore.currentFamily.description }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">成员管理</view>
      <view class="action-list">
        <button class="action-btn" @click="goToBindPhone">绑定手机号</button>
        <button class="action-btn secondary" @click="goToBindWechat">绑定微信</button>
      </view>
      <view v-if="loadingMembers" class="helper-tip">正在加载成员...</view>
      <view v-else-if="members.length === 0" class="helper-tip">当前家庭暂无成员数据。</view>
      <view v-else class="member-list">
        <view v-for="member in members" :key="member.id" class="member-item">
          <view class="member-main">
            <text class="member-name">{{ member.user?.nickname || '未命名用户' }}</text>
            <text class="member-role">{{ member.role === 'OWNER' ? '家庭主人' : '管理员' }}</text>
          </view>
          <button
            v-if="isOwner && member.role !== 'OWNER'"
            class="remove-btn"
            size="mini"
            @click="handleRemoveMember(member.id)"
          >
            移除
          </button>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">邀请成员</view>
      <view v-if="isOwner">
        <button class="action-btn" :loading="loadingInvite" :disabled="loadingInvite" @click="handleGenerateInviteCode">
          {{ loadingInvite ? '生成中...' : '生成邀请码并复制' }}
        </button>
        <view v-if="inviteCode" class="invite-code">
          当前邀请码：{{ inviteCode }}
        </view>
        <view class="invite-header">
          <text class="helper-tip no-margin">邀请码记录</text>
          <button class="refresh-btn" size="mini" @click="fetchInvitations">刷新</button>
        </view>
        <view v-if="loadingInvitations" class="helper-tip">正在加载邀请码记录...</view>
        <view v-else-if="!invitations.length" class="helper-tip">暂无邀请码记录</view>
        <view v-else class="invite-list">
          <view v-for="item in invitations" :key="item.id" class="invite-item">
            <view class="invite-main">
              <text class="invite-code-text">{{ item.inviteCode }}</text>
              <text class="invite-meta">有效期至：{{ formatDate(item.expiresAt) }}</text>
            </view>
            <text class="invite-meta">已用 {{ item.usedCount }}/{{ item.maxUses }}</text>
          </view>
        </view>
      </view>
      <view v-else class="helper-tip">仅家庭主人可生成邀请码，请联系主人邀请您加入管理。</view>
    </view>
  </view>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.family-info {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 40rpx 0;
}

.action-list {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 16rpx;
  background: #D97706;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.action-btn.secondary {
  background: #FFFFFF;
  color: #D97706;
  border: 2rpx solid rgba(217, 119, 6, 0.2);
}

.action-btn::after {
  border: none;
}

.helper-tip {
  margin-top: 20rpx;
  color: #999;
  font-size: 24rpx;
  line-height: 1.6;
}

.no-margin {
  margin-top: 0;
}

.invite-code {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #fff7ed;
  color: #c2410c;
  border-radius: 12rpx;
  font-size: 24rpx;
  word-break: break-all;
}

.member-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #fafafa;
}

.member-main {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.member-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.member-role {
  font-size: 22rpx;
  color: #999;
}

.remove-btn {
  background: #ffe8e8;
  color: #dc2626;
  border: none;
}

.remove-btn::after {
  border: none;
}

.invite-header {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refresh-btn {
  background: #fff7ed;
  color: #c2410c;
  border: none;
}

.refresh-btn::after {
  border: none;
}

.invite-list {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.invite-item {
  padding: 14rpx 16rpx;
  border-radius: 12rpx;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.invite-main {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.invite-code-text {
  font-size: 26rpx;
  color: #7c2d12;
  font-weight: 700;
}

.invite-meta {
  font-size: 22rpx;
  color: #999;
}
</style>
