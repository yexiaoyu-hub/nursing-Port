// 服务开始标签页组件
<script setup lang="ts">
import { ref } from "vue";
import AbnormalAction from "@/components/AbnormalAction.vue";

const emit = defineEmits<{
  (e: "next-step"): void;
}>();

// 打卡状态
const checkInStatus = ref<"idle" | "loading" | "success">("idle");
const locationInfo = ref("");

// 身份验证方式
const authType = ref<"face" | "password">("face");

// 照片列表
const photos = ref<string[]>([]);

// 录音状态
const isRecording = ref(false);
const recordingTime = ref(0);
const hasRecorded = ref(false);
const audioDuration = ref("00:04");

// 服务信息
const serviceInfo = {
  name: "王大锤",
  serviceType: "生活照料服务",
  duration: "1分钟",
  cost: "0.10",
  subsidy: "0.04",
  selfPay: "0.06",
};

// 格式化录音时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// 获取定位并打卡
const handleCheckIn = () => {
  checkInStatus.value = "loading";
  setTimeout(() => {
    checkInStatus.value = "success";
    locationInfo.value = "北京市朝阳区XX街道XX号 (GPS定位成功)";
  }, 1500);
};

// 切换身份验证方式
const switchAuthType = (type: "face" | "password") => {
  authType.value = type;
};

// 人脸识别
const handleFaceRecognition = () => {
  uni.showToast({
    title: "人脸识别中...",
    icon: "loading",
  });
};

// 密码确认
const handlePasswordConfirm = () => {
  uni.showToast({
    title: "密码确认中...",
    icon: "loading",
  });
};

// 拍照
const handleTakePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["camera"],
    success: (res) => {
      if (photos.value.length < 3) {
        photos.value.push(res.tempFilePaths[0]);
      }
    },
  });
};

// 删除照片
const removePhoto = (index: number) => {
  photos.value.splice(index, 1);
};

