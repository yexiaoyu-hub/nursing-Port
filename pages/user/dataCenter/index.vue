// 报表中心页面
<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataOne from "./dataOne.vue";
import DataTwo from "./dataTwo.vue";
import DataThree from "./dataThree.vue";
import DataFour from "./dataFour.vue";
import DataFive from "./dataFive.vue";
import DateRangePicker from "@/components/DateRangePicker.vue";

// 当前选中的标签
const activeTab = ref("pending");

// 日期范围
const dateRange = ref({
  beginDate: "",
  endDate: "",
});

// 日期选择器显示状态
const showDatePicker = ref(false);

// 切换标签
const switchTab = (tab: string) => {
  activeTab.value = tab;
};

// 格式化日期为 yyyy-MM-dd
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 初始化默认日期为本月
const initDefaultDateRange = () => {
  const now = new Date();
  dateRange.value.beginDate = formatDate(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  dateRange.value.endDate = formatDate(now);
};

// 打开日期选择器
const openDatePicker = () => {
  showDatePicker.value = true;
};

// 确认日期选择
const onDateConfirm = (beginDate: string, endDate: string) => {
  dateRange.value.beginDate = beginDate;
  dateRange.value.endDate = endDate;
};

// 清空日期选择
const onDateClear = () => {
  dateRange.value.beginDate = "";
  dateRange.value.endDate = "";
};

// 页面加载时初始化默认日期
onMounted(() => {
  initDefaultDateRange();
});
</script>

<template>
  <view class="data-center-page">
    <!-- 标签切换和日期筛选 -->
    <view class="tab-section">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'pending' }"
        @click="switchTab('pending')"
      >
        待服务订单
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'completed' }"
        @click="switchTab('completed')"
      >
        已服务订单
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'elderly' }"
        @click="switchTab('elderly')"
      >
        待服务老人
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'service' }"
        @click="switchTab('service')"
      >
        待服务项目
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'duration' }"
        @click="switchTab('duration')"
      >
        累计时长
      </view>
    </view>

    <!-- 日期筛选 -->
    <view class="date-section" @click="openDatePicker">
      <view class="date-filter">
        <view class="date-label">开始日期</view>
        <view class="date-label">结束日期</view>
      </view>
      <view class="date-inputs">
        <view class="date-input">
          <text :class="dateRange.beginDate ? 'date-text' : 'placeholder'">
            {{ dateRange.beginDate || "选择开始日期" }}
          </text>
          <text class="calendar-icon">📅</text>
        </view>
        <text class="date-separator">至</text>
        <view class="date-input">
          <text :class="dateRange.endDate ? 'date-text' : 'placeholder'">
            {{ dateRange.endDate || "选择结束日期" }}
          </text>
          <text class="calendar-icon">📅</text>
        </view>
      </view>
    </view>

    <!-- 日期范围选择器组件 -->
    <DateRangePicker
      v-model:show="showDatePicker"
      :begin-date="dateRange.beginDate"
      :end-date="dateRange.endDate"
      @confirm="onDateConfirm"
      @clear="onDateClear"
    />

    <!-- 待服务订单组件 -->
    <DataOne v-if="activeTab === 'pending'" :date-range="dateRange" />

    <!-- 已服务订单组件 -->
    <DataTwo v-if="activeTab === 'completed'" :date-range="dateRange" />

    <!-- 待服务老人组件 -->
    <DataThree v-if="activeTab === 'elderly'" :date-range="dateRange" />

    <!-- 待服务项目组件 -->
    <DataFour v-if="activeTab === 'service'" :date-range="dateRange" />

    <!-- 累计时长组件 -->
    <DataFive v-if="activeTab === 'duration'" :date-range="dateRange" />

    <!-- 底部安全区域 -->
    <view class="safe-area"></view>
  </view>
</template>

<style lang="scss" scoped>
.data-center-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  // 标签切换
  .tab-section {
    display: flex;
    background-color: #fff;
    padding: 0 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    .tab-item {
      flex-shrink: 0;
      height: 80rpx;
      padding: 0 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #666;
      position: relative;

      &.active {
        color: #1677ff;
        font-weight: 500;

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background-color: #1677ff;
          border-radius: 2rpx;
        }
      }
    }
  }

  // 日期区域
  .date-section {
    background-color: #fff;
    padding: 24rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .date-filter {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16rpx;

      .date-label {
        font-size: 24rpx;
        color: #999;
        flex: 1;
      }
    }

    .date-inputs {
      display: flex;
      align-items: center;

      .date-input {
        flex: 1;
        height: 72rpx;
        border: 1rpx solid #e5e5e5;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20rpx;

        .placeholder {
          font-size: 26rpx;
          color: #999;
        }

        .date-text {
          font-size: 26rpx;
          color: #333;
        }

        .calendar-icon {
          font-size: 28rpx;
        }
      }

      .date-separator {
        margin: 0 16rpx;
        font-size: 26rpx;
        color: #999;
      }
    }
  }

  .safe-area {
    height: 40rpx;
  }
}
</style>
