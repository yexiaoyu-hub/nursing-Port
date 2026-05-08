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
            @confirm="onSearch"
          />
          <uni-icons
            v-if="searchKeyword"
            type="clear"
            size="24"
            color="#999"
            @click="clearSearch"
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
    <scroll-view
      class="task-list"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <TaskCard v-for="task in taskList" :key="task.id" :task="task" />

      <!-- 加载更多状态 -->
      <view v-if="taskList.length > 0" class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
        <text v-else>上拉加载更多</text>
      </view>

      <!-- 空状态 -->
      <view v-if="taskList.length === 0 && !loading" class="empty-state">
        <text>暂无任务</text>
      </view>
    </scroll-view>
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
const refreshing = ref(false);

// 分页相关
const pageNo = ref(1);
const pageSize = 10;
const noMore = ref(false);

// 获取任务列表
const fetchTaskList = async (isLoadMore = false) => {
  if (loading.value) return;

  // 如果不是加载更多，重置页码
  if (!isLoadMore) {
    pageNo.value = 1;
    noMore.value = false;
  }

  loading.value = true;
  try {
    // 获取当前登录用户信息
    const userInfo = uni.getStorageSync("userInfo");
    const staffId = userInfo?.user?.staffId;

    // 构建查询参数
    const params = {
      pageNo: pageNo.value,
      pageSize: pageSize,
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
      // 判断是工单号还是老人姓名（工单号通常是数字或字母组合）
      const isOrderNo = /^[a-zA-Z0-9]+$/.test(searchKeyword.value);
      if (isOrderNo) {
        params.orderNo = searchKeyword.value;
      } else {
        params.agedName = searchKeyword.value;
      }
    }

    // 添加日期范围筛选（传给后端）
    if (dateRange.value.beginDate) {
      params.beginDate = dateRange.value.beginDate;
    }
    if (dateRange.value.endDate) {
      params.endDate = dateRange.value.endDate;
    }

    const res = await getServiceHistoryList(params);

    if (res && res.list) {
      // 直接使用后端返回的数据，不再进行前端筛选
      const newList = res.list.map((item) => {
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
          // 服务总时长（标准时长）
          orderSerTimes: item.orderSerTimes || 0,
          // 保留原始数据供详情页使用
          rawData: item,
        };
      });

      // 如果是加载更多，追加数据；否则替换数据
      if (isLoadMore) {
        taskList.value = [...taskList.value, ...newList];
      } else {
        taskList.value = newList;
      }

      // 判断是否还有更多数据（根据后端返回的总数判断）
      const total = res.total || 0;
      const currentTotal = isLoadMore
        ? taskList.value.length + newList.length
        : newList.length;
      if (currentTotal >= total || newList.length < pageSize) {
        noMore.value = true;
      }
    } else {
      if (!isLoadMore) {
        taskList.value = [];
      }
      noMore.value = true;
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

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true;
  await fetchTaskList(false);
  refreshing.value = false;
};

// 触底加载更多
const loadMore = async () => {
  if (loading.value || noMore.value) return;
  pageNo.value++;
  await fetchTaskList(true);
};

// 切换标签
const switchTab = (value) => {
  currentTab.value = value;
  taskList.value = []; // 清空列表
  fetchTaskList(false);
};

// 搜索
const onSearch = () => {
  taskList.value = []; // 清空列表
  pageNo.value = 1; // 重置页码
  noMore.value = false; // 重置加载状态
  fetchTaskList(false);
};

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = "";
  onSearch();
};

// 打开日期筛选
const openCalendar = () => {
  showDateFilter.value = true;
};

// 确认日期筛选
const onDateConfirm = (beginDate, endDate) => {
  dateRange.value.beginDate = beginDate;
  dateRange.value.endDate = endDate;
  taskList.value = []; // 清空列表
  fetchTaskList(false);
  uni.showToast({
    title: `已筛选：${dateRange.value.beginDate} 至 ${dateRange.value.endDate}`,
    icon: "none",
  });
};

// 清空日期筛选
const onDateClear = () => {
  dateRange.value.beginDate = "";
  dateRange.value.endDate = "";
  taskList.value = []; // 清空列表
  fetchTaskList(false);
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
  height: calc(100vh - 220rpx); // 设置高度以支持滚动
  box-sizing: border-box;
  width: 100%;
}

// 加载更多
.load-more {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}

// 空状态
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>