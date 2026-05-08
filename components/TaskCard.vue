// 任务卡片组件
<script setup >
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

// 点击卡片跳转到任务详情
const goToDetail = () => {
  uni.navigateTo({
    url: `/pages/task/taskDetails?id=${props.task.id}`,
  });
};

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
  <view class="task-card" @click="goToDetail">
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
      <view class="duration-compare">
        <text class="duration-compare-label">{{
          getDurationLabel(task.status)
        }}</text>
        <text class="duration-compare-value"
          >{{
            task.status === "completed"
              ? task.totalDuration + " / " + (task.orderSerTimes || 0)
              : task.orderSerTimes || 0
          }}
          分钟</text
        >
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
  width: 100%;
  box-sizing: border-box;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    overflow: hidden;
    width: 100%;

    .header-left {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      overflow: hidden;

      .elder-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-right: 16rpx;
        flex-shrink: 0;
      }

      .order-no {
        font-size: 24rpx;
        color: #999;
        background-color: #f5f5f5;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .status-tag {
      font-size: 24rpx;
      padding: 6rpx 20rpx;
      border-radius: 30rpx;
      flex-shrink: 0;
      margin-left: 20rpx;

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
    width: 100%;
    overflow: hidden;

    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      overflow: hidden;

      &:last-child {
        border-bottom: none;
      }

      .service-name {
        font-size: 28rpx;
        color: #333;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 20rpx;
      }

      .service-duration {
        font-size: 26rpx;
        color: #666;
        flex-shrink: 0;
        white-space: nowrap;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;
    overflow: hidden;
    width: 100%;

    .time-info {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      overflow: hidden;

      .time-label {
        font-size: 24rpx;
        color: #999;
        margin-right: 10rpx;
        flex-shrink: 0;
      }

      .time-value {
        font-size: 24rpx;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .duration-compare {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-left: 20rpx;

      .duration-compare-label {
        font-size: 24rpx;
        color: #999;
        margin-right: 6rpx;
        white-space: nowrap;
      }

      .duration-compare-value {
        font-size: 24rpx;
        color: #666;
        white-space: nowrap;
      }

      .duration-compare-separator {
        font-size: 24rpx;
        color: #999;
        margin: 0 10rpx;
      }
    }
  }
}
</style>
