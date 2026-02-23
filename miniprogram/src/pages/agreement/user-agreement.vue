<script setup lang="ts">
</script>

<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-back" @tap="uni.navigateBack({ delta: 1 })">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">用户协议</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y="true">
      <view class="section">
        <text class="update-date">更新日期：2026年2月18日</text>
      </view>

      <view class="section">
        <text class="section-title">一、服务条款</text>
        <text class="paragraph">
          欢迎使用私厨助手小程序。在使用本小程序前，请您仔细阅读以下条款。使用本小程序即表示您同意接受这些条款的约束。
        </text>
      </view>

      <view class="section">
        <text class="section-title">二、用户账号</text>
        <text class="paragraph">
          1. 您需要通过微信授权登录才能使用本小程序的完整功能。
        </text>
        <text class="paragraph">
          2. 您应妥善保管自己的账号信息，对账号下的所有行为负责。
        </text>
      </view>

      <view class="section">
        <text class="section-title">三、用户行为规范</text>
        <text class="paragraph">
          您在使用本小程序时，应遵守相关法律法规，不得从事以下行为：
        </text>
        <text class="paragraph">
          1. 发布违法、违规或侵犯他人权益的内容；
        </text>
        <text class="paragraph">
          2. 干扰或破坏本小程序的正常运行；
        </text>
        <text class="paragraph">
          3. 利用本小程序从事任何商业活动。
        </text>
      </view>

      <view class="section">
        <text class="section-title">四、知识产权</text>
        <text class="paragraph">
          本小程序的所有内容（包括但不限于文字、图片、软件等）的知识产权归本小程序所有。
        </text>
      </view>

      <view class="section">
        <text class="section-title">五、免责声明</text>
        <text class="paragraph">
          本小程序按"现状"提供服务，不保证服务一定满足您的要求，也不保证服务不会中断。
        </text>
      </view>

      <view class="section">
        <text class="section-title">六、协议修改</text>
        <text class="paragraph">
          我们有权随时修改本协议，修改后的协议一经公布即代替原协议。
        </text>
      </view>
    </scroll-view>
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
  justify-content: center;
  padding: 0 24rpx 16rpx;
  position: relative;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 24rpx;
  bottom: 16rpx;
}

.nav-back-icon {
  font-size: 36rpx;
  color: white;
}

.nav-title {
  font-size: 30rpx;
  font-weight: 500;
  color: white;
  text-align: center;
  line-height: 1;
  padding-bottom: 4rpx;
}

.nav-right {
  width: 60rpx;
  position: absolute;
  right: 24rpx;
  bottom: 16rpx;
}

.container {
  min-height: 100vh;
  background: white;
  padding-top: calc(var(--status-bar-height, 44rpx) + 100rpx);
}

.content {
  height: calc(100vh - var(--status-bar-height, 44rpx) - 100rpx);
  padding: 32rpx;
  box-sizing: border-box;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  text-align: center;
  margin-bottom: 20rpx;
}

.update-date {
  font-size: 24rpx;
  color: #999;
  display: block;
  text-align: center;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 20rpx;
  color: #333;
}

.paragraph {
  font-size: 28rpx;
  line-height: 1.8;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
  text-align: justify;
}
</style>
