// 服务中标签页组件
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import AbnormalAction from "@/components/AbnormalAction.vue";
import LocationPicker from "@/components/service/LocationPicker.vue";
import VoiceRecorder from "@/components/service/VoiceRecorder.vue";
import { uploadFileService, blobUrlToFile } from "@/api/common/upload";
import { getServicePlanByAged } from "@/api/older/older.js";
import {
  createServiceHealth,
  createServiceSignDoing,
} from "@/api/service/service";

const emit = defineEmits<{
  (e: "next-step", duration?: number, planned?: number): void;
}>();

// Props
const props = defineProps<{
  orderId?: string;
  agedId?: string;
  agedName?: string;
  serviceDuration?: number; // 从父组件接收的服务时长（秒）
}>();

// ============ 定位打卡相关 ============
const locationPickerRef = ref<any>(null);
const checkInStatus = ref<"idle" | "loading" | "success">("idle");
const isCheckInSubmitted = ref(false); // 是否已提交签到数据

// 处理打卡 - 只进行本地状态更新，真正的提交在 handleComplete 中完成
const handleCheckIn = () => {
  const location = locationPickerRef.value?.locationInfo;
  if (!location || !location.latitude || !location.longitude) {
    uni.showToast({
      title: "请先获取位置信息",
      icon: "none",
    });
    return;
  }

  checkInStatus.value = "success";
  // 保存状态
  saveState();
  uni.showToast({
    title: "打卡成功",
    icon: "success",
  });
};

// ============ 服务项目相关 ============
const serviceItems = ref<string[]>([]);

// 存储键名
const getStorageKey = () => `serviceSecond_${props.orderId}`;

// 保存状态
const saveState = () => {
  const state = {
    checkInStatus: checkInStatus.value,
    isCheckInSubmitted: isCheckInSubmitted.value,
    photos: photos.value,
    recordingUrl: recordingUrl.value,
    recordingTime: recordingTime.value,
    healthData: healthData.value,
    serviceStartTime: serviceStartTime.value,
    currentDuration: currentDuration.value,
  };
  uni.setStorageSync(getStorageKey(), state);
};

// 恢复状态
const restoreState = () => {
  try {
    const key = getStorageKey();
    const state = uni.getStorageSync(key);
    if (state) {
      checkInStatus.value = state.checkInStatus || "idle";
      isCheckInSubmitted.value = state.isCheckInSubmitted || false;
      // 过滤掉 blob URL（刷新后 blob URL 会失效）
      photos.value = (state.photos || []).filter(
        (photo) => !photo.startsWith("blob:")
      );
      if (state.recordingUrl && !state.recordingUrl.startsWith("blob:")) {
        recordingUrl.value = state.recordingUrl;
      } else {
        recordingUrl.value = "";
      }
      recordingTime.value = state.recordingTime || 0;
      if (state.healthData) {
        healthData.value = { ...healthData.value, ...state.healthData };
      }
      // 恢复计时状态
      if (state.serviceStartTime) {
        serviceStartTime.value = state.serviceStartTime;
        startTimer();
      }
    }
  } catch (e) {
    console.error("恢复状态失败:", e);
  }
};

// 清除状态
const clearState = () => {
  uni.removeStorageSync(getStorageKey());
};

// 从服务计划接口获取服务项目
const fetchServicePlan = async () => {
  if (!props.agedId) return;

  try {
    const res = await getServicePlanByAged(props.agedId);
    // 处理响应数据
    let data = [];
    if (Array.isArray(res)) {
      data = res;
    }

    // 提取所有服务项目名称和总时长
    const items: string[] = [];
    let totalDuration = 0;
    data.forEach((group: any) => {
      if (group.projects && Array.isArray(group.projects)) {
        group.projects.forEach((project: any) => {
          if (project.projectName) {
            items.push(project.projectName);
          }
          // 累加服务时长（分钟）
          if (project.projectTime) {
            totalDuration += parseInt(project.projectTime) || 0;
          }
        });
      }
    });

    serviceItems.value = items;
    // 如果有获取到时长，更新计划时长
    if (totalDuration > 0) {
      plannedDuration.value = totalDuration;
    }
  } catch (error) {
    console.error("获取服务计划失败:", error);
  }
};

