<script setup lang="ts">
</script>

<template>
  <view class="container">
    <scroll-view class="content" scroll-y="true">
      <view class="section">
        <text class="title">隐私政策</text>
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
.container {
  min-height: 100vh;
  background: white;
  padding: 30rpx;
}

.content {
  height: 100vh;
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
