// 服务中标签页组件
<script setup lang="ts">
import { ref, computed } from "vue";
import AbnormalAction from "@/components/AbnormalAction.vue";

const emit = defineEmits<{
  (e: "next-step"): void;
}>();

// 服务项目列表
const serviceItems = ref([
  { id: 1, name: "晨间清洁", icon: "🧼", sopUrl: "/pages/sop/cleaning" },
  { id: 2, name: "血压测量", icon: "🩺", sopUrl: "/pages/sop/bloodPressure" },
  { id: 3, name: "关节活动", icon: "🦵", sopUrl: "/pages/sop/exercise" },
]);

// 录音状态
const isRecording = ref(false);
const recordingTime = ref(0);
const hasRecorded = ref(false);
const audioDuration = ref("00:04");

// 过程记录
const processRecord = ref("");

// 健康指标
const healthData = ref({
  bloodPressure: "",
  temperature: "",
});

// 服务计时
const serviceDuration = ref(854); // 秒数，示例：14分14秒
const plannedDuration = 40; // 计划时长（分钟）
const isTiming = ref(true);

// 格式化时间显示
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
};

// 格式化录音时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// 查看SOP
const viewSOP = (item: any) => {
  uni.navigateTo({
    url: item.sopUrl,
  });
};

// 播放录音
const playRecording = () => {
  uni.showToast({
    title: "播放录音...",
    icon: "none",
  });
};

// 开始/停止录音
const toggleRecording = () => {
  if (isRecording.value) {
    isRecording.value = false;
    hasRecorded.value = true;
  } else {
    isRecording.value = true;
    recordingTime.value = 0;
    const timer = setInterval(() => {
      if (!isRecording.value) {
        clearInterval(timer);
        return;
      }
      recordingTime.value++;
    }, 1000);
  }
};

// 完成并进入服务结束
const handleComplete = () => {
  // 检查服务时长是否达到计划的80%
  const actualMinutes = serviceDuration.value / 60;
  const minRequiredMinutes = plannedDuration * 0.8;

  if (actualMinutes < minRequiredMinutes) {
    uni.showModal({
      title: "提示",
      content: "服务时间不够，是否继续结束？",
      success: (res) => {
        if (res.confirm) {
          emit("next-step");
        }
      },
    });
  } else {
    emit("next-step");
  }
};

// 异常上报
const handleAbnormalReport = () => {
  uni.showToast({
    title: "异常上报",
    icon: "none",
  });
};

// 转交任务
const handleTransferTask = () => {
  uni.showToast({
    title: "转交任务",
    icon: "none",
  });
};

// 启动计时器
setInterval(() => {
  if (isTiming.value) {
    serviceDuration.value++;
  }
}, 1000);
</script>

<template>
  <view class="service-second-tab">
    <!-- 1) 服务项目 -->
    <view class="section">
      <view class="section-title">1) 本次服务项目（点击查看SOP）</view>
      <view class="service-items">
        <view
          v-for="item in serviceItems"
          :key="item.id"
          class="service-item"
          @click="viewSOP(item)"
        >
          <text class="item-icon">{{ item.icon }}</text>
          <text class="item-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 2) 服务过程录音 -->
    <view class="section">
      <view class="section-title">2) 服务过程录音</view>
      <!-- 录音播放器 -->
      <view v-if="hasRecorded" class="audio-player">
        <view class="play-btn" @click="playRecording">
          <text class="play-icon">▶</text>
        </view>
        <view class="audio-progress">
          <view class="progress-bar">
            <view class="progress-fill"></view>
          </view>
        </view>
        <text class="audio-time">00:00/{{ audioDuration }}</text>
      </view>

      <!-- 录音按钮 -->
      <view
        class="btn-record"
        :class="{ recording: isRecording }"
        @click="toggleRecording"
      >
        <text class="record-icon">🎙</text>
        <text v-if="isRecording"> 录音中 {{ formatTime(recordingTime) }} </text>
        <text v-else-if="hasRecorded">重新录音</text>
        <text v-else>开始录音</text>
      </view>
    </view>

    <!-- 3) 过程记录 -->
    <view class="section">
      <view class="section-title">3) 过程记录</view>
      <textarea
        v-model="processRecord"
        class="process-textarea"
        placeholder="记录关键操作及老人反应..."
        maxlength="500"
      />
    </view>

    <!-- 4) 健康指标录入 -->
    <view class="section">
      <view class="section-title">4) 健康指标录入</view>
      <view class="health-form">
        <view class="form-item">
          <text class="form-label">血压</text>
          <input
            v-model="healthData.bloodPressure"
            class="form-input"
            placeholder="如 120/80 mmHg"
          />
        </view>
        <view class="form-item">
          <text class="form-label">体温</text>
          <input
            v-model="healthData.temperature"
            class="form-input"
            placeholder="如 36.5 ℃"
          />
        </view>
      </view>
    </view>

    <!-- 服务时长 -->
    <view class="section">
      <view class="section-title">服务时长</view>
      <view class="duration-box">
        <text class="duration-label"
          >计划服务时长 {{ plannedDuration }} 分钟</text
        >
        <text class="duration-time">{{ formatDuration(serviceDuration) }}</text>
        <view class="duration-status">
          <text class="status-dot"></text>
          <text class="status-text">正在计时</text>
        </view>
      </view>
      <text class="duration-rule">
        规则：实际时长不足计划80%时提示"服务时间不够"。（原型：按钮触发提示）
      </text>
    </view>

    <!-- 完成按钮 -->
    <view class="btn-complete" @click="handleComplete">
      完成并进入服务结束
    </view>

    <!-- 服务转交/异常入口 -->
    <AbnormalAction
      @abnormal-report="handleAbnormalReport"
      @transfer-task="handleTransferTask"
    />

    <!-- 底部安全区域 -->
    <view style="height: 40rpx"></view>
  </view>
