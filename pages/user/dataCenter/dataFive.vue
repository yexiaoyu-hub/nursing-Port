// 累计时长组件
<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { getDurationBoard } from "@/api/dataBoard/dataBoard.js";

// 定义 props 接收日期范围
const props = defineProps<{
  dateRange?: {
    beginDate: string;
    endDate: string;
  };
}>();

// 加载状态
const loading = ref(false);

// 核心看板数据
const dashboardData = ref({
  monthlyDuration: "0",
  yearlyDuration: "0",
  monthlyCount: 0,
  dailyAvgDuration: "0",
});

// 月度时长统计
const monthlyStats = ref<
  Array<{ date: string; duration: number; originalDate: string }>
>([]);
const monthlyTotalMinutes = ref(0);
const currentMonthLabel = ref("");

// 计算最大时长用于进度条比例
const maxDuration = computed(() => {
  if (monthlyStats.value.length === 0) return 1;
  return Math.max(...monthlyStats.value.map((item) => item.duration), 1);
});

// 将分钟转换为小时（保留1位小数）
const minutesToHours = (minutes: number): string => {
  return (minutes / 60).toFixed(1);
};

// 获取累计时长看板数据
const fetchStatistics = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = {};

    // 添加日期范围参数
    if (props.dateRange?.beginDate) {
      params.beginDate = props.dateRange.beginDate;
    }
    if (props.dateRange?.endDate) {
      params.endDate = props.dateRange.endDate;
    }

    const res = await getDurationBoard(params);

    // 更新核心看板数据
    dashboardData.value = {
      monthlyDuration: res.monthServiceDuration || "0",
      yearlyDuration: res.yearServiceDuration || "0",
      monthlyCount: res.monthOrderCount || 0,
      dailyAvgDuration: res.avgDayServiceDuration || "0",
    };

    // 更新月度时长统计数据
    monthlyTotalMinutes.value = res.monthTotalMinutes || 0;
    currentMonthLabel.value = res.monthLabel || "";

    // 处理每日服务时长数据 - 只显示有时长的天数
    if (
      res.monthDailyServiceDurations &&
      res.monthDailyServiceDurations.length > 0
    ) {
      monthlyStats.value = res.monthDailyServiceDurations
        .map((item: string, index: number) => {
          // 从字符串中提取分钟数，如 "56分钟" -> 56
          const minutes = parseInt(item.replace(/[^\d]/g, "")) || 0;
          // 生成日期，假设从月初开始
          const day = index + 1;
          const month = currentMonthLabel.value
            ? currentMonthLabel.value.split("-")[1]
            : "01";
          return {
            originalDate: `${currentMonthLabel.value || "2026-01"}-${String(
              day
            ).padStart(2, "0")}`,
            date: `${month}-${String(day).padStart(2, "0")}`,
            duration: minutes,
          };
        })
        .filter((item) => item.duration > 0); // 过滤掉时长为0的天数
    } else {
      monthlyStats.value = [];
    }
  } catch (error) {
    console.error("获取累计时长看板失败:", error);
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchStatistics();
});

// 监听日期范围变化，重新获取数据
watch(
  () => props.dateRange,
  () => {
    fetchStatistics();
  },
  { deep: true }
);
</script>

<template>
  <view class="cumulative-duration">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-grid">
        <view class="dashboard-card">
          <text class="card-label">本月累计时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.monthlyDuration }}</text>
          </view>
        </view>
        <view class="dashboard-card">
          <text class="card-label">本年累计时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.yearlyDuration }}</text>
          </view>
        </view>
        <view class="dashboard-card">
          <text class="card-label">本月服务次数</text>
          <text class="card-value">{{ dashboardData.monthlyCount }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">日均服务时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.dailyAvgDuration }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 月度时长统计 -->
    <view class="chart-section">
      <text class="section-title">月度时长统计</text>
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">本月累计</text>
          <text class="chart-total"
            >总计：{{ minutesToHours(monthlyTotalMinutes) }} 小时</text
          >
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in monthlyStats"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view class="item-dot"></view>
              <text class="item-name">{{ item.date }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{ width: (item.duration / maxDuration) * 100 + '%' }"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-duration">{{ item.duration }}h</text>
            </view>
          </view>
        </view>
        <text class="chart-footer"
          >按天汇总统计（{{ currentMonthLabel }}）。</text
        >
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cumulative-duration {
  // 核心看板
  .dashboard-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20rpx;

      .dashboard-card {
        background-color: #fff;
        border: 1rpx solid #e5e5e5;
        border-radius: 16rpx;
        padding: 24rpx;
        display: flex;
        flex-direction: column;

        .card-label {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 12rpx;
        }

        .card-value-row {
          display: flex;
          align-items: baseline;

          .card-value {
            font-size: 48rpx;
            font-weight: 700;
            color: #333;
          }

          .unit {
            font-size: 30rpx;
            color: #999;
            margin-left: 8rpx;
          }
        }

        .card-value {
          font-size: 48rpx;
          font-weight: 700;
          color: #333;
        }
      }
    }
  }

  // 月度时长统计
  .chart-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .chart-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .chart-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .chart-total {
          font-size: 24rpx;
          color: #999;
        }
      }

      .chart-list {
        .chart-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .item-info {
            width: 100rpx;
            display: flex;
            align-items: center;

            .item-dot {
              width: 12rpx;
              height: 12rpx;
              border-radius: 50%;
              margin-right: 12rpx;
              background-color: #1677ff;
            }

            .item-name {
              font-size: 24rpx;
              color: #333;
            }
          }

          .item-bar {
            flex: 1;
            height: 16rpx;
            background-color: #f0f0f0;
            border-radius: 8rpx;
            margin: 0 20rpx;
            overflow: hidden;

            .item-progress {
              height: 100%;
              border-radius: 8rpx;
              background-color: #1677ff;
            }
          }

          .item-stats {
            width: 80rpx;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .item-duration {
              font-size: 24rpx;
              color: #666;
            }
          }
        }
      }

      .chart-footer {
        font-size: 22rpx;
        color: #999;
        margin-top: 24rpx;
        display: block;
      }
    }
  }
}
</style>
