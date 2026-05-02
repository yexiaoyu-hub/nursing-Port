// 任务详情页
<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getServiceHistoryDetail } from "@/api/history/history.js";
import { getAgedDetail } from "@/api/older/older.js";
import { getServiceOrderHealth } from "@/api/service/order.js";

// 页面参数
const orderId = ref<number>(0);
const loading = ref(false);

// 页面数据
const taskData = ref({
  // 工单基础信息
  code: "",
  status: "",
  isTiming: false,
  serviceDuration: "",
  standardDuration: 0,

  // 老人信息
  elderlyInfo: {
    name: "",
    disabilityLevel: "",
    bedNo: "",
    serviceStatus: "",
    hasAssessmentReport: false,
    serviceType: "",
  },

  // 服务项目
  serviceItemList: [],
  totalDuration: "",
  totalPrice: 0,

  // 服务过程
  serviceProcessList: [],

  // 健康采集数据
  healthData: {
    bloodPressure: {
      systolic: 0,
      diastolic: 0,
      unit: "mmHg",
      status: "normal",
    },
    bloodSugar: { value: 0, unit: "mmol/L", status: "normal" },
    heartRate: { value: 0, unit: "bpm", status: "normal" },
    bloodOxygen: { value: 0, unit: "SpO2", status: "normal" },
  },

  // 评价信息（可选）
  evaluation: null,

  // 投诉反馈信息（可选）
  feedback: null,
});

