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
        <text class="nav-title">隐私政策</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <scroll-view class="content" scroll-y="true">
      <view class="section">
        <text class="update-date">更新日期：2026年2月18日</text>
      </view>

      <view class="section">
        <text class="section-title">一、引言</text>
        <text class="paragraph">
          我们非常重视您的个人信息保护。本隐私政策将说明我们如何收集、使用、存储和保护您的个人信息。
        </text>
      </view>

      <view class="section">
        <text class="section-title">二、信息收集</text>
        <text class="paragraph">
          我们可能收集以下信息：
        </text>
        <text class="paragraph">
          1. 微信授权信息：昵称、头像、OpenID；
        </text>
        <text class="paragraph">
          2. 您主动提供的信息：家庭信息、饭桌信息、菜品信息等；
        </text>
        <text class="paragraph">
          3. 设备信息：设备型号、操作系统版本等。
        </text>
      </view>

      <view class="section">
        <text class="section-title">三、信息使用</text>
        <text class="paragraph">
          我们使用收集的信息用于：
        </text>
        <text class="paragraph">
          1. 提供和改进我们的服务；
        </text>
        <text class="paragraph">
          2. 身份验证和安全保障；
        </text>
        <text class="paragraph">
          3. 客户服务和支持。
        </text>
      </view>

      <view class="section">
        <text class="section-title">四、信息存储</text>
        <text class="paragraph">
          我们将在中华人民共和国境内存储和处理您的个人信息。
        </text>
      </view>

      <view class="section">
        <text class="section-title">五、信息共享</text>
        <text class="paragraph">
          除以下情况外，我们不会向第三方共享您的个人信息：
        </text>
        <text class="paragraph">
          1. 获得您的明确同意；
        </text>
        <text class="paragraph">
          2. 法律法规要求或政府机关依法要求。
        </text>
      </view>

      <view class="section">
        <text class="section-title">六、信息保护</text>
        <text class="paragraph">
          我们采取合理的安全措施保护您的个人信息，但请注意，没有任何安全措施是百分之百可靠的。
        </text>
      </view>

      <view class="section">
        <text class="section-title">七、您的权利</text>
        <text class="paragraph">
          您有权访问、更正、删除您的个人信息，以及撤回同意。
        </text>
      </view>

      <view class="section">
        <text class="section-title">八、政策更新</text>
        <text class="paragraph">
          我们可能不时更新本隐私政策，更新后的政策将在本页面公布。
        </text>
      </view>

      <view class="section">
        <text class="section-title">九、联系我们</text>
        <text class="paragraph">
          如有任何问题，请通过小程序内的反馈功能与我们联系。
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
