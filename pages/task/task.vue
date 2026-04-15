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

    <!-- 日期筛选弹窗 -->
    <view class="date-filter-popup" v-if="showDateFilter">
      <view class="filter-mask" @click="closeDateFilter"></view>
      <view class="filter-content">
        <view class="filter-title">选择日期范围</view>
        <view class="date-picker-wrapper">
          <picker-view
            class="date-picker"
            :value="startDateValue"
            @change="onStartDatePickerChange"
          >
            <picker-view-column>
              <view class="picker-item" v-for="year in years" :key="year"
                >{{ year }}年</view
              >
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="month in months" :key="month"
                >{{ month }}月</view
              >
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="day in days" :key="day"
                >{{ day }}日</view
              >
            </picker-view-column>
          </picker-view>
          <view class="picker-label">开始日期</view>
        </view>
        <view class="date-separator">至</view>
        <view class="date-picker-wrapper">
          <picker-view
            class="date-picker"
            :value="endDateValue"
            @change="onEndDatePickerChange"
          >
            <picker-view-column>
              <view class="picker-item" v-for="year in years" :key="year"
                >{{ year }}年</view
              >
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="month in months" :key="month"
                >{{ month }}月</view
              >
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="day in days" :key="day"
                >{{ day }}日</view
              >
            </picker-view-column>
          </picker-view>
          <view class="picker-label">结束日期</view>
        </view>
        <view class="filter-actions">
          <view class="btn-clear" @click="clearDateFilter">清空</view>
          <view class="btn-confirm" @click="confirmDateFilter">确定</view>
        </view>
      </view>
    </view>

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
const tempStartDate = ref("");
const tempEndDate = ref("");
const startDate = ref("");
const endDate = ref("");
const startDateValue = ref([0, 0, 0]);
const endDateValue = ref([0, 0, 0]);

// 是否有日期筛选
const hasDateFilter = computed(() => {
  return startDate.value && endDate.value;
});

// 生成日期数据
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
  tempStartDate.value = startDate.value;
  tempEndDate.value = endDate.value;
};

// 关闭日期筛选
const closeDateFilter = () => {
  showDateFilter.value = false;
};

// 开始日期选择器变化
const onStartDatePickerChange = (e) => {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value;
  const year = years[yearIndex];
  const month = months[monthIndex];
  const day = days[dayIndex];
  tempStartDate.value = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  startDateValue.value = e.detail.value;
};

// 结束日期选择器变化
const onEndDatePickerChange = (e) => {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value;
  const year = years[yearIndex];
  const month = months[monthIndex];
  const day = days[dayIndex];
  tempEndDate.value = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  endDateValue.value = e.detail.value;
};

// 清空日期筛选
const clearDateFilter = () => {
  tempStartDate.value = "";
  tempEndDate.value = "";
  startDate.value = "";
  endDate.value = "";
  showDateFilter.value = false;
  uni.showToast({
    title: "已清空日期筛选",
    icon: "none",
  });
};

// 确认日期筛选
const confirmDateFilter = () => {
  if (!tempStartDate.value || !tempEndDate.value) {
    uni.showToast({
      title: "请选择完整的日期范围",
      icon: "none",
    });
    return;
  }
  if (tempStartDate.value > tempEndDate.value) {
    uni.showToast({
      title: "开始日期不能晚于结束日期",
      icon: "none",
    });
    return;
  }
  startDate.value = tempStartDate.value;
  endDate.value = tempEndDate.value;
  showDateFilter.value = false;
  uni.showToast({
    title: `已筛选：${startDate.value} 至 ${endDate.value}`,
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

// 日期筛选弹窗
.date-filter-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  .filter-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .filter-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    width: 600rpx;

    .filter-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 30rpx;
    }

    .date-picker-wrapper {
      margin-bottom: 20rpx;

      .date-picker {
        height: 300rpx;

        .picker-item {
          line-height: 100rpx;
          text-align: center;
          font-size: 28rpx;
        }
      }

      .picker-label {
        text-align: center;
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
      }
    }

    .date-separator {
      text-align: center;
      font-size: 28rpx;
      color: #666;
      margin: 20rpx 0;
    }

    .filter-actions {
      display: flex;
      gap: 20rpx;
      margin-top: 30rpx;

      .btn-clear,
      .btn-confirm {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 28rpx;
      }

      .btn-clear {
        background-color: #f5f5f5;
        color: #666;
      }

      .btn-confirm {
        background-color: #007aff;
        color: #fff;
      }
    }
  }
}

.btn-confirm-inline {
  background-color: #007aff;
  color: #fff;
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
