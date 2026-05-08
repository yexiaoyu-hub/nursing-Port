// 已服务订单组件
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getServedOrderStatistics } from "@/api/dataBoard/dataBoard.js";

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
  completedOrders: 0,
  avgDuration: 0,
  avgSatisfaction: 0,
});

// 质量概览
const qualityOverview = ref({
  onTimeRate: 0,
  abnormalCount: 0,
});

// 服务时长分布
const durationDistribution = ref<
  Array<{ name: string; count: number; percentage: number }>
>([]);

// 满意度分布
const satisfactionDistribution = ref<
  Array<{ name: string; count: number; percentage: number; color: string }>
>([]);

// 异常订单列表
const abnormalOrders = ref<
  Array<{
    orderId: number;
    abnormalTitle: string;
    abnormalTime: string;
    staffName: string;
    projectNames: string;
  }>
>([]);

// 获取已服务订单统计数据
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

    const res = await getServedOrderStatistics(params);

    // 更新核心看板数据
    dashboardData.value = {
      completedOrders: res.servedOrderCount || 0,
      avgDuration: res.avgServiceMinutes || 0,
      avgSatisfaction: res.avgSatisfaction || 0,
    };

    // 更新质量概览数据
    qualityOverview.value = {
      onTimeRate: Math.round((res.onTimeCompletionRate || 0) * 100),
      abnormalCount: res.abnormalOrderCount || 0,
    };

    // 更新服务时长分布数据
    if (
      res.serviceDurationDistribution &&
      res.serviceDurationDistribution.length > 0
    ) {
      durationDistribution.value = res.serviceDurationDistribution.map(
        (item: any) => ({
          name: item.name,
          count: item.count,
          percentage: Math.round((item.ratio || 0) * 100),
        })
      );
    } else {
      durationDistribution.value = [];
    }

    // 更新满意度分布数据
    if (
      res.satisfactionDistribution &&
      res.satisfactionDistribution.length > 0
    ) {
      satisfactionDistribution.value = res.satisfactionDistribution.map(
        (item: any) => ({
          name: item.name,
          count: item.count,
          percentage: Math.round((item.ratio || 0) * 100),
          color: getSatisfactionColor(item.name),
        })
      );
    } else {
      satisfactionDistribution.value = [];
    }

    // 更新异常订单列表
    if (res.abnormalOrders && res.abnormalOrders.length > 0) {
      abnormalOrders.value = res.abnormalOrders.map((item: any) => ({
        orderId: item.orderId,
        abnormalTitle: item.abnormalTitle,
        abnormalTime: item.abnormalTime,
        staffName: item.staffName,
        projectNames: item.projectNames,
      }));
    } else {
      abnormalOrders.value = [];
    }
  } catch (error) {
    console.error("获取已服务订单统计失败:", error);
  } finally {
    loading.value = false;
  }
};

// 根据满意度分数获取颜色
const getSatisfactionColor = (name: string): string => {
  if (name.includes("5")) return "#52c41a";
  if (name.includes("4")) return "#faad14";
  return "#ff4d4f";
};

