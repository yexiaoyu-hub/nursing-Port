// 健康标签页组件
<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { getAgedHealth } from "@/api/older/older.js";

interface BasicInfo {
  birthDate: string;
  idCard: string;
  phone: string;
  emergencyContact: string;
}

const props = defineProps<{
  elderlyId: number | null;
  basicInfo: BasicInfo;
}>();

// 格式化健康数据（将JSON数组或字符串转换为可读格式）
const formatHealthValue = (value: any): string => {
  if (!value || value === "null" || value === "undefined") {
    return "无";
  }
  // 如果是数组，用顿号分隔
  if (Array.isArray(value)) {
    return value.join("、") || "无";
  }
  // 如果是字符串，尝试解析JSON数组
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join("、") || "无";
      }
      return value || "无";
    } catch (e) {
      return value || "无";
    }
  }
  return String(value) || "无";
};

// 健康数据
const healthData = ref({
  // 健康指标
  shuzhangya: null,
  shousuoya: null,
  xuetang: null,
  xinlv: null,
  tiwen: null,
  // 基本信息中的健康字段
  yichuan: "",
  guomin: "",
  huanbing: "",
});

// 健康指标（从接口数据动态生成）
const healthIndicators = ref([
  {
    id: 1,
    name: "血压",
    value: "--/--",
    unit: "mmHg",
    trend: [],
  },
  {
    id: 2,
    name: "血糖",
    value: "--",
    unit: "mmol/L",
    trend: [],
  },
  {
    id: 3,
    name: "心率",
    value: "--",
    unit: "次/分",
    trend: [],
  },
  {
    id: 4,
    name: "体温",
    value: "--",
    unit: "℃",
    trend: [],
  },
]);

// 用药记录
const medications = ref([
  {
    id: 1,
    name: "氨氯地平片",
    dosage: "剂量 5mg · 口服 1次/日 · 时间 早餐后",
    status: "在用",
  },
  {
    id: 2,
    name: "阿司匹林肠溶片",
    dosage: "剂量 100mg · 口服 1次/日 · 时间 晚餐后",
    status: "在用",
  },
]);

// 检查报告
const reports = ref([
  {
    id: 1,
    name: "血常规检查",
    date: "2026-01-18",
  },
  {
    id: 2,
    name: "心电图检查",
    date: "2025-12-26",
  },
]);

// 护理评估
const nursingAssessments = ref([
  {
    id: 1,
    date: "2026-01-20",
    title: "定期评估",
    content: "生命体征平稳，继续现有护理与监测频次。",
    status: "稳定",
    statusType: "normal",
  },
  {
    id: 2,
    date: "2025-12-20",
    title: "定期评估",
    content: "夜间起床次数增多，建议加强巡视与跌倒风险提示。",
    status: "需关注",
    statusType: "warning",
  },
]);

// 获取健康信息
const fetchHealthData = async () => {
  if (!props.elderlyId) return;
  try {
    const res = await getAgedHealth(props.elderlyId);
    const data = res?.data || res;
    if (data) {
      healthData.value = {
        shuzhangya: data.shuzhangya,
        shousuoya: data.shousuoya,
        xuetang: data.xuetang,
        xinlv: data.xinlv,
        tiwen: data.tiwen,
        yichuan: data.yichuan,
        guomin: data.guomin,
        huanbing: data.huanbing,
      };
      // 更新健康指标显示
      updateHealthIndicators();
    }
  } catch (error) {
    console.error("获取健康信息失败:", error);
  }
};

// 更新健康指标
const updateHealthIndicators = () => {
  const data = healthData.value;
  // 血压
  if (data.shuzhangya && data.shousuoya) {
    healthIndicators.value[0].value = `${data.shousuoya}/${data.shuzhangya}`;
  }
  // 血糖
  if (data.xuetang !== null && data.xuetang !== undefined) {
    healthIndicators.value[1].value = String(data.xuetang);
  }
  // 心率
  if (data.xinlv !== null && data.xinlv !== undefined) {
    healthIndicators.value[2].value = String(data.xinlv);
  }
  // 体温
  if (data.tiwen !== null && data.tiwen !== undefined) {
    healthIndicators.value[3].value = String(data.tiwen);
  }
};

// 查看监测记录
const viewMonitorRecords = () => {
  uni.showToast({ title: "查看监测记录", icon: "none" });
};