// ============ 图片上传相关 ============
const photos = ref<string[]>([]);

// 拍照
const handleTakePhoto = () => {
  if (photos.value.length >= 3) {
    uni.showToast({
      title: "最多上传3张照片",
      icon: "none",
    });
    return;
  }

  uni.chooseImage({
    count: 1,
    sourceType: ["camera"],
    success: (res) => {
      photos.value.push(res.tempFilePaths[0]);
      // 保存状态
      saveState();
    },
  });
};

// 删除照片
const removePhoto = (index: number) => {
  photos.value.splice(index, 1);
  // 保存状态
  saveState();
};

// ============ 录音相关 ============
const voiceRecorderRef = ref<any>(null);
const recordingUrl = ref("");
const recordingTime = ref(0);

// 录音完成回调
const onRecordingComplete = (url: string, duration: number) => {
  recordingUrl.value = url;
  recordingTime.value = duration;
  // 保存状态
  saveState();
};

// 录音时间更新
const onRecordingTimeUpdate = (time: number) => {
  recordingTime.value = time;
};

// ============ 健康指标 ============
const healthData = ref({
  shousuoya: "", // 收缩压（高压）
  shuzhangya: "", // 舒张压（低压）
  xuetang: "", // 血糖
  heartRate: "", // 心率
  xueyang: "", // 血氧饱和度
});

// ============ 服务计时 ============
const plannedDuration = ref(0); // 计划时长（分钟），从服务计划获取
const serviceStartTime = ref<number | null>(null); // 服务开始时间戳
const currentDuration = ref(0); // 当前显示的服务时长（秒）
let timerInterval: any = null;

// 格式化时间显示
const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00:00";
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
};

// 启动计时器
const startTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (serviceStartTime.value) {
      currentDuration.value = Math.floor(
        (Date.now() - serviceStartTime.value) / 1000
      );
    }
  }, 1000);
};

// 停止计时器
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// ============ 服务中签到提交 ============

const handleCheckInSubmit = async () => {
  // 检查是否已打卡
  if (checkInStatus.value !== "success") {
    uni.showToast({
      title: "请先完成服务中打卡",
      icon: "none",
    });
    return;
  }
  if (photos.value.length === 0) {
    uni.showToast({
      title: "请至少拍摄一张照片",
      icon: "none",
    });
    return;
  }
  // 检查是否已上传录音
  if (!voiceRecorderRef.value?.audioFilePath) {
    uni.showToast({
      title: "请先上传录音",
      icon: "none",
    });
    return;
  }

  // 提交数据（不跳转页面）
  await submitCheckInData();
};

