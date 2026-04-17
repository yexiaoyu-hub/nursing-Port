// 概览标签页组件
<script setup lang="ts">
interface ElderlyInfo {
  id: string;
  name: string;
  gender: string;
  age: number;
  disabilityLevel: string;
  bedNo: string;
  healthStatus: string;
}

const props = defineProps<{
  info: ElderlyInfo;
}>();

const emit = defineEmits<{
  (e: "dial", phone: string): void;
  (e: "history"): void;
  (e: "todayTask"): void;
  (e: "quickSign"): void;
}>();

const handleDial = () => {
  emit("dial", "");
};

const handleHistory = () => {
  emit("history");
};

const handleTodayTask = () => {
  emit("todayTask");
};

const handleQuickSign = () => {
  emit("quickSign");
};
</script>

<template>
  <view class="overview-tab">
    <!-- 基础信息 -->
    <view class="section">
      <view class="section-title">基础信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">编号</text>
          <text class="value">{{ info.id }}</text>
        </view>
        <view class="info-item">
          <text class="label">姓名</text>
          <text class="value">{{ info.name }}</text>
        </view>
        <view class="info-item">
          <text class="label">性别</text>
          <text class="value">{{ info.gender }}</text>
        </view>
        <view class="info-item">
          <text class="label">年龄</text>
          <text class="value">{{ info.age }}岁</text>
        </view>
        <view class="info-item">
          <text class="label">失能等级</text>
          <text class="value">{{ info.disabilityLevel }}</text>
        </view>
        <view class="info-item">
          <text class="label">床位号</text>
          <text class="value">{{ info.bedNo }}</text>
        </view>
        <view class="info-item">
          <text class="label">健康状况</text>
          <view class="tag green">{{ info.healthStatus }}</view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="btn primary" @click="handleDial">一键拨号</view>
      <view class="btn default" @click="handleHistory">历史记录</view>
    </view>

    <!-- 今日服务入口 -->
    <view class="section">
      <view class="section-title">今日服务入口</view>
      <view class="service-buttons">
        <view class="btn primary" @click="handleTodayTask">查看今日任务</view>
        <view class="btn default" @click="handleQuickSign">快捷签到</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.overview-tab {
  padding: 20rpx 30rpx;

  .section {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #0f172a14;

    .section-title {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
  }

  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
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

      .tag {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;

        &.green {
          background-color: #d0f9d9;
          color: #52c41a;
        }
      }
    }
  }

  .action-buttons,
  .service-buttons {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;

    .btn {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;
      font-size: 30rpx;

      &.primary {
        background: #1677ff;
        color: #fff;
      }

      &.default {
        background-color: #fff;
        color: #333;
        border: 2rpx solid #eaeaea;
      }
    }
  }
}
</style>
