<script setup lang="ts">
</script>

<template>
  <view class="container">
    <scroll-view class="content" scroll-y="true">
      <view class="section">
        <text class="title">用户协议</text>
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
