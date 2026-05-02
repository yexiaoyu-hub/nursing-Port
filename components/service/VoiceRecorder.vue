// 服务语音录音组件
<template>
  <view class="voice-recorder">
    <!-- 录音播放器 -->
    <view v-if="hasRecorded" class="audio-player">
      <view class="play-btn" @click="handlePlay">
        <text class="play-icon-small">{{ isPlaying ? "⏸" : "▶" }}</text>
      </view>
      <view class="audio-progress">
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: playProgress + '%' }"
          ></view>
        </view>
      </view>
      <text class="audio-time">
        {{ formatPlayTime(playCurrentTime) }}/{{ audioDuration }}
      </text>
    </view>

    <!-- 录音按钮 -->
    <view
      class="btn-record"
      :class="{ recording: isRecording }"
      @click="handleToggleRecording"
    >
      <text class="record-icon">🎙</text>
      <text v-if="isRecording"> 录音中 {{ formatTime(recordingTime) }} </text>
      <text v-else-if="hasRecorded">重新录音</text>
      <text v-else>开始录音</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";

const emit = defineEmits<{
  (e: "recorded", filePath: string, duration: number): void;
}>();

// ============ 录音状态 ============
const isRecording = ref(false);
const recordingTime = ref(0);
const hasRecorded = ref(false);
const audioDuration = ref("00:00");
const audioFilePath = ref("");

// H5 录音相关
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingTimer: number | null = null;

// ============ 播放状态 ============
const isPlaying = ref(false);
const playProgress = ref(0);
const playCurrentTime = ref(0);
let playTimer: number | null = null;
let audioElement: HTMLAudioElement | null = null;
let innerAudioContext: any = null;

// ============ 格式化时间 ============
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const formatPlayTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

// ============ 录音功能 ============
const startRecording = async (): Promise<boolean> => {
  try {
    // 重置状态（重新录音时）
    if (hasRecorded.value) {
      hasRecorded.value = false;
      audioFilePath.value = "";
      recordingTime.value = 0;
      audioDuration.value = "00:00";
      if (audioElement) {
        audioElement = null;
      }
      if (innerAudioContext) {
        innerAudioContext.destroy();
        innerAudioContext = null;
      }
    }

    // #ifdef H5
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioFilePath.value = URL.createObjectURL(audioBlob);
      hasRecorded.value = true;
      isRecording.value = false;
      audioDuration.value = formatTime(recordingTime.value);

      stream.getTracks().forEach((track) => track.stop());

      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }

      emit("recorded", audioFilePath.value, recordingTime.value);
    };

    mediaRecorder.start();
    isRecording.value = true;
    recordingTime.value = 0;

    recordingTimer = window.setInterval(() => {
      recordingTime.value++;
      if (recordingTime.value >= 60) {
        stopRecording();
      }
    }, 1000);
    // #endif

    // #ifndef H5
    const recorderManager = uni.getRecorderManager();

    recorderManager.onStart(() => {
      isRecording.value = true;
      recordingTime.value = 0;

      recordingTimer = setInterval(() => {
        recordingTime.value++;
        if (recordingTime.value >= 60) {
          recorderManager.stop();
        }
      }, 1000) as unknown as number;
    });

    recorderManager.onStop((res) => {
      isRecording.value = false;
      if (recordingTimer) {
        clearInterval(recordingTimer as unknown as number);
        recordingTimer = null;
      }
      audioFilePath.value = res.tempFilePath;
      hasRecorded.value = true;
      audioDuration.value = formatTime(recordingTime.value);

      emit("recorded", audioFilePath.value, recordingTime.value);
    });

    recorderManager.onError(() => {
      isRecording.value = false;
      if (recordingTimer) {
        clearInterval(recordingTimer as unknown as number);
        recordingTimer = null;
      }
      uni.showToast({
        title: "录音失败",
        icon: "none",
      });
    });

    recorderManager.start({
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: "mp3",
    });
    // #endif

    return true;
  } catch (err) {
    uni.showToast({
      title: "无法访问麦克风",
      icon: "none",
    });
    return false;
  }
};

const stopRecording = () => {
  // #ifdef H5
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
  // #endif

  // #ifndef H5
  const recorderManager = uni.getRecorderManager();
  recorderManager.stop();
  // #endif
};

