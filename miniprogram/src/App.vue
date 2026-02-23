<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { createPinia } from 'pinia';

const pinia = createPinia();

onLaunch(() => {
  console.log('App Launch');
});
</script>

<style>
/* 导入微信小程序兼容样式 */
@import './styles/wechat-compatible.css';

/* 兼容旧的mp-前缀类 */
.mp-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-top: calc(var(--status-bar-height, 44rpx) + 100rpx);
}

/* 全局自定义导航栏样式 */
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

.mp-shell {
  padding: var(--space-lg) var(--space-md) var(--space-xl);
}

.mp-header {
  margin-bottom: var(--space-lg);
}

.mp-title {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.mp-subtitle {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-secondary);
}

.mp-card {
  background: var(--bg-surface);
  border: 2rpx solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
}

.mp-field {
  margin-bottom: var(--space-lg);
}

.mp-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}

.mp-input {
  width: 100%;
  height: 88rpx;
  background: var(--bg-surface);
  border: 2rpx solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0 var(--space-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.mp-input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4rpx rgba(154, 91, 51, 0.1);
}

.mp-primary-btn {
  height: 92rpx;
  border: none;
  border-radius: var(--radius-lg);
  background: var(--brand-primary);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.mp-primary-btn::after {
  border: none;
}

.mp-primary-btn:active {
  background: var(--brand-primary-dark);
  transform: scale(0.98);
}

.mp-secondary-btn {
  height: 88rpx;
  border: 2rpx solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
}

.mp-secondary-btn::after {
  border: none;
}

.mp-secondary-btn:active {
  background: var(--bg-soft);
  transform: scale(0.98);
}

.mp-danger-btn {
  height: 88rpx;
  border: none;
  border-radius: var(--radius-lg);
  background: rgba(191, 75, 62, 0.12);
  color: var(--danger);
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
}

.mp-danger-btn::after {
  border: none;
}

.mp-danger-btn:active {
  background: rgba(191, 75, 62, 0.2);
  transform: scale(0.98);
}

.mp-empty {
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
}

.mp-empty-title {
  display: block;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.mp-empty-desc {
  display: block;
  margin-top: var(--space-xs);
  color: var(--text-tertiary);
  font-size: var(--font-size-md);
}

.mp-helper-text {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--danger);
}
</style>
