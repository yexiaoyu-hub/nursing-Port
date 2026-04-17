// 服务转交/异常入口公共组件
<script setup lang="ts">
const emit = defineEmits<{
  (e: "abnormal-report"): void;
  (e: "transfer-task"): void;
}>();

// 异常上报
const handleAbnormalReport = () => {
  emit("abnormal-report");
};

// 转交任务
const handleTransferTask = () => {
  emit("transfer-task");
};
</script>

<template>
  <view class="abnormal-section">
    <view class="abnormal-title">服务转交/异常入口</view>
    <view class="abnormal-btns">
      <view class="btn-abnormal" @click="handleAbnormalReport"> 异常上报 </view>
      <view class="btn-abnormal" @click="handleTransferTask"> 转交任务 </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.abnormal-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;

  .abnormal-title {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
  }

  .abnormal-btns {
    display: flex;
    gap: 20rpx;

    .btn-abnormal {
      flex: 1;
      height: 80rpx;
      background-color: #fff;
      border: 2rpx solid #ddd;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #333;
    }
  }
}
</style>