// ============ 播放功能 ============
const play = (filePath: string, duration: number = 0): boolean => {
  if (!filePath) {
    uni.showToast({
      title: "暂无音频",
      icon: "none",
    });
    return false;
  }

  // #ifdef H5
  if (isPlaying.value) {
    pause();
    return true;
  }

  if (!audioElement) {
    audioElement = new Audio(filePath);
    audioElement.addEventListener("ended", () => {
      isPlaying.value = false;
      playProgress.value = 0;
      playCurrentTime.value = 0;
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
      }
    });
  }

  audioElement.play().then(() => {
    isPlaying.value = true;
    playTimer = setInterval(() => {
      if (audioElement) {
        playCurrentTime.value = audioElement.currentTime;
        playProgress.value =
          (audioElement.currentTime / audioElement.duration) * 100;
      }
    }, 100);
  });
  // #endif

  // #ifndef H5
  if (isPlaying.value) {
    if (innerAudioContext) {
      innerAudioContext.pause();
    }
    isPlaying.value = false;
    if (playTimer) {
      clearInterval(playTimer as unknown as number);
      playTimer = null;
    }
    return true;
  }

  if (innerAudioContext && filePath === innerAudioContext.src) {
    innerAudioContext.play();
    return true;
  }

  if (innerAudioContext) {
    innerAudioContext.destroy();
  }

  innerAudioContext = uni.createInnerAudioContext();
  innerAudioContext.src = filePath;

  innerAudioContext.onPlay(() => {
    isPlaying.value = true;
    const totalDuration = duration || innerAudioContext.duration || 4;
    playTimer = setInterval(() => {
      playCurrentTime.value = innerAudioContext.currentTime;
      playProgress.value =
        (innerAudioContext.currentTime / totalDuration) * 100;
    }, 100) as unknown as number;
  });

  innerAudioContext.onPause(() => {
    isPlaying.value = false;
    if (playTimer) {
      clearInterval(playTimer as unknown as number);
      playTimer = null;
    }
  });

  innerAudioContext.onStop(() => {
    isPlaying.value = false;
    playProgress.value = 0;
    playCurrentTime.value = 0;
    if (playTimer) {
      clearInterval(playTimer as unknown as number);
      playTimer = null;
    }
  });

  innerAudioContext.onEnded(() => {
    isPlaying.value = false;
    playProgress.value = 0;
    playCurrentTime.value = 0;
    if (playTimer) {
      clearInterval(playTimer as unknown as number);
      playTimer = null;
    }
  });

  innerAudioContext.onError(() => {
    isPlaying.value = false;
    if (playTimer) {
      clearInterval(playTimer as unknown as number);
      playTimer = null;
    }
    uni.showToast({
      title: "播放失败",
      icon: "none",
    });
  });

  innerAudioContext.play();
  // #endif

  return true;
};

const pause = () => {
  // #ifdef H5
  if (audioElement) {
    audioElement.pause();
  }
  // #endif

  // #ifndef H5
  if (innerAudioContext) {
    innerAudioContext.pause();
  }
  // #endif

  isPlaying.value = false;
  if (playTimer) {
    clearInterval(playTimer as unknown as number);
    playTimer = null;
  }
};

// ============ 事件处理 ============
const handlePlay = () => {
  if (isPlaying.value) {
    pause();
    return;
  }
  play(audioFilePath.value, recordingTime.value);
};

const handleToggleRecording = async () => {
  // 如果正在播放音频，先停止
  if (isPlaying.value) {
    pause();
    isPlaying.value = false;
    playProgress.value = 0;
    playCurrentTime.value = 0;
    if (playTimer) {
      clearInterval(playTimer as unknown as number);
      playTimer = null;
    }
  }

  if (isRecording.value) {
    stopRecording();
  } else {
    await startRecording();
  }
};

// ============ 清理 ============
onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer as unknown as number);
  }
  if (playTimer) {
    clearInterval(playTimer as unknown as number);
  }
  if (innerAudioContext) {
    innerAudioContext.destroy();
  }
});

// 重置录音组件状态
const reset = () => {
  // 停止录音（如果在录音中）
  if (isRecording.value) {
    stopRecording();
  }
  // 停止播放（如果在播放中）
  if (isPlaying.value) {
    pause();
  }
  // 重置所有状态
  isRecording.value = false;
  recordingTime.value = 0;
  hasRecorded.value = false;
  audioDuration.value = "00:00";
  audioFilePath.value = "";
  isPlaying.value = false;
  playProgress.value = 0;
  playCurrentTime.value = 0;
  // 清理音频对象
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  if (innerAudioContext) {
    innerAudioContext.destroy();
    innerAudioContext = null;
  }
  // 清理定时器
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
  if (playTimer) {
    clearInterval(playTimer as unknown as number);
    playTimer = null;
  }
  // 清理录音数据
  audioChunks = [];
  mediaRecorder = null;
};

// 暴露给父组件
defineExpose({
  audioFilePath,
  hasRecorded,
  recordingTime,
  reset,
});
</script>

<style scoped lang="scss">
.voice-recorder {
  // 录音播放器
  .audio-player {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;
    padding: 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;

    .play-btn {
      width: 64rpx;
      height: 64rpx;
      background-color: #52c41a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .play-icon-small {
        font-size: 28rpx;
        color: #fff;
        margin-left: 4rpx;
      }
    }

    .audio-progress {
      flex: 1;
      height: 6rpx;
      background-color: #e0e0e0;
      border-radius: 3rpx;
      overflow: hidden;

      .progress-bar {
        width: 100%;
        height: 100%;

        .progress-fill {
          height: 100%;
          background-color: #52c41a;
          border-radius: 3rpx;
          transition: width 0.1s linear;
        }
      }
    }

    .audio-time {
      font-size: 24rpx;
      color: #999;
      white-space: nowrap;
    }
  }

  // 录音按钮
  .btn-record {
    width: 100%;
    height: 88rpx;
    background-color: #fff;
    color: #333;
    border: 2rpx solid #d9d9d9;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    gap: 12rpx;

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
</style>
