// 健康标签页组件
<script setup lang="ts">
import { ref } from "vue";

// 基本信息
const basicInfo = ref({
  birthDate: "1948-05-01",
  idCard: "450100194805010011",
  phone: "13800000001",
  emergencyContact: "王梅（配偶）13800000011",
  medicalHistory: "高血压（10年）",
  allergy: "无",
});

// 健康指标
const healthIndicators = ref([
  {
    id: 1,
    name: "血压",
    value: "118/76",
    unit: "mmHg",
    trend: [80, 85, 75, 90, 82, 78, 76],
  },
  {
    id: 2,
    name: "血糖",
    value: "6",
    unit: "mmol/L",
    trend: [5.5, 6.2, 5.8, 6.5, 6.0, 5.9, 6.0],
  },
  {
    id: 3,
    name: "心率",
    value: "73",
    unit: "次/分",
    trend: [70, 75, 72, 78, 74, 71, 73],
  },
  {
    id: 4,
    name: "体温",
    value: "36.5",
    unit: "℃",
    trend: [36.4, 36.6, 36.5, 36.7, 36.5, 36.4, 36.5],
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
</script>

<template>
  <view class="health-tab">
    <!-- 基本信息 -->
    <view class="section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">出生日期</text>
          <text class="value">{{ basicInfo.birthDate }}</text>
        </view>
        <view class="info-item">
          <text class="label">身份证号</text>
          <text class="value">{{ basicInfo.idCard }}</text>
        </view>
        <view class="info-item">
          <text class="label">联系方式</text>
          <text class="value">{{ basicInfo.phone }}</text>
        </view>
        <view class="info-item">
          <text class="label">紧急联系人</text>
          <text class="value">{{ basicInfo.emergencyContact }}</text>
        </view>
        <view class="info-item">
          <text class="label">既往病史</text>
          <text class="value">{{ basicInfo.medicalHistory }}</text>
        </view>
        <view class="info-item">
          <text class="label">过敏史</text>
          <text class="value">{{ basicInfo.allergy }}</text>
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
    margin-top: 20rpx;
    margin-bottom: 20rpx;

    .btn {
      width: 100%;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;
      font-size: 28rpx;
      font-weight: 600;
      background-color: #fff;
      color: #333;
      border: 2rpx solid #eaeaea;

      &.primary {
        background: #1677ff;
        color: #fff;
        border: none;
      }

      &.small {
        flex: 1;
        height: 64rpx;
        font-size: 26rpx;
      }
    }
  }

  .medication-list {
    .medication-card {
      background-color: #fff;
      border: 2rpx solid #eaeaea;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .medication-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .medication-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .medication-status {
          font-size: 24rpx;
          color: #666;
        }
      }

      .medication-dosage {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .report-list {
    .report-card {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .report-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .report-date {
          font-size: 24rpx;
          color: #999;
          padding: 4rpx 12rpx;
          border: 1rpx solid #0f172a1a;
          border-radius: 15rpx;
        }
      }

      .report-actions {
        display: flex;
        gap: 20rpx;

        .btn {
          flex: 1;
          height: 64rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12rpx;
          font-size: 26rpx;

          &.default {
            background-color: #fff;
            color: #333;
            border: 2rpx solid #eaeaea;
          }

          &.primary {
            background: #1677ff;
            color: #fff;
          }
        }
      }
    }
  }

  .timeline-section {
    padding-left: 20rpx;
  }

  .timeline {
    .timeline-item {
      display: flex;
      align-items: flex-start;

      .timeline-line {
        width: 32rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        flex-shrink: 0;

        .timeline-dot {
          width: 20rpx;
          height: 20rpx;
          background-color: #1677ff;
          border-radius: 50%;
          margin-top: 4rpx;
          flex-shrink: 0;
        }

        .timeline-connector {
          width: 3rpx;
          flex: 1;
          min-height: 120rpx;
          background-color: #e8e8e8;
          margin: 8rpx 0;
        }
      }

      .timeline-content {
        flex: 1;
        padding-bottom: 30rpx;
        padding-left: 20rpx;

        .timeline-date {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
          display: block;
        }

        .timeline-card {
          background-color: #fff;
          border: 2rpx solid #eaeaea;
          border-radius: 16rpx;
          padding: 24rpx;
          box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.1);

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
              padding: 4rpx 12rpx;
              border-radius: 8rpx;

              &.status-normal {
                background-color: #f5f5f5;
                color: #666;
              }

              &.status-warning {
                background-color: #fff2e8;
                color: #fa8c16;
              }
            }
          }

          .card-content {
            font-size: 26rpx;
            color: #666;
            line-height: 1.5;
          }
        }
      }
    }
  }
}
</style>
