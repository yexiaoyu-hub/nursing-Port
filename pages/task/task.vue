<template>
  <view class="task-page">
    <!-- 标签栏 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
      <view class="calendar-icon" @click="openCalendar">
        <uni-icons type="calendar" size="20" color="#666"></uni-icons>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box">
        <uni-icons type="search" size="24" color="#999"></uni-icons>
        <input
          class="search-input"
          type="text"
          placeholder="搜索老人/项目/工单号"
          v-model="searchKeyword"
          confirm-type="search"
        />
        <uni-icons
          v-if="searchKeyword"
          type="clear"
          size="24"
          color="#999"
          @click="searchKeyword = ''"
        ></uni-icons>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view class="task-list" scroll-y>
      <view class="task-card" v-for="task in filteredTasks" :key="task.id">
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
            <text class="duration-label">{{
              getDurationLabel(task.status)
            }}</text>
            <text class="duration-value">{{ task.totalDuration }} 分钟</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredTasks.length === 0" class="empty-state">
        <text>暂无任务</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

// 顶部标签
const tabs = [
  { label: "全部", value: "all" },
  { label: "待执行", value: "pending" },
  { label: "执行中", value: "executing" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "cancelled" },
];

// 当前选中的标签
const currentTab = ref("all");
const currentBottomTab = ref("task");
const searchKeyword = ref("");

// 模拟任务数据
const taskList = ref([
  {
    id: 1,
    elderName: "张三",
    orderNo: "",
    status: "pending",
    services: [
      { name: "翻身护理", duration: 40 },
      { name: "喂食照料", duration: 40 },
      { name: "康复训练", duration: 40 },
    ],
    executeTime: "2025-11-12 15:35",
    totalDuration: 40,
  },
  {
    id: 2,
    elderName: "张三",
    orderNo: "CHxxxx",
    status: "executing",
    services: [
      { name: "翻身护理", duration: 40 },
      { name: "喂食照料", duration: 40 },
      { name: "康复训练", duration: 40 },
    ],
    executeTime: "2025-11-12 15:35",
    totalDuration: 40,
  },
  {
    id: 3,
    elderName: "张三",
    orderNo: "CHxxxx",
    status: "completed",
    services: [
      { name: "翻身护理", duration: 40 },
      { name: "喂食照料", duration: 40 },
      { name: "康复训练", duration: 40 },
    ],
    executeTime: "2025-11-12 15:35:15",
    totalDuration: 40,
  },
]);

// 根据当前标签和搜索关键词过滤任务
const filteredTasks = computed(() => {
  let result = taskList.value;

  // 按状态过滤
  if (currentTab.value !== "all") {
    result = result.filter((task) => task.status === currentTab.value);
  }

  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (task) =>
        task.elderName.includes(keyword) ||
        task.orderNo.toLowerCase().includes(keyword) ||
        task.services.some((s) => s.name.includes(keyword))
    );
  }

  return result;
});

// 切换标签
const switchTab = (value) => {
  currentTab.value = value;
};

// 打开日历
const openCalendar = () => {
  uni.showToast({
    title: "日历功能开发中",
    icon: "none",
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

<style lang="scss" scoped>
.task-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

// 标签栏
.tab-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 10rpx 0;
    position: relative;

    &.active {
      color: #007aff;
      font-weight: 600;

      &::after {
        content: "";
        position: absolute;
        bottom: -10rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: #007aff;
        border-radius: 2rpx;
      }
    }
  }

  .calendar-icon {
    padding: 0 30rpx;
    border-left: 1rpx solid #eee;
  }
}

// 搜索框
.search-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;

  .search-box {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      margin: 0 16rpx;

      &::placeholder {
        color: #999;
      }
    }
  }
}

// 任务列表
.task-list {
  padding: 20rpx 30rpx;
  height: calc(100vh - 400rpx - env(safe-area-inset-bottom));
}

// 任务卡片
.task-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

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

// 空状态
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