</template>

<style lang="scss" scoped>
.service-second-tab {
  padding: 20rpx;

  .section {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 20rpx;
    }

    // 服务项目
    .service-items {
      display: flex;
      gap: 20rpx;
      flex-wrap: wrap;

      .service-item {
        width: 180rpx;
        height: 180rpx;
        background-color: #f5f5f5;
        border: 2rpx dashed #ccc;
        border-radius: 12rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12rpx;

        .item-icon {
          font-size: 48rpx;
        }

        .item-name {
          font-size: 26rpx;
          color: #333;
        }
      }
    }

    // 录音播放器
    .audio-player {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 20rpx;
      padding: 16rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;

      .play-btn {
        width: 60rpx;
        height: 60rpx;
        background: linear-gradient(135deg, #52c41a, #389e0d);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .play-icon {
          color: #fff;
          font-size: 24rpx;
        }
      }

      .audio-progress {
        flex: 1;

        .progress-bar {
          height: 6rpx;
          background-color: #e0e0e0;
          border-radius: 3rpx;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            width: 30%;
            background: linear-gradient(90deg, #52c41a, #95de64);
            border-radius: 3rpx;
          }
        }
      }

      .audio-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    // 录音按钮
    .btn-record {
      width: 100%;
      height: 80rpx;
      background-color: #fff;
      border: 2rpx solid #ddd;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      font-size: 28rpx;
      color: #333;

      &.recording {
        background-color: #fff2f0;
        border-color: #ff4d4f;
        color: #ff4d4f;
      }

      .record-icon {
        font-size: 32rpx;
      }
    }

    // 过程记录
    .process-textarea {
      width: 100%;
      height: 160rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;
      padding: 20rpx;
      font-size: 26rpx;
      color: #333;
      box-sizing: border-box;
    }

    // 健康指标表单
    .health-form {
      .form-item {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .form-label {
          width: 100rpx;
          font-size: 28rpx;
          color: #333;
        }

        .form-input {
          flex: 1;
          height: 70rpx;
          background-color: #f5f5f5;
          border-radius: 12rpx;
          padding: 0 20rpx;
          font-size: 26rpx;
          color: #333;
        }
      }
    }

    // 服务时长
    .duration-box {
      background-color: #f0f7ff;
      border-radius: 16rpx;
      padding: 30rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16rpx;

      .duration-label {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .duration-time {
        font-size: 56rpx;
        font-weight: 700;
        color: #333;
        margin-bottom: 12rpx;
      }

      .duration-status {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .status-dot {
          width: 12rpx;
          height: 12rpx;
          background-color: #52c41a;
          border-radius: 50%;
        }

        .status-text {
          font-size: 24rpx;
          color: #52c41a;
        }
      }
    }

    .duration-rule {
      font-size: 22rpx;
      color: #999;
      line-height: 1.5;
    }
  }

  // 完成按钮
  .btn-complete {
    width: 100%;
    height: 90rpx;
    background-color: #1677ff;
    color: #fff;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
    margin: 30rpx 0;
  }
}
</style>