// 服务中签到提交（不跳转）
const submitCheckInData = async () => {
  uni.showLoading({ title: "提交中..." });

  try {
    // 上传图片
    let signPotos = "";
    if (photos.value.length > 0) {
      const photoUrls: string[] = [];
      for (const photo of photos.value) {
        try {
          let filePath = photo;
          if (photo.startsWith("blob:")) {
            const file = await blobUrlToFile(photo, `photo_${Date.now()}.jpg`);
            const uploadRes = await uploadFileService(
              file,
              "file",
              "service/photos"
            );
            if (uploadRes?.data?.url || uploadRes?.data) {
              photoUrls.push(uploadRes.data.url || uploadRes.data);
            }
          } else {
            const uploadRes = await uploadFileService(
              filePath,
              "file",
              "service/photos"
            );
            if (uploadRes?.data?.url || uploadRes?.data) {
              photoUrls.push(uploadRes.data.url || uploadRes.data);
            }
          }
        } catch (uploadError) {
          console.error("图片上传失败:", uploadError);
        }
      }
      signPotos = photoUrls.join(",");
    }

    // 上传录音
    let signVoiceUrl = "";
    const audioFilePath = voiceRecorderRef.value?.audioFilePath;
    if (audioFilePath) {
      try {
        let fileToUpload = audioFilePath;
        if (audioFilePath.startsWith("blob:")) {
          fileToUpload = await blobUrlToFile(audioFilePath, "record.mp3");
        }
        const uploadRes = await uploadFileService(fileToUpload);
        if (uploadRes?.data?.url || uploadRes?.data) {
          signVoiceUrl = uploadRes.data.url || uploadRes.data;
        }
      } catch (uploadError) {
        console.error("录音上传失败:", uploadError);
      }
    }

    // 获取定位信息
    const location = locationPickerRef.value?.locationInfo;

    // 提交服务中签到记录
    const signDoingData: any = {
      orderId: parseInt(props.orderId || "0") || 0,
      signTime: new Date().toISOString(),
      signLong: location?.longitude || 0,
      signLat: location?.latitude || 0,
      signAddressName: location?.address || "",
      signAddress: location?.address || "",
    };

    // 只在有值时才添加可选参数
    if (signPotos) {
      signDoingData.signPotos = signPotos;
    }
    if (signVoiceUrl) {
      signDoingData.mp3Url = signVoiceUrl;
      signDoingData.mp3Time = Math.floor(
        voiceRecorderRef.value?.recordingTime || 0
      );
    }

    try {
      await createServiceSignDoing(signDoingData);
    } catch (signError: any) {
      uni.hideLoading();
      console.error(
        "签到提交失败-完整错误:",
        JSON.stringify(signError, null, 2)
      );
      uni.showToast({
        title:
          "签到提交失败: " + (signError.msg || signError.message || "未知错误"),
        icon: "none",
      });
      return;
    }

    uni.hideLoading();

    // 标记已提交签到数据
    isCheckInSubmitted.value = true;
    saveState();

    uni.showToast({
      title: "签到成功",
      icon: "success",
    });

    // 重置签到内容
    resetCheckInData();
  } catch (error: any) {
    uni.hideLoading();
    console.error("签到提交失败:", error);
    uni.showToast({
      title: error.message || "签到提交失败",
      icon: "none",
    });
  }
};

// 重置签到内容
const resetCheckInData = () => {
  // 重置打卡状态
  checkInStatus.value = "idle";
  // 重置照片列表
  photos.value = [];
  // 重置录音
  recordingUrl.value = "";
  recordingTime.value = 0;
  // 重置录音组件
  voiceRecorderRef.value?.reset?.();
  // 刷新定位
  locationPickerRef.value?.refreshLocation?.();
};

// ============ 完成提交 ============

const handleComplete = async () => {
  // 检查是否已提交签到数据
  if (!isCheckInSubmitted.value) {
    uni.showToast({
      title: "请先提交服务中签到",
      icon: "none",
    });
    return;
  }

  // 检查服务时长
  const actualMinutes = currentDuration.value / 60;
  const minRequiredMinutes = plannedDuration.value * 0.8;

  if (actualMinutes < minRequiredMinutes) {
    uni.showModal({
      title: "提示",
      content: "服务时间不够，是否继续结束？",
      success: (res) => {
        if (res.confirm) {
          submitHealthDataAndNavigate();
        }
      },
    });
    return;
  }
  submitHealthDataAndNavigate();
};

// 提交健康指标并跳转
const submitHealthDataAndNavigate = async () => {
  uni.showLoading({ title: "提交中..." });

  try {
    // 提交健康指标数据
    const healthSubmitData = {
      orderId: parseInt(props.orderId || "0") || 0,
      agedId: parseInt(props.agedId || "0") || 0,
      shousuoya: healthData.value.shousuoya?.trim() || "",
      shuzhangya: healthData.value.shuzhangya?.trim() || "",
      xuetang: healthData.value.xuetang?.trim() || "",
      heartRate: healthData.value.heartRate?.trim() || "",
      xueyang: healthData.value.xueyang?.trim() || "",
    };

    try {
      await createServiceHealth(healthSubmitData);
    } catch (healthError: any) {
      uni.hideLoading();
      console.error("健康指标提交失败:", healthError);
      uni.showToast({
        title:
          "健康指标提交失败: " +
          (healthError.msg || healthError.message || "未知错误"),
        icon: "none",
      });
      return;
    }

    uni.hideLoading();

    // 停止计时
    stopTimer();

    // 传递服务时长和计划时长到下一步
    emit("next-step", currentDuration.value, plannedDuration.value);

    // 提交成功，清除状态
    clearState();

    uni.showToast({
      title: "提交成功",
      icon: "success",
    });
  } catch (error: any) {
    uni.hideLoading();
    console.error("提交失败:", error);
    uni.showToast({
      title: error.message || "提交失败",
      icon: "none",
    });
  }
};