// 查看完整用药记录
const viewMedications = () => {
  uni.showToast({ title: "查看完整用药记录", icon: "none" });
};

// 查看图片
const viewImage = (name: string) => {
  uni.showToast({ title: `查看${name}图片`, icon: "none" });
};

// 查看PDF
const viewPDF = (name: string) => {
  uni.showToast({ title: `查看${name}PDF`, icon: "none" });
};

// 获取状态样式
const getStatusClass = (type: string) => {
  switch (type) {
    case "normal":
      return "status-normal";
    case "warning":
      return "status-warning";
    default:
      return "status-normal";
  }
};

// 监听elderlyId变化，获取健康数据
watch(
  () => props.elderlyId,
  (newId) => {
    if (newId) {
      fetchHealthData();
    }
  },
  { immediate: true }
);
</script>

<template>
  <view class="health-tab">
    <!-- 基本信息 - 从父组件传入的数据 -->
    <view class="section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">出生日期</text>
          <text class="value">{{ basicInfo.birthDate || "-" }}</text>
        </view>
        <view class="info-item">
          <text class="label">身份证号</text>
          <text class="value">{{ basicInfo.idCard || "-" }}</text>
        </view>
        <view class="info-item">
          <text class="label">联系方式</text>
          <text class="value">{{ basicInfo.phone || "-" }}</text>
        </view>
        <view class="info-item">
          <text class="label">紧急联系人</text>
          <text class="value">{{ basicInfo.emergencyContact || "-" }}</text>
        </view>
        <view class="info-item">
          <text class="label">遗传病史</text>
          <text class="value">{{ formatHealthValue(healthData.yichuan) }}</text>
        </view>
        <view class="info-item">
          <text class="label">目前患病</text>
          <text class="value">{{
            formatHealthValue(healthData.huanbing)
          }}</text>
        </view>
        <view class="info-item">
          <text class="label">药物过敏史</text>
          <text class="value">{{ formatHealthValue(healthData.guomin) }}</text>
        </view>
      </view>
    </view>

    <!-- 健康指标 -->
    <view class="section">
      <view class="section-title">健康指标</view>
      <view class="indicators-grid">
        <view
          class="indicator-card"
          v-for="item in healthIndicators"
          :key="item.id"
        >
          <view class="indicator-header">
            <text class="indicator-name">{{ item.name }}</text>
            <view class="indicator-value-row">
              <text class="value">{{ item.value }}</text>
              <text class="unit">{{ item.unit }}</text>
            </view>
          </view>
          <text class="trend-label">近 7 天趋势</text>
          <view class="trend-chart">
            <svg viewBox="0 0 100 30" class="chart-svg">
              <polyline
                fill="none"
                stroke="#1677ff"
                stroke-width="2"
                :points="
                  item.trend
                    .map((v, i) => {
                      const x = (i / (item.trend.length - 1)) * 100;
                      const min = Math.min(...item.trend);
                      const max = Math.max(...item.trend);
                      const range = max - min || 1;
                      const y = 30 - ((v - min) / range) * 20 - 5;
                      return `${x},${y}`;
                    })
                    .join(' ')
                "
              />
            </svg>
          </view>
        </view>
      </view>
      <div
        style="height: 1px; background-color: #0f172a1a; margin: 30rpx 0"
      ></div>
      <!-- 查看监测记录按钮 -->
      <view class="button-row">
        <view class="btn default" @click="viewMonitorRecords"
          >查看监测记录</view
        >
      </view>
    </view>

    <!-- 用药记录 -->
    <view class="section">
      <view class="section-title">用药记录</view>
      <view class="medication-list">
        <view
          class="medication-card"
          v-for="item in medications"
          :key="item.id"
        >
          <view class="medication-header">
            <text class="medication-name">{{ item.name }}</text>
            <text class="medication-status">{{ item.status }}</text>
          </view>
          <text class="medication-dosage">{{ item.dosage }}</text>
        </view>
      </view>
      <div
        style="height: 1px; background-color: #0f172a1a; margin: 30rpx 0"
      ></div>
      <!-- 查看完整用药记录按钮 -->
      <view class="button-row">
        <view class="btn default" @click="viewMedications"
          >查看完整用药记录</view
        >
      </view>
    </view>

    <!-- 检查报告 -->
    <view class="section">
      <view class="section-title">检查报告</view>
      <view class="report-list">
        <view class="report-card" v-for="item in reports" :key="item.id">
          <view class="report-header">
            <text class="report-name">{{ item.name }}</text>
            <text class="report-date">{{ item.date }}</text>
          </view>
          <view class="report-actions">
            <view class="btn small default" @click="viewImage(item.name)">
              查看图片
            </view>
            <view class="btn small primary" @click="viewPDF(item.name)">
              查看 PDF
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 护理评估 -->
    <view class="section timeline-section">
      <view class="section-title">护理评估</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in nursingAssessments"
          :key="item.id"
        >
          <view class="timeline-line">
            <view class="timeline-dot"></view>
            <view
              class="timeline-connector"
              v-if="index < nursingAssessments.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <text class="timeline-date">{{ item.date }}</text>
            <view class="timeline-card">
              <view class="card-header">
                <text class="card-title">{{ item.title }}</text>
                <text
                  class="card-status"
                  :class="getStatusClass(item.statusType)"
                >
                  {{ item.status }}
                </text>
              </view>
              <text class="card-content">{{ item.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.health-tab {
  padding: 20rpx 30rpx;

  .section {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #0f172a14;

    .section-title {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
  }

  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 28rpx;
        color: #666;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        max-width: 60%;
        text-align: right;
        word-break: break-all;
        line-height: 1.4;
      }
    }
  }

  .indicators-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .indicator-card {
      background-color: #fff;
      border: 2rpx solid #eaeaea;
      border-radius: 16rpx;
      padding: 24rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      .indicator-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8rpx;

        .indicator-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
          writing-mode: vertical-rl;
          text-orientation: upright;
          letter-spacing: 4rpx;
        }

        .indicator-value-row {
          display: flex;
          align-items: baseline;

          .value {
            font-size: 36rpx;
            font-weight: 700;
            color: #333;
          }

          .unit {
            font-size: 24rpx;
            color: #666;
            margin-left: 8rpx;
          }
        }
      }

      .trend-label {
        font-size: 22rpx;
        color: #999;
        margin-bottom: 12rpx;
        display: block;
      }

      .trend-chart {
        width: 100%;
        height: 60rpx;

        .chart-svg {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .button-row {
    display: flex;
    justify-content: center;

    .btn {
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;
      font-size: 28rpx;
      padding: 0 40rpx;

      &.default {
        background-color: #f5f5f5;
        color: #666;
        border: 1rpx solid #e0e0e0;
      }

      &.small {
        height: 56rpx;
        padding: 0 24rpx;
        font-size: 24rpx;
      }

      &.primary {
        background: #1677ff;
        color: #fff;
      }
    }
  }

  .medication-list {
    .medication-card {
      background-color: #f8f9fa;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .medication-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .medication-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .medication-status {
          font-size: 24rpx;
          color: #52c41a;
          background-color: #d0f9d9;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
        }
      }

      .medication-dosage {
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .report-list {
    .report-card {
      background-color: #f8f9fa;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .report-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .report-date {
          font-size: 24rpx;
          color: #999;
        }
      }

      .report-actions {
        display: flex;
        gap: 16rpx;
      }
    }
  }

  .timeline-section {
    .timeline {
      .timeline-item {
        display: flex;
        gap: 20rpx;

        .timeline-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32rpx;

          .timeline-dot {
            width: 16rpx;
            height: 16rpx;
            background-color: #1677ff;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .timeline-connector {
            width: 2rpx;
            flex: 1;
            background-color: #e0e0e0;
            margin: 8rpx 0;
          }
        }

        .timeline-content {
          flex: 1;
          padding-bottom: 30rpx;

          .timeline-date {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 12rpx;
            display: block;
          }

          .timeline-card {
            background-color: #f8f9fa;
            border-radius: 16rpx;
            padding: 24rpx;

            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12rpx;

              .card-title {
                font-size: 30rpx;
                font-weight: 600;
                color: #333;
              }

              .card-status {
                font-size: 24rpx;
                padding: 4rpx 16rpx;
                border-radius: 20rpx;

                &.status-normal {
                  color: #52c41a;
                  background-color: #d0f9d9;
                }

                &.status-warning {
                  color: #fa8c16;
                  background-color: #fff2e8;
                }
              }
            }

            .card-content {
              font-size: 26rpx;
              color: #666;
              line-height: 1.6;
            }
          }
        }
      }
    }
  }
}
</style>
