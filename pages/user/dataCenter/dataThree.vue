// 待服务老人组件
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getPendingServiceElderlyStatistics } from "@/api/dataBoard/dataBoard.js";

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
  pendingElderly: 0,
  institutionElderly: 0,
  communityElderly: 0,
});

// 失能等级分布
const disabilityDistribution = ref<
  Array<{ name: string; count: number; percentage: number }>
>([]);

// 健康状况分布
const healthDistribution = ref<
  Array<{ name: string; count: number; percentage: number; color: string }>
>([]);

// 服务频次统计
const frequencyDistribution = ref<
  Array<{ name: string; count: number; percentage: number }>
>([]);
const weeklyTotal = ref(0);

// 获取待服务老人统计数据
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

    const res = await getPendingServiceElderlyStatistics(params);

    // 更新核心看板数据
    dashboardData.value = {
      pendingElderly: res.pendingServiceAgedCount || 0,
      institutionElderly: res.orgNursingAgedCount || 0,
      communityElderly: res.homeCommunityNursingAgedCount || 0,
    };

    // 更新失能等级分布数据
    if (
      res.shinengLevelDistribution &&
      res.shinengLevelDistribution.length > 0
    ) {
      disabilityDistribution.value = res.shinengLevelDistribution.map(
        (item: any) => ({
          name: item.name || "",
          count: item.count || 0,
          percentage: Math.round((item.ratio || 0) * 100),
        })
      );
    } else {
      disabilityDistribution.value = [];
    }

    // 更新健康状况分布数据
    if (res.healthDistribution && res.healthDistribution.length > 0) {
      healthDistribution.value = res.healthDistribution.map((item: any) => ({
        name: item.name || "",
        count: item.count || 0,
        percentage: Math.round((item.ratio || 0) * 100),
        color: getHealthColor(item.name || ""),
      }));
    } else {
      healthDistribution.value = [];
    }

    // 更新服务频次统计数据
    weeklyTotal.value = res.serviceFrequencyTotalOrderCount || 0;
    if (
      res.serviceFrequencyDistribution &&
      res.serviceFrequencyDistribution.length > 0
    ) {
      frequencyDistribution.value = res.serviceFrequencyDistribution.map(
        (item: any) => ({
          name: item.name || "",
          count: item.count || 0,
          percentage: Math.round((item.ratio || 0) * 100),
        })
      );
    } else {
      frequencyDistribution.value = [];
    }
  } catch (error) {
    console.error("获取待服务老人统计失败:", error);
  } finally {
    loading.value = false;
  }
};

// 根据健康状况等级获取颜色
const getHealthColor = (name: string): string => {
  if (name.includes("一") || name.includes("1")) return "#ff4d4f";
  if (name.includes("二") || name.includes("2")) return "#faad14";
  return "#52c41a";
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
  <view class="pending-elderly">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-cards">
        <view class="dashboard-card">
          <text class="card-label">待服务老人</text>
          <text class="card-value">{{ dashboardData.pendingElderly }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">机构护理老人</text>
          <text class="card-value">{{ dashboardData.institutionElderly }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">社区/居家老人</text>
          <text class="card-value">{{ dashboardData.communityElderly }}</text>
        </view>
      </view>
    </view>

    <!-- 分布图表 -->
    <view class="chart-section">
      <text class="section-title">分布图表</text>

      <!-- 失能等级分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">失能等级分布</text>
          <text class="chart-total"
            >总数：{{ dashboardData.pendingElderly }}</text
          >
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in disabilityDistribution"
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

      <!-- 健康状况分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">健康状况分布</text>
          <text class="chart-total">概览</text>
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in healthDistribution"
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

      <!-- 服务频次统计 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">服务频次统计</text>
          <text class="chart-total">合计： {{ weeklyTotal }}</text>
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in frequencyDistribution"
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
  </view>
</template>

<style lang="scss" scoped>
.pending-elderly {
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
        }
      }
    }
  }

  // 分布图表
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
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

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
          background-color: #f5f5f5;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
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
}
</style>
