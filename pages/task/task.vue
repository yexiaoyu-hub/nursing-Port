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
            @confirm="fetchTaskList"
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
      :begin-date="dateRange.beginDate"
      :end-date="dateRange.endDate"
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
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import TaskCard from "@/components/TaskCard.vue";
import DateRangePicker from "@/components/DateRangePicker.vue";
import { getServiceHistoryList } from "@/api/history/history";

// 顶部标签
const tabs = [
  { label: "全部", value: "all" },
  { label: "待执行", value: "pending" },
  { label: "执行中", value: "executing" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "cancelled" },
];

// 状态映射（API状态值 -> 前端状态）
const statusMap = {
  1: "pending", // 待执行
  2: "executing", // 执行中
  3: "completed", // 已完成
  4: "cancelled", // 已取消
};

// 当前选中的标签
const currentTab = ref("all");
const currentBottomTab = ref("task");
const searchKeyword = ref("");

// 日期筛选相关
const showDateFilter = ref(false);
const dateRange = ref({
  beginDate: "",
  endDate: "",
});

// 是否有日期筛选
const hasDateFilter = computed(() => {
  return dateRange.value.beginDate && dateRange.value.endDate;
});

// 任务列表数据
const taskList = ref([]);
const loading = ref(false);

// 获取任务列表
const fetchTaskList = async () => {
  loading.value = true;
  try {
    // 获取当前登录用户信息
    const userInfo = uni.getStorageSync("userInfo");
    const staffId = userInfo?.user?.staffId;

    // 构建查询参数
    const params = {
      pageNo: 1,
      pageSize: 100,
    };

    // 添加服务人员ID筛选（后端字段名是 statffId）
    if (staffId) {
      params.statffId = staffId;
    }

    // 根据当前标签添加状态筛选
    if (currentTab.value !== "all") {
      const statusValue = Object.keys(statusMap).find(
        (key) => statusMap[key] === currentTab.value
      );
      if (statusValue) {
        params.status = statusValue;
      }
    }

    // 添加搜索关键词
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    const res = await getServiceHistoryList(params);

    if (res && res.list) {
      // 前端筛选
      let filteredList = res.list;

      // 关键字搜索（老人姓名、项目、工单号）
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        filteredList = filteredList.filter((item) => {
          // 搜索老人姓名
          const nameMatch =
            item.agedName && item.agedName.toLowerCase().includes(keyword);
          // 搜索工单号
          const orderNoMatch =
            item.orderNo && item.orderNo.toLowerCase().includes(keyword);
          // 搜索服务项目
          const projectMatch =
            item.projects &&
            item.projects.some(
              (p) =>
                p.projectName && p.projectName.toLowerCase().includes(keyword)
            );
          return nameMatch || orderNoMatch || projectMatch;
        });
      }

      // 日期筛选
      if (dateRange.value.beginDate && dateRange.value.endDate) {
        const beginTime = new Date(
          dateRange.value.beginDate + " 00:00:00"
        ).getTime();
        const endTime = new Date(
          dateRange.value.endDate + " 23:59:59"
        ).getTime();

        filteredList = filteredList.filter((item) => {
          // 根据服务执行时间筛选（待执行、执行中）
          const dispatchTime = item.orderDispatchDate
            ? new Date(item.orderDispatchDate).getTime()
            : 0;
          // 根据服务结束时间筛选（已完成）
          const endTimeValue = item.serEnd
            ? new Date(item.serEnd).getTime()
            : 0;

          // 使用执行时间或结束时间进行筛选
          const checkTime = endTimeValue || dispatchTime;
          if (!checkTime) return true; // 没有时间字段的不筛选

          return checkTime >= beginTime && checkTime <= endTime;
        });
      }

      taskList.value = filteredList.map((item) => {
        const status = statusMap[item.status] || "pending";
        const isCompleted = status === "completed";

        return {
          id: item.id,
          elderName: item.agedName || "",
          orderNo: item.orderNo || "",
          status: status,
          services: item.projects
            ? item.projects.map((p) => ({
                name: p.projectName,
                duration: p.orderplanSerTimes || 0,
              }))
            : [],
          // 已完成显示结束时间，其他显示执行时间
          executeTime: isCompleted
            ? item.serEnd
              ? formatDateTime(item.serEnd)
              : ""
            : item.orderDispatchDate
            ? formatDateTime(item.orderDispatchDate)
            : "",
          // 已完成显示实际时长，其他显示预计时长
          totalDuration: isCompleted
            ? item.serTime || 0
            : item.orderSerTimes || 0,
          // 保留原始数据供详情页使用
          rawData: item,
        };
      });
    } else {
      taskList.value = [];
    }
  } catch (error) {
    console.error("获取任务列表失败:", error);
    uni.showToast({
      title: "获取任务列表失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 页面显示时刷新数据
onShow(() => {
  fetchTaskList();
});

// 直接使用taskList作为过滤后的列表（因为筛选已在API层完成）
const filteredTasks = computed(() => {
  return taskList.value;
});

// 切换标签
const switchTab = (value) => {
  currentTab.value = value;
  fetchTaskList();
};

// 打开日期筛选
const openCalendar = () => {
  showDateFilter.value = true;
};

// 确认日期筛选
const onDateConfirm = (beginDate, endDate) => {
  dateRange.value.beginDate = beginDate;
  dateRange.value.endDate = endDate;
  fetchTaskList();
  uni.showToast({
    title: `已筛选：${dateRange.value.beginDate} 至 ${dateRange.value.endDate}`,
    icon: "none",
  });
};

// 清空日期筛选
const onDateClear = () => {
  dateRange.value.beginDate = "";
  dateRange.value.endDate = "";
  fetchTaskList();
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