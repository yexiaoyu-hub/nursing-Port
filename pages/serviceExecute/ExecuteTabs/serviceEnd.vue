// 服务结束标签页组件
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AbnormalAction from "@/components/AbnormalAction.vue";
import LocationPicker from "@/components/service/LocationPicker.vue";
import VoiceRecorder from "@/components/service/VoiceRecorder.vue";
import { uploadFileService, blobUrlToFile } from "@/api/common/upload";
import { createServiceSignEnd } from "@/api/service/service";
import { getServicePlanByAged } from "@/api/older/older.js";

const emit = defineEmits<{
  (e: "next-step"): void;
}>();

// Props
const props = defineProps<{
  orderId?: string;
  agedId?: string;
  actualDuration?: number; // 上一步的实际时长（秒）
  plannedDuration?: number; // 计划时长（分钟）
}>();

// ============ 定位打卡相关 ============
const locationPickerRef = ref<any>(null);
const checkInStatus = ref<"idle" | "loading" | "success">("idle");

// 服务项目
const serviceItems = ref<string[]>([]);

// 页面加载时自动获取定位
onMounted(() => {
  setTimeout(() => {
    locationPickerRef.value?.getLocation?.();
  }, 500);

  // 获取服务计划
  fetchServicePlan();

  // 恢复状态
  restoreState();
});

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

    // 提取所有服务项目名称
    const items: string[] = [];
    data.forEach((group: any) => {
      if (group.projects && Array.isArray(group.projects)) {
        group.projects.forEach((project: any) => {
          if (project.projectName) {
            items.push(project.projectName);
          }
        });
      }
    });

    serviceItems.value = items;
  } catch (error) {
    console.error("获取服务计划失败:", error);
  }
};

// 存储键名
const getStorageKey = () => `serviceEnd_${props.orderId}`;

// 保存状态
const saveState = () => {
  const state = {
    checkInStatus: checkInStatus.value,
    photos: photos.value,
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
      // 过滤掉 blob URL（刷新后 blob URL 会失效）
      photos.value = (state.photos || []).filter((photo) => !photo.startsWith("blob:"));
    }
  } catch (e) {
    console.error("恢复状态失败:", e);
  }
};

// 清除状态
const clearState = () => {
  uni.removeStorageSync(getStorageKey());
};

// 处理打卡 - 只进行本地状态更新，真正的提交在 handleNext 中完成
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

// ============ 照片相关 ============
const photos = ref<string[]>([]);

