// 任务详情页
<script setup lang="ts">
import { ref, computed } from "vue";

// 页面数据
const taskData = ref({
  // 工单信息
  orderNo: "CH463134",
  status: "服务执行中",
  isTiming: true,
  serviceDuration: "00:25:36",
  standardDuration: 45,

  // 老人信息
  elderly: {
    name: "张三",
    gender: "男",
    age: 78,
    avatar: "",
    disabilityLevel: "中度", // 失能等级
    bedNo: "3F-301-01", // 床位号
    serviceStatus: "服务中", // 服务状态：服务中、待服务、服务完成
    hasAssessmentReport: true,
    serviceType: "机构护理",
  },

  // 服务项目
  serviceItems: [
    { name: "协助助餐", duration: "15min/次", price: 20, category: "生活照料" },
    {
      name: "鼻饲护理",
      duration: "30min/次",
      price: 100,
      category: "医疗护理",
    },
  ],
  totalDuration: "45min",
  totalPrice: 160,

  // 缴费状态
  paymentStatus: "未缴费",
  estimatedCost: 160,
  coupon: 0,
  actualCost: 160,

  // 服务过程
  serviceProcess: [
    {
      step: 1,
      time: "2026-02-01 11:19:32",
      title: "服务人员开始服务",
      location: "友爱路xxx号",
      photos: ["https://placeholder.com/100x100"],
      audio: { duration: "00:00/2:15" },
      record: "",
    },
    {
      step: 2,
      time: "2026-02-01 11:19:32",
      title: "服务人员服务过程记录",
      location: "友爱路xxx号",
      photos: [
        "https://placeholder.com/100x100",
        "https://placeholder.com/100x100",
      ],
      audio: { duration: "00:00/2:15" },
      record: "老人情况良好，配合不错",
    },
    {
      step: 3,
      time: "2026-02-01 11:19:32",
      title: "服务人员服务结束记录",
      location: "友爱路xxx号",
      photos: [
        "https://placeholder.com/100x100",
        "https://placeholder.com/100x100",
      ],
      audio: { duration: "00:00/2:15" },
      record: "老人情况良好，配合不错",
    },
  ],

  // 健康采集数据
  healthData: {
    bloodPressure: { value: 125, unit: "mmHg", status: "normal" },
    bloodSugar: { value: 8.2, unit: "mmol/L", status: "high" },
    heartRate: { value: 87, unit: "bpm", status: "normal" },
    bloodOxygen: { value: 98, unit: "SpO2", status: "normal" },
    temperature: { value: 36, unit: "℃", status: "normal" },
  },

  // 评价信息（可选）
  evaluation: {
    orgRating: 5,
    staffRating: 5,
    content: "服务态度非常好，专业技能过硬，对老人很有耐心，非常满意这次服务！",
  },

  // 投诉反馈信息（可选）
  feedback: {
    type: "服务质量",
    content:
      "服务过程中有一些细节需要改进，希望下次能够更加注意老人的饮食习惯。",
    status: "处理完成",
    canViewProcess: true,
  },
});

// 是否有评价信息
const hasEvaluation = computed(() => !!taskData.value.evaluation);

// 是否有投诉反馈
const hasFeedback = computed(() => !!taskData.value.feedback);

// 获取护理方式样式类
const getNursingModeClass = (type: string) => {
  const classMap: Record<string, string> = {
    机构护理: "institution",
    居家护理: "home",
    社区护理: "community",
  };
  return classMap[type] || "";
};

// 获取服务状态样式类
const getServiceStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    服务中: "status-serving",
    待服务: "status-pending",
    服务完成: "status-completed",
  };
  return classMap[status] || "";
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 查看评估报告
const viewAssessmentReport = () => {
  uni.showToast({
    title: "查看评估报告",
    icon: "none",
  });
};

// 查看处理过程
const viewProcess = () => {
  uni.showToast({
    title: "查看处理过程",
    icon: "none",
  });
};
</script>

