// 任务卡片组件
<script setup >
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    pending: "status-pending",
    executing: "status-executing",
    completed: "status-completed",
    cancelled: "status-cancelled",
  };
  return classMap[status] || "";
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: "待执行",
    executing: "执行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return textMap[status] || status;
};

// 获取时间标签
const getTimeLabel = (status) => {
  return status === "completed" ? "完成时间" : "执行时间";
};

// 获取时长标签
const getDurationLabel = (status) => {
  return status === "completed" ? "实际总耗时" : "预计总耗时";
};
</script>

<template>
  <view class="task-card">
    <!-- 卡片头部 -->
    <view class="card-header">
      <view class="header-left">
        <text class="elder-name">{{ task.elderName }}</text>
        <text v-if="task.orderNo" class="order-no"
          >任务单{{ task.orderNo }}</text
        >
      </view>
      <view class="status-tag" :class="getStatusClass(task.status)">
        {{ getStatusText(task.status) }}
      </view>
    </view>

    <!-- 服务项目列表 -->
    <view class="service-list">
      <view
        class="service-item"
        v-for="(service, index) in task.services"
        :key="index"
      >
        <text class="service-name">{{ service.name }}</text>
        <text class="service-duration">{{ service.duration }} 分钟</text>
      </view>
    </view>

    <!-- 卡片底部信息 -->
    <view class="card-footer">
      <view class="time-info">
        <text class="time-label">{{ getTimeLabel(task.status) }}</text>
        <text class="time-value">{{ task.executeTime }}</text>
      </view>
      <view class="duration-info">
        <text class="duration-label">{{ getDurationLabel(task.status) }}</text>
        <text class="duration-value">{{ task.totalDuration }} 分钟</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.task-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  max-width: 640rpx;
  margin-left: auto;
  margin-right: auto;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .header-left {
      display: flex;
      align-items: center;

      .elder-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-right: 16rpx;
      }

      .order-no {
        font-size: 24rpx;
        color: #999;
        background-color: #f5f5f5;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }

    .status-tag {
      font-size: 24rpx;
      padding: 6rpx 20rpx;
      border-radius: 30rpx;

      &.status-pending {
        background-color: #fff3e0;
        color: #ff9800;
      }

      &.status-executing {
        background-color: #e3f2fd;
        color: #2196f3;
      }

      &.status-completed {
        background-color: #e8f5e9;
        color: #4caf50;
      }

      &.status-cancelled {
        background-color: #f5f5f5;
        color: #999;
      }
    }
  }

  .service-list {
    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .service-name {
        font-size: 28rpx;
        color: #333;
      }

      .service-duration {
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;

    .time-info,
    .duration-info {
      display: flex;
      align-items: center;

      .time-label,
      .duration-label {
        font-size: 24rpx;
        color: #999;
        margin-right: 10rpx;
      }

      .time-value,
      .duration-value {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>