// 拍照
const handleTakePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["camera"],
    success: (res) => {
      if (photos.value.length < 3) {
        photos.value.push(res.tempFilePaths[0]);
        // 保存状态
        saveState();
      }
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
const voiceRecorderRef = ref<InstanceType<typeof VoiceRecorder> | null>(null);

// ============ 服务时长 ============
const actualDuration = computed(() => props.actualDuration || 0);
const plannedDurationValue = computed(() => props.plannedDuration || 40);

// 计算完成百分比
const completionPercent = computed(() => {
  const actualMinutes = actualDuration.value / 60;
  return Math.min(
    Math.round((actualMinutes / plannedDurationValue.value) * 100),
    100
  );
});

// 格式化时间显示（MM:SS）
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// ============ 提交 ============
const handleNext = async () => {
  // 检查是否已完成打卡
  if (checkInStatus.value !== "success") {
    uni.showToast({
      title: "请先完成服务结束打卡",
      icon: "none",
    });
    return;
  }

  // 检查是否已拍照
  if (photos.value.length === 0) {
    uni.showToast({
      title: "请至少拍摄一张照片",
      icon: "none",
    });
    return;
  }

  // 检查是否已录音
  if (!voiceRecorderRef.value?.audioFilePath) {
    uni.showToast({
      title: "请先上传录音",
      icon: "none",
    });
    return;
  }

  uni.showLoading({ title: "提交中..." });
  try {
    const location = locationPickerRef.value?.locationInfo;

    // 上传图片文件（支持blob URL和本地路径）
    let signPhotos = "";
    if (photos.value.length > 0) {
      const photoUrls: string[] = [];
      for (let i = 0; i < photos.value.length; i++) {
        const photoPath = photos.value[i];
        try {
          let fileToUpload = photoPath;
          // H5环境的blob URL，转换为File对象
          if (photoPath.startsWith("blob:")) {
            fileToUpload = await blobUrlToFile(photoPath, `photo_${i}.jpg`);
          }
          const uploadRes: any = await uploadFileService(
            fileToUpload,
            "file",
            "service/photos"
          );
          const url = uploadRes?.data?.url || uploadRes?.data || "";
          if (url) photoUrls.push(url);
        } catch (uploadError) {
          console.error("图片上传失败:", uploadError);
        }
      }
      signPhotos = photoUrls.join(",");
    }

    // 上传录音文件（支持blob URL和本地路径）
    let mp3Url = "";
    const audioFilePath = voiceRecorderRef.value?.audioFilePath;
    if (audioFilePath) {
      try {
        let fileToUpload = audioFilePath;
        // H5环境的blob URL，转换为File对象
        if (audioFilePath.startsWith("blob:")) {
          fileToUpload = await blobUrlToFile(audioFilePath, "record.mp3");
        }
        const uploadRes: any = await uploadFileService(
          fileToUpload,
          "file",
          "service/record"
        );
        mp3Url = uploadRes?.data?.url || uploadRes?.data || "";
      } catch (uploadError) {
        console.error("录音上传失败:", uploadError);
      }
    }

    const signData: any = {
      orderId: parseInt(props.orderId || "0") || 0,
      signLong: location?.longitude || 0,
      signLat: location?.latitude || 0,
      signAddressName: location?.address || "",
      signAddress: location?.address || "",
    };

    // 只在有值时才添加可选参数
    if (signPhotos) {
      signData.signPotos = signPhotos;
    }
    if (mp3Url) {
      signData.mp3Url = mp3Url;
      signData.mp3Time = Math.floor(voiceRecorderRef.value?.recordingTime || 0);
    }

    await createServiceSignEnd(signData);

    uni.hideLoading();

    // 提交成功，清除状态
    clearState();

    emit("next-step");

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
    <!-- 1) 服务结束打卡 -->
    <view class="section">
      <view class="section-title">1) 服务结束打卡</view>
      <LocationPicker ref="locationPickerRef" />
      <view class="btn-checkin" :class="[checkInStatus]" @click="handleCheckIn">
        <text v-if="checkInStatus === 'idle'">点击打卡</text>
        <text v-else-if="checkInStatus === 'loading'">打卡中...</text>
        <text v-else>已打卡</text>
      </view>
    </view>

    <!-- 2) 服务后拍照 -->
    <view class="section">
      <view class="section-title">2) 服务后拍照</view>
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

    <!-- 3) 服务后录音 -->
    <view class="section">
      <view class="section-title">3) 服务后录音</view>
      <VoiceRecorder ref="voiceRecorderRef" />
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
            <text class="duration-value">{{ plannedDurationValue }}分钟</text>
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

    <!-- 本次服务项目 -->
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

    <!-- 服务转交/异常入口 -->
    <AbnormalAction
      @abnormal-report="handleAbnormalReport"
      @transfer-task="handleTransferTask"
    />

    <!-- 底部占位，避免内容被固定按钮遮挡 -->
    <view style="height: 160rpx"></view>

    <!-- 下一步按钮 - 固定在底部 -->
    <view class="btn-next" @click="handleNext"> 下一步 </view>
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

    // 打卡按钮
    .btn-checkin {
      margin-top: 20rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 500;
      background-color: #3b82f6;
      color: #fff;

      &.loading {
        background-color: #93c5fd;
      }

      &.success {
        background-color: #52c41a;
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
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          border: 2rpx dashed #cbd5e1;

          .add-icon {
            font-size: 48rpx;
            color: #94a3b8;
          }
        }

        .photo-remove {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
          width: 40rpx;
          height: 40rpx;
          background-color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24rpx;
        }
      }
    }

    // 时长统计
    .duration-box {
      background-color: #f8fafc;
      border-radius: 12rpx;
      padding: 24rpx;

      .duration-content {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .duration-left,
        .duration-right {
          display: flex;
          flex-direction: column;
          align-items: center;

          .duration-value {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
          }

          .duration-label {
            font-size: 12px;
            color: #64748b;
            margin-top: 4rpx;
          }
        }
      }

      .duration-progress {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .progress-bg {
          flex: 1;
          height: 8rpx;
          background-color: #e2e8f0;
          border-radius: 4rpx;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            border-radius: 4rpx;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 12px;
          color: #3b82f6;
          font-weight: 500;
          min-width: 60rpx;
          text-align: right;
        }
      }
    }

    // 服务项目标签
    .empty-text {
      font-size: 28rpx;
      color: #999;
      text-align: center;
      padding: 20rpx 0;
    }

    .service-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .service-tag {
        padding: 12rpx 24rpx;
        background-color: #e6f7ff;
        border: 1rpx solid #91d5ff;
        border-radius: 8rpx;

        text {
          font-size: 26rpx;
          color: #1677ff;
        }
      }
    }
  }

  // 下一步按钮 - 固定在底部
  .btn-next {
    position: fixed;
    bottom: 40rpx;
    left: 20rpx;
    right: 20rpx;
    height: 96rpx;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.3);
    z-index: 100;
  }
}
</style>