// 格式化时间戳为日期字符串
const formatDate = (timestamp: number | string): string => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
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
  <view class="completed-orders">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-cards">
        <view class="dashboard-card">
          <text class="card-label">已服务订单数</text>
          <text class="card-value">{{ dashboardData.completedOrders }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">平均服务时长</text>
          <view class="card-value">
            <text>{{ dashboardData.avgDuration }}</text>
            <text class="card-unit">min</text>
          </view>
        </view>
        <view class="dashboard-card">
          <text class="card-label">平均满意度</text>
          <text class="card-value">{{ dashboardData.avgSatisfaction }}</text>
        </view>
      </view>
    </view>

    <!-- 质量概览 -->
    <view class="quality-section">
      <text class="section-title">质量概览</text>
      <view class="quality-card">
        <view class="quality-header">
          <text class="quality-title">按时完成率</text>
          <text class="quality-rate">{{ qualityOverview.onTimeRate }}%</text>
        </view>
        <view class="quality-progress">
          <view
            class="progress-bar"
            :style="{ width: qualityOverview.onTimeRate + '%' }"
          ></view>
        </view>
        <text class="quality-desc"
          >本周期内有 {{ qualityOverview.abnormalCount }} 单存在异常。</text
        >
      </view>
    </view>

    <!-- 服务时长分布 -->
    <view class="chart-section">
      <view class="chart-header-row">
        <text class="section-title">服务时长分布</text>
        <text class="chart-avg">均值 {{ dashboardData.avgDuration }} 分钟</text>
      </view>
      <view class="chart-card">
        <view class="chart-list">
          <view
            v-for="(item, index) in durationDistribution"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view class="item-dot"></view>
              <text class="item-name">{{ item.name }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{ width: item.percentage + '%' }"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-count">{{ item.count }}</text>
              <text class="item-percentage">· {{ item.percentage }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 满意度分布 -->
    <view class="chart-section">
      <view class="chart-header-row">
        <text class="section-title">满意度分布</text>
        <text class="chart-avg">平均 {{ dashboardData.avgSatisfaction }}</text>
      </view>
      <view class="chart-card">
        <view class="chart-list">
          <view
            v-for="(item, index) in satisfactionDistribution"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view
                class="item-dot"
                :style="{ backgroundColor: item.color }"
              ></view>
              <text class="item-name">{{ item.name }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{
                  width: item.percentage + '%',
                  backgroundColor: item.color,
                }"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-count">{{ item.count }}</text>
              <text class="item-percentage">· {{ item.percentage }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 异常订单 -->
    <view class="abnormal-section">
      <text class="section-title">异常订单</text>
      <view class="abnormal-list">
        <view
          v-for="(item, index) in abnormalOrders"
          :key="index"
          class="abnormal-card"
        >
          <view class="abnormal-header">
            <text class="abnormal-type">{{ item.abnormalTitle }}</text>
            <view class="abnormal-tag serious">严重</view>
          </view>
          <text class="abnormal-info"
            >{{ formatDate(item.abnormalTime) }} · {{ item.staffName }} ·
            {{ item.projectNames }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.completed-orders {
  // 核心看板
  .dashboard-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .dashboard-cards {
      display: flex;
      gap: 20rpx;

      .dashboard-card {
        flex: 1;
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

        .card-value {
          font-size: 48rpx;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: baseline;

          .card-unit {
            font-size: 24rpx;
            font-weight: 400;
            color: #666;
            margin-left: 4rpx;
          }
        }
      }
    }
  }

  // 质量概览
  .quality-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .quality-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;

      .quality-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .quality-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .quality-rate {
          font-size: 28rpx;
          color: #666;
          background-color: #f5f5f5;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
        }
      }

      .quality-progress {
        height: 16rpx;
        background-color: #f0f0f0;
        border-radius: 8rpx;
        margin-bottom: 16rpx;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background-color: #52c41a;
          border-radius: 8rpx;
        }
      }

      .quality-desc {
        font-size: 26rpx;
        color: #999;
      }
    }
  }

  // 图表区域
  .chart-section {
    margin: 20rpx;

    .chart-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .section-title {
        font-size: 24rpx;
        color: #999;
      }

      .chart-avg {
        font-size: 24rpx;
        color: #999;
      }
    }

    .chart-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;

      .chart-list {
        .chart-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .item-info {
            width: 140rpx;
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
            width: 120rpx;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .item-count {
              font-size: 24rpx;
              color: #666;
            }

            .item-percentage {
              font-size: 24rpx;
              color: #999;
              margin-left: 8rpx;
            }
          }
        }
      }
    }
  }

  // 异常订单
  .abnormal-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .abnormal-list {
      .abnormal-card {
        background-color: #fff;
        border: 1rpx solid #e5e5e5;
        border-radius: 20rpx;
        padding: 24rpx;
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .abnormal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;

          .abnormal-type {
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
          }

          .abnormal-tag {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;
            background-color: #fff2f0;
            color: #ff4d4f;
            border: 1rpx solid #ff4d4f;

            &.serious {
              background-color: #fff2f0;
              color: #ff4d4f;
              border: 1rpx solid #ff4d4f;
            }
          }
        }

        .abnormal-info {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