// ============ 异常处理 ============
const handleAbnormalReport = () => {
  uni.navigateTo({
    url: "/pages/serviceExecute/otherEntrances/serviceFailure",
  });
};

const handleTransferTask = () => {
  uni.navigateTo({
    url: "/pages/serviceExecute/otherEntrances/handover",
  });
};

// 生命周期
onMounted(() => {
  // 恢复状态（包括计时状态）
  restoreState();

  // 如果没有开始时间，设置当前时间为开始时间
  if (!serviceStartTime.value) {
    serviceStartTime.value = Date.now();
    saveState();
  }

  // 启动计时器
  startTimer();

  // 自动获取定位
  setTimeout(() => {
    locationPickerRef.value?.getLocation?.();
  }, 500);
  // 获取服务计划
  fetchServicePlan();
});

onUnmounted(() => {
  stopTimer();
});

// 页面隐藏时保存状态
onHide(() => {
  saveState();
});

// 页面显示时恢复状态
onShow(() => {
  restoreState();
});
</script>

<template>
  <view class="service-second-tab">
    <!-- 1) 定位打卡 -->
    <view class="section">
      <view class="section-title">1) 服务中打卡</view>
      <LocationPicker ref="locationPickerRef" />
      <view class="btn-checkin" :class="[checkInStatus]" @click="handleCheckIn">
        <text v-if="checkInStatus === 'idle'">点击打卡</text>
        <text v-else-if="checkInStatus === 'loading'">打卡中...</text>
        <text v-else>已打卡</text>
      </view>
    </view>

    <!-- 2) 服务过程拍照 -->
    <view class="section">
      <view class="section-title">2) 服务过程拍照</view>
      <view class="photo-list">
        <view
          v-for="(photo, index) in photos"
          :key="index"
          class="photo-item"
          :style="{ backgroundImage: `url(${photo})` }"
        >
          <view class="delete-btn" @click.stop="removePhoto(index)">×</view>
        </view>
        <view
          v-if="photos.length < 3"
          class="photo-add"
          @click="handleTakePhoto"
        >
          <text class="add-icon">+</text>
          <text class="add-text">拍照</text>
        </view>
      </view>
    </view>

    <!-- 3) 服务过程录音 -->
    <view class="section">
      <view class="section-title">3) 服务过程录音</view>
      <VoiceRecorder
        ref="voiceRecorderRef"
        @recorded="onRecordingComplete"
        @recording-time-update="onRecordingTimeUpdate"
      />
    </view>

    <!-- 4) 健康指标录入 -->
    <view class="section">
      <view class="section-title">4) 健康指标录入</view>
      <view class="health-form">
        <view class="form-item">
          <text class="form-label">收缩压（高压）</text>
          <input
            v-model="healthData.shousuoya"
            class="form-input"
            placeholder="请输入（单位：mmHg）"
            type="number"
            @blur="saveState"
          />
        </view>
        <view class="form-item">
          <text class="form-label">舒张压（低压）</text>
          <input
            v-model="healthData.shuzhangya"
            class="form-input"
            placeholder="请输入（单位：mmHg）"
            type="number"
            @blur="saveState"
          />
        </view>
        <view class="form-item">
          <text class="form-label">血糖</text>
          <input
            v-model="healthData.xuetang"
            class="form-input"
            placeholder="请输入（单位：mmol/L）"
            type="digit"
            @blur="saveState"
          />
        </view>
        <view class="form-item">
          <text class="form-label">心率</text>
          <input
            v-model="healthData.heartRate"
            class="form-input"
            placeholder="请输入（单位：次/分）"
            type="number"
            @blur="saveState"
          />
        </view>
        <view class="form-item">
          <text class="form-label">血氧饱和度</text>
          <input
            v-model="healthData.xueyang"
            class="form-input"
            placeholder="请输入（单位：%）"
            type="number"
            @blur="saveState"
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
        <text class="duration-time">{{ formatDuration(currentDuration) }}</text>
        <view class="duration-status">
          <text class="status-dot"></text>
          <text class="status-text">正在计时</text>
        </view>
      </view>
      <text class="duration-rule">
        规则：实际时长不足计划80%时提示"服务时间不够"
      </text>
    </view>

    <!-- 服务项目 -->
    <view class="section">
      <view class="section-title">本次服务项目</view>
      <view v-if="serviceItems.length === 0" class="empty-text">
        暂无服务项目
      </view>
      <view v-else class="service-tags">
        <view
          v-for="(item, index) in serviceItems"
          :key="index"
          class="service-tag"
        >
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮区域 -->
    <view class="bottom-buttons">
      <view class="btn-checkin-submit" @click="handleCheckInSubmit">
        服务中签到
      </view>
      <view class="btn-complete" @click="handleComplete"> 服务完成 </view>
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
  padding-bottom: 160rpx; // 为固定按钮留出空间

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

    // 打卡按钮
    .btn-checkin {
      width: 100%;
      height: 80rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 500;
      margin-top: 20rpx;

      &.idle {
        background-color: #1677ff;
        color: #fff;
      }

      &.loading {
        background-color: #91caff;
        color: #fff;
      }

      &.success {
        background-color: #52c41a;
        color: #fff;
      }
    }

    // 服务项目标签
    .empty-text {
      font-size: 26rpx;
      color: #999;
      text-align: center;
      padding: 20rpx 0;
    }

    .service-tags {
      display: flex;
      gap: 16rpx;
      flex-wrap: wrap;

      .service-tag {
        padding: 12rpx 24rpx;
        background-color: #e6f7ff;
        border: 2rpx solid #91caff;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #1677ff;
      }
    }

    // 照片列表
    .photo-list {
      display: flex;
      gap: 20rpx;
      flex-wrap: wrap;

      .photo-item {
        width: 180rpx;
        height: 180rpx;
        border-radius: 12rpx;
        background-size: cover;
        background-position: center;
        position: relative;

        .delete-btn {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
          width: 40rpx;
          height: 40rpx;
          background-color: #ff4d4f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 28rpx;
        }
      }

      .photo-add {
        width: 180rpx;
        height: 180rpx;
        border: 2rpx dashed #ddd;
        border-radius: 12rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8rpx;

        .add-icon {
          font-size: 48rpx;
          color: #999;
        }

        .add-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    // 过程记录
    .process-textarea {
      width: 100%;
      height: 160rpx;
      border: 2rpx solid #e0e0e0;
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
          width: 200rpx;
          font-size: 28rpx;
          color: #333;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .form-input {
          flex: 1;
          height: 70rpx;
          border: 2rpx solid #e0e0e0;
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
          animation: blink 1s infinite;
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

  // 底部按钮区域
  .bottom-buttons {
    position: fixed;
    bottom: 40rpx;
    left: 20rpx;
    right: 20rpx;
    display: flex;
    gap: 20rpx;
    z-index: 100;

    .btn-checkin-submit {
      flex: 1;
      height: 90rpx;
      background-color: #52c41a;
      color: #fff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      font-weight: 600;

      &:active {
        opacity: 0.8;
      }
    }

    .btn-complete {
      flex: 1;
      height: 90rpx;
      background-color: #1677ff;
      color: #fff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      font-weight: 600;

      &:active {
        opacity: 0.8;
      }
    }
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