// 播放语音播报
const playVoice = () => {
  uni.showToast({
    title: "播放语音...",
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
    // 模拟录音计时
    const timer = setInterval(() => {
      if (!isRecording.value) {
        clearInterval(timer);
        return;
      }
      recordingTime.value++;
    }, 1000);
  }
};

// 完成并进入服务中
const handleComplete = () => {
  emit("next-step");
};

// 异常上报
const handleAbnormalReport = () => {
  uni.navigateTo({
    url: "/pages/serviceExecute/otherEntrances/serviceFailure",
  });
};

// 转交任务
const handleTransferTask = () => {
  uni.navigateTo({
    url: "/pages/serviceExecute/otherEntrances/handover",
  });
};
</script>

<template>
  <view class="service-start-tab">
    <!-- 1) 到达打卡 -->
    <view class="section">
      <view class="section-title">1) 到达打卡 (GPS定位≤10米并与地址比对)</view>
      <view
        class="location-box"
        :class="{ success: checkInStatus === 'success' }"
      >
        <text v-if="!locationInfo" class="location-placeholder"
          >点击按钮获取定位</text
        >
        <text v-else class="location-text">{{ locationInfo }}</text>
      </view>
      <view
        class="btn-checkin"
        :class="{ success: checkInStatus === 'success' }"
        @click="handleCheckIn"
      >
        <text v-if="checkInStatus === 'idle'">获取定位并打卡</text>
        <text v-else-if="checkInStatus === 'loading'">定位中...</text>
        <text v-else>已打卡</text>
      </view>
    </view>

    <!-- 2) 身份验证 -->
    <view class="section">
      <view class="section-title">2) 身份验证 (人脸识别/密码确认)</view>
      <view class="auth-tabs">
        <view
          class="auth-tab"
          :class="{ active: authType === 'face' }"
          @click="switchAuthType('face')"
        >
          人脸识别
        </view>
        <view
          class="auth-tab"
          :class="{ active: authType === 'password' }"
          @click="switchAuthType('password')"
        >
          密码确认
        </view>
      </view>
      <view class="auth-content">
        <view
          v-if="authType === 'face'"
          class="auth-btn"
          @click="handleFaceRecognition"
        >
          开始人脸识别
        </view>
        <view v-else class="auth-btn" @click="handlePasswordConfirm">
          输入密码确认
        </view>
      </view>
    </view>

    <!-- 3) 服务对象拍照确认 -->
    <view class="section">
      <view class="section-title">3) 服务对象拍照确认</view>
      <view class="photo-list">
        <view
          v-for="(photo, index) in photos"
          :key="index"
          class="photo-item"
          :style="{ backgroundImage: `url(${photo})` }"
        >
          <view class="photo-remove" @click="removePhoto(index)">×</view>
        </view>
        <view
          v-if="photos.length < 3"
          class="photo-item add"
          @click="handleTakePhoto"
        >
          <text class="add-icon">+</text>
          <text class="add-text">拍照</text>
        </view>
      </view>
    </view>

    <!-- 4) 服务前录音 -->
    <view class="section">
      <view class="section-title">4) 服务前录音</view>
      <view class="voice-box">
        <view class="voice-content">
          <view class="voice-icon" @click="playVoice">
            <text class="play-icon">▶</text>
          </view>
          <view class="voice-text">
            {{ serviceInfo.name }}先生，您本次的服务内容是:{{
              serviceInfo.serviceType
            }};服务时长约:{{ serviceInfo.duration }};费用{{
              serviceInfo.cost
            }}元，可享受补贴{{ serviceInfo.subsidy }}元，您自己只需支付{{
              serviceInfo.selfPay
            }}元。
          </view>
        </view>
      </view>

      <!-- 录音播放器 -->
      <view v-if="hasRecorded" class="audio-player">
        <view class="play-btn" @click="playVoice">
          <text class="play-icon-small">▶</text>
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

    <!-- 完成按钮 -->
    <view class="btn-complete" @click="handleComplete"> 完成并进入服务中 </view>

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
.service-start-tab {
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

    // 打卡区域
    .location-box {
      background-color: #f0f7ff;
      border-radius: 12rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      min-height: 100rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.success {
        background-color: #f6ffed;
        border: 1rpx solid #b7eb8f;
      }

      .location-placeholder {
        color: #999;
        font-size: 26rpx;
      }

      .location-text {
        color: #52c41a;
        font-size: 26rpx;
      }
    }

    .btn-checkin {
      width: 100%;
      height: 80rpx;
      background-color: #ffffff;
      color: #1677ff;
      border: 2rpx solid #1677ff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 600;

      &.success {
        color: #fff;
        background-color: #52c41a;
        border: none;
      }
    }

    // 身份验证
    .auth-tabs {
      display: flex;
      gap: 20rpx;
      margin-bottom: 20rpx;

      .auth-tab {
        flex: 1;
        height: 70rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20rpx;
        font-size: 26rpx;
        background-color: #f5f5f5;
        color: #666;

        &.active {
          background-color: #1677ff;
          color: #fff;
        }
      }
    }

    .auth-content {
      .auth-btn {
        width: 100%;
        height: 80rpx;
        background-color: #f0f7ff;
        color: #1677ff;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        border: 2rpx dashed #1677ff;
      }
    }

    // 拍照区域
    .photo-list {
      display: flex;
      gap: 20rpx;

      .photo-item {
        width: 180rpx;
        height: 180rpx;
        border-radius: 12rpx;
        background-size: cover;
        background-position: center;
        position: relative;
        border: 2rpx solid #eee;

        &.add {
          background-color: #f5f5f5;
          border: 2rpx dashed #ccc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .add-icon {
            font-size: 48rpx;
            color: #999;
            margin-bottom: 8rpx;
          }

          .add-text {
            font-size: 24rpx;
            color: #999;
          }
        }

        .photo-remove {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
          width: 36rpx;
          height: 36rpx;
          background-color: #ff4d4f;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24rpx;
        }
      }
    }

    // 语音播报
    .voice-box {
      background-color: #f0f7ff;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;
      border-left: 6rpx solid #1677ff;

      .voice-content {
        display: flex;
        gap: 16rpx;

        .voice-icon {
          width: 60rpx;
          height: 60rpx;
          background-color: #1677ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .play-icon {
            color: #fff;
            font-size: 24rpx;
          }
        }

        .voice-text {
          flex: 1;
          font-size: 26rpx;
          color: #333;
          line-height: 1.6;
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

        .play-icon-small {
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

  // 异常入口
}
</style>