// 获取任务详情
const fetchTaskDetail = async () => {
  if (!orderId.value) {
    return;
  }

  loading.value = true;
  try {
    const res = await getServiceHistoryDetail(orderId.value);

    // 接口直接返回数据对象
    const data = res;
    if (data && data.id) {
      // 映射接口数据到页面数据
      taskData.value = {
        // 工单基础信息
        code: data.orderNo || "",
        status: getStatusText(data.status),
        isTiming: data.status === 2, // 执行中
        serviceDuration: formatDuration(data.serTime),
        standardDuration: data.orderSerTimes || 0,

        // 老人信息
        elderlyInfo: {
          name: data.agedName || "",
          gender: data.agedSex === "1" ? "男" : "女",
          serviceStatus: getServiceStatus(data.status),
          hasAssessmentReport: false,
          serviceType: getNursingType(data.nursingType),
        },

        // 服务项目
        serviceItemList: (data.projects || []).map((item: any) => ({
          name: item.projectName || "",
          duration: `${item.serTimes || 0} min/${item.unit || "min"}`,
          price: item.price || 0,
          category: item.cateName || "",
        })),
        totalDuration: `${data.orderSerTimes || 0}min`,
        totalPrice: data.orderAmount || 0,

        // 服务过程（暂无接口数据，留空）
        serviceProcessList: [],

        // 健康采集数据
        healthData: {
          bloodPressure: {
            systolic: 0,
            diastolic: 0,
            unit: "mmHg",
            status: "normal",
          },
          bloodSugar: { value: 0, unit: "mmol/L", status: "normal" },
          heartRate: { value: 0, unit: "bpm", status: "normal" },
          bloodOxygen: { value: 0, unit: "SpO2", status: "normal" },
        },

        // 评价信息（暂无接口数据）
        evaluation: null,

        // 投诉反馈信息（暂无接口数据）
        feedback: null,
      };

      // 获取老人详细信息补充数据
      let agedDetailId = null;
      if (data.agedId) {
        agedDetailId = await fetchAgedDetail(data.agedId);
      }

      // 获取服务健康采集记录（使用老人的 id）
      if (agedDetailId) {
        await fetchServiceOrderHealth(agedDetailId);
      }
    }
  } catch (error) {
    uni.showToast({ title: "获取详情失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 状态码转文本
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "待执行",
    1: "待执行",
    2: "执行中",
    3: "已完成",
    4: "已取消",
  };
  return map[status] || "未知";
};

// 获取服务状态
const getServiceStatus = (status: number) => {
  if (status === 2) return "服务中";
  if (status === 3) return "服务完成";
  return "待服务";
};

// 护理方式转文本
const getNursingType = (type: string) => {
  const map: Record<string, string> = {
    "1": "机构护理",
    "2": "居家护理",
    "3": "社区护理",
  };
  return map[type] || "机构护理";
};

// 格式化时长（秒转时分秒）
const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
};

// 失能等级字典映射
const disabilityLevelMap: Record<string, string> = {
  "0": "基本正常",
  "1": "轻度失能",
  "2": "中度失能",
  "3": "重度失能 I级",
  "4": "重度失能 II级",
  "5": "重度失能 III级",
};

// 获取失能等级文本
const getDisabilityLevelText = (level: string | number) => {
  return disabilityLevelMap[String(level)] || "";
};

// 获取老人详细信息
const fetchAgedDetail = async (agedId: number) => {
  try {
    const res = await getAgedDetail(agedId);
    if (res) {
      // 更新老人信息
      taskData.value.elderlyInfo.age = res.age;
      taskData.value.elderlyInfo.disabilityLevel = getDisabilityLevelText(
        res.shinengLevelid
      );
      taskData.value.elderlyInfo.bedNo = res.juzhuAddress || "";
      taskData.value.elderlyInfo.avatar = res.photo || "";
      // 返回老人的 id 用于获取健康采集记录
      return res.id;
    }
  } catch (error) {
    console.error("获取老人详情失败:", error);
  }
  return null;
};

// 获取服务健康采集记录
const fetchServiceOrderHealth = async (orderId: number) => {
  try {
    const res = await getServiceOrderHealth(orderId);
    if (!res) {
      return;
    }
    const data = res.data || res;
    if (data && data.id) {
      // 更新健康采集数据 - 使用服务健康采集记录
      taskData.value.healthData = {
        bloodPressure: {
          systolic: data.shousuoya || 0,
          diastolic: data.shuzhangya || 0,
          unit: "mmHg",
          status:
            data.shousuoya > 140 || data.shuzhangya > 90
              ? "high"
              : data.shousuoya < 90 || data.shuzhangya < 60
              ? "low"
              : "normal",
        },
        bloodSugar: {
          value: data.xuetang || 0,
          unit: "mmol/L",
          status:
            data.xuetang > 6.1 ? "high" : data.xuetang < 3.9 ? "low" : "normal",
        },
        heartRate: {
          value: data.heartRate || 0,
          unit: "bpm",
          status:
            data.heartRate > 100
              ? "high"
              : data.heartRate < 60
              ? "low"
              : "normal",
        },
        bloodOxygen: {
          value: data.xueyang || 0,
          unit: "SpO2",
          status: data.xueyang < 95 ? "low" : "normal",
        },
      };
    }
  } catch (error) {
    console.error("获取服务健康采集记录失败:", error);
  }
};

// 页面加载
onLoad((options) => {
  if (options?.id) {
    orderId.value = Number(options.id);
    fetchTaskDetail();
  }
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
          <text v-if="!taskData.elderlyInfo.avatar" class="avatar-text"
            >头像</text
          >
          <image v-else :src="taskData.elderlyInfo.avatar" mode="aspectFill" />
        </view>
        <view class="elderly-info">
          <view class="info-header">
            <view class="info-row">
              <text class="name">{{ taskData.elderlyInfo.name }}</text>
            </view>
            <view
              class="nursing-mode-tag"
              :class="getNursingModeClass(taskData.elderlyInfo.serviceType)"
            >
              {{ taskData.elderlyInfo.serviceType }}
            </view>
          </view>
          <view class="info-subtitle">
            <text class="gender">{{ taskData.elderlyInfo.gender }}</text>
            <text class="divider">·</text>
            <text class="age">{{ taskData.elderlyInfo.age }}岁</text>
            <text class="divider">·</text>
            <text class="bed">床位 {{ taskData.elderlyInfo.bedNo }}</text>
          </view>
          <view class="tags">
            <text class="tag disability"
              >失能：{{ taskData.elderlyInfo.disabilityLevel }}</text
            >
            <text class="tag care-level">工单：{{ taskData.code }}</text>
            <text
              class="tag service-status"
              :class="getServiceStatusClass(taskData.elderlyInfo.serviceStatus)"
              >{{ taskData.elderlyInfo.serviceStatus }}</text
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
            >/ {{ taskData.standardDuration }} min（标准服务时长）</text
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
          v-for="item in taskData.serviceItemList"
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

    <!-- 服务过程 -->
    <view class="section">
      <view class="section-title">服务过程</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in taskData.serviceProcessList"
          :key="index"
        >
          <view class="timeline-left">
            <view class="timeline-dot">{{ item.step }}</view>
            <view
              class="timeline-line"
              v-if="index < taskData.serviceProcessList.length - 1"
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
          <view class="health-value-box">
            <text
              v-if="taskData.healthData.bloodPressure.status === 'high'"
              class="status-tag-high"
              >偏高</text
            >
            <text
              v-else-if="taskData.healthData.bloodPressure.status === 'low'"
              class="status-tag-low"
              >偏低</text
            >
            <text v-else class="status-tag-normal">正常</text>
            <text class="health-value"
              >{{ taskData.healthData.bloodPressure.systolic }}/{{
                taskData.healthData.bloodPressure.diastolic
              }}
              {{ taskData.healthData.bloodPressure.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">血糖</text>
          <view class="health-value-box">
            <text
              v-if="taskData.healthData.bloodSugar.status === 'high'"
              class="status-tag-high"
              >偏高</text
            >
            <text
              v-else-if="taskData.healthData.bloodSugar.status === 'low'"
              class="status-tag-low"
              >偏低</text
            >
            <text v-else class="status-tag-normal">正常</text>
            <text class="health-value"
              >{{ taskData.healthData.bloodSugar.value }}
              {{ taskData.healthData.bloodSugar.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">心率</text>
          <view class="health-value-box">
            <text
              v-if="taskData.healthData.heartRate.status === 'high'"
              class="status-tag-high"
              >偏高</text
            >
            <text
              v-else-if="taskData.healthData.heartRate.status === 'low'"
              class="status-tag-low"
              >偏低</text
            >
            <text v-else class="status-tag-normal">正常</text>
            <text class="health-value"
              >{{ taskData.healthData.heartRate.value }}
              {{ taskData.healthData.heartRate.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">血氧饱和度</text>
          <view class="health-value-box">
            <text
              v-if="taskData.healthData.bloodOxygen.status === 'low'"
              class="status-tag-low"
              >偏低</text
            >
            <text v-else class="status-tag-normal">正常</text>
            <text class="health-value"
              >{{ taskData.healthData.bloodOxygen.value }}
              {{ taskData.healthData.bloodOxygen.unit }}</text
            >
          </view>
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

        .status-tag-low {
          padding: 4rpx 12rpx;
          background-color: #e6f7ff;
          color: #1890ff;
          border-radius: 8rpx;
          font-size: 22rpx;
        }

        .status-tag-normal {
          padding: 4rpx 12rpx;
          background-color: #f6ffed;
          color: #52c41a;
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