<template>
  <view class="task-details-page">
    <!-- 老人信息卡片 -->
    <view class="elderly-card">
      <view class="card-header">
        <view class="avatar">
          <text v-if="!taskData.elderly.avatar" class="avatar-text">头像</text>
          <image v-else :src="taskData.elderly.avatar" mode="aspectFill" />
        </view>
        <view class="elderly-info">
          <view class="info-header">
            <view class="info-row">
              <text class="name">{{ taskData.elderly.name }}</text>
            </view>
            <view
              class="nursing-mode-tag"
              :class="getNursingModeClass(taskData.elderly.serviceType)"
            >
              {{ taskData.elderly.serviceType }}
            </view>
          </view>
          <view class="info-subtitle">
            <text class="gender">{{ taskData.elderly.gender }}</text>
            <text class="divider">·</text>
            <text class="age">{{ taskData.elderly.age }}岁</text>
            <text class="divider">·</text>
            <text class="bed">床位 {{ taskData.elderly.bedNo }}</text>
          </view>
          <view class="tags">
            <text class="tag disability"
              >失能：{{ taskData.elderly.disabilityLevel }}</text
            >
            <text class="tag care-level">工单：{{ taskData.orderNo }}</text>
            <text
              class="tag service-status"
              :class="getServiceStatusClass(taskData.elderly.serviceStatus)"
              >{{ taskData.elderly.serviceStatus }}</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 服务时长 -->
    <view class="duration-bar" v-if="taskData.isTiming">
      <view class="timing-badge">
        <text class="dot"></text>
        <text>正在计时中</text>
      </view>
      <view class="duration-content">
        <view class="duration-row">
          <text class="duration-label">已服务时长</text>
          <text class="duration-value">{{ taskData.serviceDuration }}</text>
          <text class="duration-standard"
            >/{{ taskData.standardDuration }}min（标准服务时长）</text
          >
        </view>
      </view>
    </view>

    <!-- 服务项目 -->
    <view class="section">
      <view class="section-title">服务项目</view>
      <view class="service-table">
        <view class="table-header">
          <text class="th">服务项目</text>
          <text class="th">标准时长</text>
          <text class="th">金额(元)</text>
          <text class="th">类别</text>
        </view>
        <view
          class="table-row"
          v-for="item in taskData.serviceItems"
          :key="item.name"
        >
          <text class="td">{{ item.name }}</text>
          <text class="td">{{ item.duration }}</text>
          <text class="td">{{ item.price }}</text>
          <text class="td">{{ item.category }}</text>
        </view>
        <view class="table-row total">
          <text class="td">总计</text>
          <text class="td">{{ taskData.totalDuration }}</text>
          <text class="td">{{ taskData.totalPrice }}</text>
          <text class="td">-</text>
        </view>
      </view>
    </view>

    <!-- 缴费信息 -->
    <view class="section">
      <view class="section-title">
        缴费状态：
        <text
          class="payment-status"
          :class="{ unpaid: taskData.paymentStatus === '未缴费' }"
          >{{ taskData.paymentStatus }}</text
        >
      </view>
      <view class="payment-info">
        <view class="payment-item">
          <text class="label">预计费用：</text>
          <text class="value">¥{{ taskData.estimatedCost }}</text>
        </view>
        <view class="payment-item">
          <text class="label">优惠券：</text>
          <text class="value">¥{{ taskData.coupon }}</text>
        </view>
        <view class="payment-item">
          <text class="label">实际服务费用：</text>
          <text class="value highlight">¥{{ taskData.actualCost }}</text>
        </view>
      </view>
    </view>

    <!-- 服务过程 -->
    <view class="section">
      <view class="section-title">服务过程</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in taskData.serviceProcess"
          :key="index"
        >
          <view class="timeline-left">
            <view class="timeline-dot">{{ item.step }}</view>
            <view
              class="timeline-line"
              v-if="index < taskData.serviceProcess.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <view class="timeline-header">
              <text class="time">{{ item.time }}</text>
              <text class="title">{{ item.title }}</text>
              <div class="location">
                <uni-icons type="map-pin-ellipse" size="16" color="#1677FF" />
                {{ item.location }}
              </div>
            </view>
            <view class="timeline-body">
              <!-- 照片 -->
              <view class="photo-list" v-if="item.photos && item.photos.length">
                <image
                  v-for="(photo, pIndex) in item.photos"
                  :key="pIndex"
                  :src="photo"
                  mode="aspectFill"
                  class="photo-item"
                />
              </view>
              <!-- 录音 -->
              <view class="audio-player" v-if="item.audio">
                <view class="play-btn">▶</view>
                <view class="progress-bar">
                  <view class="progress-fill"></view>
                </view>
                <text class="audio-time">{{ item.audio.duration }}</text>
              </view>
              <!-- 记录 -->
              <view class="record-text" v-if="item.record">
                <text class="record-label">过程记录：</text>
                <text class="record-content">{{ item.record }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 健康采集数据 -->
    <view class="section">
      <view class="section-title">健康采集数据</view>
      <view class="health-list">
        <view class="health-item">
          <text class="health-label">血压</text>
          <text class="health-value"
            >{{ taskData.healthData.bloodPressure.value }}
            {{ taskData.healthData.bloodPressure.unit }}</text
          >
        </view>
        <view class="health-item">
          <text class="health-label">血糖</text>
          <view class="health-value-box">
            <text
              v-if="taskData.healthData.bloodSugar.status === 'high'"
              class="status-tag-high"
              >偏高</text
            >
            <text class="health-value"
              >{{ taskData.healthData.bloodSugar.value }}
              {{ taskData.healthData.bloodSugar.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">心率</text>
          <text class="health-value"
            >{{ taskData.healthData.heartRate.value }}
            {{ taskData.healthData.heartRate.unit }}</text
          >
        </view>
        <view class="health-item">
          <text class="health-label">血氧</text>
          <text class="health-value"
            >{{ taskData.healthData.bloodOxygen.value }}
            {{ taskData.healthData.bloodOxygen.unit }}</text
          >
        </view>
        <view class="health-item">
          <text class="health-label">体温</text>
          <text class="health-value"
            >{{ taskData.healthData.temperature.value }}
            {{ taskData.healthData.temperature.unit }}</text
          >
        </view>
      </view>
    </view>

    <!-- 评价信息 -->
    <view class="section" v-if="hasEvaluation">
      <view class="section-title">评价信息</view>
      <view class="evaluation-content">
        <view class="rating-row">
          <text class="rating-label">机构评价：</text>
          <view class="stars">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ active: i <= taskData.evaluation.orgRating }"
              >★</text
            >
          </view>
          <text class="rating-text">非常棒！</text>
        </view>
        <view class="rating-row">
          <text class="rating-label">人员评价：</text>
          <view class="stars">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ active: i <= taskData.evaluation.staffRating }"
              >★</text
            >
          </view>
          <text class="rating-text">非常棒！</text>
        </view>
        <view class="comment-box">
          <text class="comment-label">评价内容：</text>
          <text class="comment-text">{{ taskData.evaluation.content }}</text>
        </view>
      </view>
    </view>

    <!-- 投诉反馈信息 -->
    <view class="section" v-if="hasFeedback">
      <view class="section-title">投诉反馈信息</view>
      <view class="feedback-content">
        <view class="feedback-item">
          <text class="feedback-label">投诉反馈类型：</text>
          <text class="feedback-value">{{ taskData.feedback.type }}</text>
        </view>
        <view class="feedback-item">
          <text class="feedback-label">投诉反馈内容：</text>
          <text class="feedback-text">{{ taskData.feedback.content }}</text>
        </view>
        <view class="feedback-item">
          <text class="feedback-label">处理情况：</text>
          <text class="feedback-status">{{ taskData.feedback.status }}</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view style="height: 40rpx"></view>
  </view>
</template>

<style lang="scss" scoped>
.task-details-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 10rpx;

  // 服务时长
  .duration-bar {
    background-color: #fff;
    padding: 20rpx 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 20rpx;

    .timing-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 8rpx 16rpx;
      background-color: #f6ffed;
      border: 2rpx solid #b7eb8f;
      border-radius: 24rpx;
      font-size: 22rpx;
      color: #52c41a;

      .dot {
        width: 12rpx;
        height: 12rpx;
        background-color: #52c41a;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }
    }

    .duration-content {
      display: flex;
      flex-direction: column;
      align-items: center;

      .duration-row {
        display: flex;
        align-items: baseline;
        gap: 12rpx;

        .duration-label {
          font-size: 24rpx;
          color: #666;
        }

        .duration-value {
          font-size: 36rpx;
          color: #333;
          font-weight: 700;
        }

        .duration-standard {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  // 老人信息卡片
  .elderly-card {
    background-color: #fff;
    margin: 10rpx;
    border: 2rpx solid #0f172a14;
    border-radius: 16rpx;
    padding: 24rpx;

    .card-header {
      display: flex;
      gap: 20rpx;
      padding-bottom: 10rpx;
      margin-bottom: 20rpx;

      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .avatar-text {
          font-size: 24rpx;
          color: #999;
        }

        image {
          width: 100%;
          height: 100%;
        }
      }

      .elderly-info {
        flex: 1;

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;

          .info-row {
            display: flex;
            align-items: center;

            .name {
              font-size: 36rpx;
              color: #333;
              font-weight: 600;
            }
          }

          .nursing-mode-tag {
            padding: 4rpx 16rpx;
            background-color: #e6f7ff;
            color: #1677ff;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.institution {
              background-color: #e6f7ff;
              color: #1677ff;
            }

            &.home {
              background-color: #f6ffed;
              color: #52c41a;
            }

            &.community {
              background-color: #fff7e6;
              color: #fa8c16;
            }
          }
        }

        .info-subtitle {
          display: flex;
          align-items: center;
          gap: 8rpx;
          margin-bottom: 16rpx;

          .gender,
          .age,
          .bed {
            font-size: 24rpx;
            color: #666;
          }

          .divider {
            font-size: 24rpx;
            color: #999;
          }
        }

        .tags {
          display: flex;
          gap: 12rpx;

          .tag {
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.disability {
              background-color: #f5f5f5;
              color: #666;
            }

            &.care-level {
              background-color: #f5f5f5;
              color: #666;
            }

            &.service-status {
              background-color: #e6f7ff;
              color: #1677ff;

              &.status-serving {
                background-color: #e6f7ff;
                color: #1677ff;
              }

              &.status-pending {
                background-color: #fff7e6;
                color: #fa8c16;
              }

              &.status-completed {
                background-color: #f6ffed;
                color: #52c41a;
              }
            }
          }
        }
      }
    }
  }

  // 通用区块
  .section {
    background-color: #fff;
    margin: 0 10rpx 20rpx 10rpx;
    border: 2rpx solid #0f172a14;
    border-radius: 16rpx;
    padding: 24rpx;

    .section-title {
      font-size: 30rpx;
      color: #333;
      font-weight: 600;
      margin-bottom: 20rpx;

      .payment-status {
        font-size: 28rpx;
        font-weight: normal;

        &.unpaid {
          color: #ff4d4f;
        }
      }
    }

    // 服务项目表格
    .service-table {
      .table-header {
        display: flex;
        background-color: #f5f5f5;
        padding: 16rpx 0;
        border-radius: 8rpx;
        margin-bottom: 12rpx;

        .th {
          flex: 1;
          text-align: center;
          font-size: 24rpx;
          color: #666;
          font-weight: 500;
        }
      }

      .table-row {
        display: flex;
        padding: 16rpx 0;
        border-bottom: 2rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        &.total {
          .td {
            font-weight: 600;
            color: #333;
          }
        }

        .td {
          flex: 1;
          text-align: center;
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    // 缴费信息
    .payment-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .payment-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .label {
          font-size: 26rpx;
          color: #666;
        }

        .value {
          font-size: 28rpx;
          color: #333;
          font-weight: 600;

          &.highlight {
            color: #ff4d4f;
          }
        }
      }
    }

    // 时间轴
    .timeline {
      .timeline-item {
        display: flex;
        gap: 20rpx;

        .timeline-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40rpx;

          .timeline-dot {
            width: 40rpx;
            height: 40rpx;
            border-radius: 50%;
            background-color: #1677ff;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22rpx;
            font-weight: 600;
          }

          .timeline-line {
            width: 2rpx;
            flex: 1;
            background-color: #e0e0e0;
            margin: 8rpx 0;
          }
        }

        .timeline-content {
          flex: 1;
          padding-bottom: 30rpx;

          .timeline-header {
            margin-bottom: 16rpx;

            .time {
              font-size: 24rpx;
              color: #999;
              margin-right: 16rpx;
            }

            .title {
              font-size: 26rpx;
              color: #333;
              font-weight: 500;
              margin-right: 16rpx;
            }

            .location {
              font-size: 22rpx;
              color: #1677ff;
            }
          }

          .timeline-body {
            .photo-list {
              display: flex;
              gap: 12rpx;
              margin-bottom: 16rpx;

              .photo-item {
                width: 120rpx;
                height: 120rpx;
                border-radius: 8rpx;
                background-color: #f0f0f0;
              }
            }

            .audio-player {
              display: flex;
              align-items: center;
              gap: 12rpx;
              padding: 12rpx 16rpx;
              background-color: #f5f5f5;
              border-radius: 8rpx;
              margin-bottom: 16rpx;

              .play-btn {
                width: 48rpx;
                height: 48rpx;
                background: linear-gradient(135deg, #52c41a, #389e0d);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 20rpx;
              }

              .progress-bar {
                flex: 1;
                height: 6rpx;
                background-color: #e0e0e0;
                border-radius: 3rpx;
                overflow: hidden;

                .progress-fill {
                  width: 30%;
                  height: 100%;
                  background: linear-gradient(90deg, #52c41a, #95de64);
                  border-radius: 3rpx;
                }
              }

              .audio-time {
                font-size: 20rpx;
                color: #999;
              }
            }

            .record-text {
              font-size: 24rpx;
              color: #666;

              .record-label {
                color: #333;
                font-weight: 500;
              }
            }
          }
        }
      }
    }

    // 健康数据
    .health-list {
      .health-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 2rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .health-label {
          font-size: 28rpx;
          color: #666;
        }

        .health-value-box {
          display: flex;
          align-items: center;
          gap: 12rpx;
        }

        .health-value {
          font-size: 30rpx;
          color: #333;
          font-weight: 600;
        }

        .status-tag-high {
          padding: 4rpx 12rpx;
          background-color: #fff2f0;
          color: #ff4d4f;
          border-radius: 8rpx;
          font-size: 22rpx;
        }
      }
    }

    // 评价信息
    .evaluation-content {
      .rating-row {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 16rpx;

        .rating-label {
          font-size: 26rpx;
          color: #666;
        }

        .stars {
          display: flex;
          gap: 8rpx;

          .star {
            font-size: 32rpx;
            color: #e0e0e0;

            &.active {
              color: #ff9500;
            }
          }
        }

        .rating-text {
          font-size: 26rpx;
          color: #ff9500;
          font-weight: 600;
        }
      }

      .comment-box {
        margin-top: 20rpx;
        padding: 20rpx;
        background-color: #f8f8f8;
        border-radius: 12rpx;

        .comment-label {
          display: block;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
        }

        .comment-text {
          font-size: 26rpx;
          color: #333;
          line-height: 1.6;
        }
      }
    }

    // 投诉反馈
    .feedback-content {
      .feedback-item {
        margin-bottom: 16rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .feedback-label {
          font-size: 26rpx;
          color: #666;
          margin-right: 8rpx;
        }

        .feedback-value {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }

        .feedback-text {
          display: block;
          margin-top: 12rpx;
          font-size: 26rpx;
          color: #333;
          line-height: 1.6;
        }

        .feedback-status {
          font-size: 26rpx;
          color: #52c41a;
          font-weight: 600;
          margin-right: 16rpx;
        }
      }
    }
  }
}
</style>
