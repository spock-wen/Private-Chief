<script setup lang="ts">
import { ref } from 'vue';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { createFamily, joinFamily } from '@/api/families';

const familyStore = useFamilyStore();
const familyName = ref('');
const inviteCode = ref('');
const mode = ref<'create' | 'join'>('create');
const loading = ref(false);

async function handleCreateFamily() {
  if (!familyName.value.trim()) {
    uni.showToast({
      title: '请输入家庭名称',
      icon: 'none'
    });
    return;
  }

  loading.value = true;
  try {
    const family = await createFamily({ name: familyName.value });
    familyStore.addFamily(family);
    uni.switchTab({ url: '/pages/index/index' });
  } catch (error) {
    console.error('创建家庭失败', error);
    uni.showToast({
      title: '创建失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

async function handleJoinFamily() {
  const code = inviteCode.value.trim();
  if (!code) {
    uni.showToast({
      title: '请输入邀请码',
      icon: 'none'
    });
    return;
  }

  loading.value = true;
  try {
    await joinFamily(code);
    await familyStore.fetchFamilies();
    uni.showToast({
      title: '加入成功',
      icon: 'success'
    });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 300);
  } catch (error: any) {
    console.error('加入家庭失败', error);
    uni.showToast({
      title: error?.message || '加入失败，请检查网络后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <view class="mp-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-title">创建或加入家庭</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="mp-shell">
      <view class="mp-header">
        <text class="mp-subtitle">完成这一步后，即可开始发起饭桌和管理菜单。</text>
      </view>

      <view class="mp-card form-card">
        <view class="mode-switch">
          <view
            class="mode-item"
            :class="{ active: mode === 'create' }"
            @click="mode = 'create'"
          >
            创建家庭
          </view>
          <view
            class="mode-item"
            :class="{ active: mode === 'join' }"
            @click="mode = 'join'"
          >
            加入家庭
          </view>
        </view>

        <view class="mp-field" v-if="mode === 'create'">
          <text class="mp-label">家庭名称</text>
          <input 
            v-model="familyName"
            class="mp-input" 
            placeholder="例如：张家私厨"
            maxlength="20"
          />
        </view>
        <view class="mp-field" v-else>
          <text class="mp-label">邀请码</text>
          <input 
            v-model="inviteCode"
            class="mp-input" 
            placeholder="请输入家庭邀请码"
            maxlength="32"
          />
        </view>

        <button 
          class="mp-primary-btn"
          :loading="loading"
          :disabled="loading"
          @click="mode === 'create' ? handleCreateFamily() : handleJoinFamily()"
        >
          {{ mode === 'create' ? '创建家庭' : '加入家庭' }}
        </button>
      </view>

      <view class="tips">
        <text class="tip-title">温馨提示</text>
        <text class="tip-line">- 创建家庭后你将成为家庭管理员</text>
        <text class="tip-line">- 邀请码由现有家庭成员提供</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.form-card {
  padding: 32rpx;
  margin-top: 8rpx;
}

.welcome-mark {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(220, 38, 38, 0.1);
  color: #B91C1C;
  font-size: 22rpx;
  font-weight: 600;
  margin-bottom: 18rpx;
}

.mode-switch {
  display: flex;
  background: #FEF2F2;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 22rpx;
}

.mode-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #450A0A;
  border-radius: 12rpx;
}

.mode-item.active {
  background: #fff;
  color: #DC2626;
  font-weight: 600;
}

.tips {
  margin-top: 26rpx;
  padding: 36rpx;
  border-radius: 16rpx;
  background: #FEF2F2;
}

.tip-title {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #450A0A;
  font-weight: 600;
}

.tip-line {
  display: block;
  font-size: 24rpx;
  color: #991B1B;
  line-height: 1.6;
}
</style>
