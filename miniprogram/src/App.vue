<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { createPinia } from 'pinia';

const pinia = createPinia();

onLaunch(() => {
  console.log('App Launch');
});
</script>

<style>
page {
  background-color: #f6f1ea;
  color: #2f241c;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

:root {
  --bg-page: #f6f1ea;
  --bg-surface: #fffdf9;
  --bg-soft: #f2ebe1;
  --brand-500: #9a5b33;
  --brand-600: #7f4724;
  --text-900: #2f241c;
  --text-700: #5a4b41;
  --text-500: #87786c;
  --border-200: #e6ddd2;
  --ok-500: #2f7d4f;
  --warn-500: #a8692a;
  --danger-500: #bf4b3e;
  --radius-lg: 24rpx;
  --radius-pill: 999rpx;
  --shadow-soft: 0 8rpx 28rpx rgba(57, 43, 33, 0.08);
}

.mp-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.mp-shell {
  padding: 28rpx 28rpx 40rpx;
}

.mp-header {
  margin-bottom: 28rpx;
}

.mp-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-900);
}

.mp-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: var(--text-500);
}

.mp-card {
  background: var(--bg-surface);
  border: 2rpx solid var(--border-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.mp-field {
  margin-bottom: 24rpx;
}

.mp-label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 26rpx;
  color: var(--text-700);
  font-weight: 600;
}

.mp-input {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border: 2rpx solid var(--border-200);
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: var(--text-900);
}

.mp-input:focus {
  border-color: rgba(154, 91, 51, 0.45);
}

.mp-primary-btn {
  height: 92rpx;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--brand-500);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.mp-primary-btn::after {
  border: none;
}

.mp-secondary-btn {
  height: 88rpx;
  border: 2rpx solid var(--border-200);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--text-700);
  font-size: 28rpx;
}

.mp-secondary-btn::after {
  border: none;
}

.mp-danger-btn {
  height: 88rpx;
  border: none;
  border-radius: var(--radius-pill);
  background: rgba(191, 75, 62, 0.12);
  color: var(--danger-500);
  font-size: 28rpx;
}

.mp-danger-btn::after {
  border: none;
}

.mp-empty {
  padding: 88rpx 32rpx;
  text-align: center;
}

.mp-empty-title {
  display: block;
  font-size: 32rpx;
  color: var(--text-900);
  font-weight: 600;
}

.mp-empty-desc {
  display: block;
  margin-top: 10rpx;
  color: var(--text-500);
  font-size: 26rpx;
}

.mp-helper-text {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--danger-500);
}
</style>
