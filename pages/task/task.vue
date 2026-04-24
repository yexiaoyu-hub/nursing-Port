<template>
  <view class="task-page">
    <!-- 固定头部区域 -->
    <view class="header-section">
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
          <uni-icons
            type="calendar"
            size="20"
            :color="hasDateFilter ? '#007aff' : '#666'"
          ></uni-icons>
          <text v-if="hasDateFilter" class="filter-badge"></text>
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
    </view>

    <!-- 日期范围选择器组件 -->
    <DateRangePicker
      v-model:show="showDateFilter"
      :begin-date="startDate"
      :end-date="endDate"
      title="选择日期范围"
      @confirm="onDateConfirm"
      @clear="onDateClear"
    />

    <!-- 任务列表 -->
    <view class="task-list">
      <TaskCard v-for="task in filteredTasks" :key="task.id" :task="task" />

      <!-- 空状态 -->
      <view v-if="filteredTasks.length === 0" class="empty-state">
        <text>暂无任务</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import TaskCard from "@/components/TaskCard.vue";
import DateRangePicker from "@/components/DateRangePicker.vue";

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

// 日期筛选相关
const showDateFilter = ref(false);
const startDate = ref("");
const endDate = ref("");

// 是否有日期筛选
const hasDateFilter = computed(() => {
  return startDate.value && endDate.value;
});

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

  // 按日期范围过滤
  if (startDate.value && endDate.value) {
    result = result.filter((task) => {
      const taskDate = task.executeTime.split(" ")[0];
      return taskDate >= startDate.value && taskDate <= endDate.value;
    });
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

// 打开日期筛选
const openCalendar = () => {
  showDateFilter.value = true;
};

// 确认日期筛选
const onDateConfirm = (beginDate, endDate) => {
  startDate.value = beginDate;
  endDate.value = endDate;
  uni.showToast({
    title: `已筛选：${startDate.value} 至 ${endDate.value}`,
    icon: "none",
  });
};

// 清空日期筛选
const onDateClear = () => {
  startDate.value = "";
  endDate.value = "";
  uni.showToast({
    title: "已清空日期筛选",
    icon: "none",
  });
};
</script>

<style lang="scss" scoped>
.task-page {
  min-height: 100vh;
  background-color: #f5f7fa;
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
    position: relative;
    display: flex;
    align-items: center;

    .filter-badge {
      position: absolute;
      top: -4rpx;
      right: 20rpx;
      width: 16rpx;
      height: 16rpx;
      background-color: #007aff;
      border-radius: 50%;
    }
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

// 固定头部区域
.header-section {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #f5f7fa;
}

// 任务列表
.task-list {
  padding: 0 30rpx 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

// 空状态
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>