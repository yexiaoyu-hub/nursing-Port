// 服务结束标签页组件
<script setup lang="ts">
import { ref, computed } from "vue";
import AbnormalAction from "@/components/AbnormalAction.vue";

const emit = defineEmits<{
  (e: "next-step"): void;
}>();

// 照片列表
const photos = ref<string[]>([]);

// 录音状态
const isRecording = ref(false);
const recordingTime = ref(0);
const hasRecorded = ref(false);
const audioDuration = ref("00:04");

// 过程总结
const summary = ref("");

// 服务时长数据
const actualDuration = ref(1940); // 秒数，示例：32分20秒
const plannedDuration = 40; // 计划时长（分钟）

// 计算完成百分比
const completionPercent = computed(() => {
  const actualMinutes = actualDuration.value / 60;
  return Math.min(Math.round((actualMinutes / plannedDuration) * 100), 100);
});

// 格式化时间显示（MM:SS）
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// 格式化录音时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
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

// 下一步
const handleNext = () => {
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
  <view class="service-end-tab">
    <!-- 1) 服务后拍照 -->
    <view class="section">
      <view class="section-title">1) 服务后拍照</view>
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
        </view>
      </view>
    </view>

    <!-- 2) 服务后录音 -->
    <view class="section">
      <view class="section-title">2) 服务后录音</view>
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

    <!-- 3) 过程后总结 -->
    <view class="section">
      <view class="section-title">3) 过程后总结</view>
      <textarea
        v-model="summary"
        class="process-textarea"
        placeholder="记录关键操作及老人反应..."
        maxlength="500"
      />
    </view>

    <!-- 服务时长 -->
    <view class="section">
      <view class="section-title">服务时长</view>
      <view class="duration-box">
        <view class="duration-content">
          <view class="duration-left">
            <text class="duration-value">{{
              formatDuration(actualDuration)
            }}</text>
            <text class="duration-label">实际时长</text>
          </view>
          <view class="duration-right">
            <text class="duration-value">{{ plannedDuration }}分钟</text>
            <text class="duration-label">计划时长</text>
          </view>
        </view>
        <view class="duration-progress">
          <view class="progress-bg">
            <view
              class="progress-fill"
              :style="{ width: completionPercent + '%' }"
            ></view>
          </view>
          <text class="progress-text">{{ completionPercent }}%</text>
        </view>
      </view>
    </view>

    <!-- 下一步按钮 -->
    <view class="btn-next" @click="handleNext"> 下一步 </view>

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
.service-end-tab {
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

    // 过程总结
    .process-textarea {
      width: 100%;
      height: 160rpx;
      background-color: #fff;
      border: 2rpx solid #ddd;
      border-radius: 12rpx;
      padding: 20rpx;
      font-size: 26rpx;
      color: #333;
      box-sizing: border-box;
    }

    // 服务时长
    .duration-box {
      background-color: #f8f9fa;
      border-radius: 16rpx;
      padding: 30rpx;

      .duration-content {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .duration-left,
        .duration-right {
          display: flex;
          flex-direction: column;

          .duration-value {
            font-size: 40rpx;
            font-weight: 700;
            color: #333;
            margin-bottom: 8rpx;
          }

          .duration-label {
            font-size: 24rpx;
            color: #999;
          }
        }

        .duration-right {
          align-items: flex-end;
        }
      }

      .duration-progress {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .progress-bg {
          flex: 1;
          height: 8rpx;
          background-color: #e0e0e0;
          border-radius: 4rpx;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background-color: #1677ff;
            border-radius: 4rpx;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 24rpx;
          color: #1677ff;
          font-weight: 600;
        }
      }
    }
  }

  // 下一步按钮
  .btn-next {
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
