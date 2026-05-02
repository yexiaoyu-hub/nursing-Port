// 服务开始标签页组件
<script setup lang="ts">
import { ref, onMounted } from "vue";
import AbnormalAction from "@/components/AbnormalAction.vue";
import LocationPicker from "@/components/service/LocationPicker.vue";
import VoiceRecorder from "@/components/service/VoiceRecorder.vue";
import {
  createServiceSign,
  createServiceSignStart,
} from "@/api/service/service";
import { getServicePlanByAged } from "@/api/older/older.js";
import { uploadFileService, blobUrlToFile } from "@/api/common/upload";

const emit = defineEmits<{
  (e: "next-step"): void;
}>();

// Props
const props = defineProps<{
  orderId?: string;
  agedId?: string;
  agedName?: string;
}>();

// 页面参数
const orderId = ref("");
const elderlyInfo = ref({
  id: "",
  name: "",
});
const nurseInfo = ref({
  name: "",
});

// 打卡状态
const checkInStatus = ref<"idle" | "loading" | "success">("idle");

// 组件引用
const locationPickerRef = ref<InstanceType<typeof LocationPicker> | null>(null);
const voiceRecorderRef = ref<InstanceType<typeof VoiceRecorder> | null>(null);

// 照片列表
const photos = ref<string[]>([]);

// 服务项目
const serviceItems = ref<string[]>([]);

// 存储键名 - 使用props.orderId，确保一致性
const getStorageKey = () => `serviceStart_${props.orderId}`;

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
      photos.value = (state.photos || []).filter(
        (photo) => !photo.startsWith("blob:")
      );
    }
  } catch (e) {
    console.error("恢复状态失败:", e);
  }
};

// 清除状态
const clearState = () => {
  uni.removeStorageSync(getStorageKey());
};

// 服务信息
const serviceInfo = {
  name: "王大锤",
  serviceType: "生活照料服务",
  duration: "1分钟",
  cost: "0.10",
  subsidy: "0.04",
  selfPay: "0.06",
};

// 页面加载获取参数
onMounted(() => {
  // 优先使用 props 传入的参数
  orderId.value = props.orderId || "";
  elderlyInfo.value.id = props.agedId || "";
  elderlyInfo.value.name = props.agedName || "王大锤";

  // 如果 props 没有，尝试从页面参数获取
  if (!orderId.value) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options || currentPage.$route?.query || {};
    orderId.value = options.orderId || "";
    elderlyInfo.value.id = options.agedId || elderlyInfo.value.id;
    elderlyInfo.value.name = options.agedName || elderlyInfo.value.name;
  }

  // 获取当前护理员信息
  const userInfo = uni.getStorageSync("userInfo");
  if (userInfo) {
    nurseInfo.value.name = userInfo.nickname || userInfo.username || "护理员";
  }

  // 页面加载时自动获取定位
  locationPickerRef.value?.refreshLocation();

  // 获取服务计划
  fetchServicePlan();

  // 恢复状态
  restoreState();
});

// 从服务计划接口获取服务项目
const fetchServicePlan = async () => {
  const agedId = elderlyInfo.value.id || props.agedId;
  if (!agedId) return;

  try {
    const res = await getServicePlanByAged(agedId);
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

// 获取定位并打卡 - 只进行本地状态更新，真正的提交在 handleComplete 中完成
const handleCheckIn = () => {
  if (checkInStatus.value === "success") {
    return;
  }

  // 检查是否已获取定位
  const location = locationPickerRef.value?.locationInfo;
  if (!location?.latitude || !location?.longitude) {
    uni.showToast({
      title: "请先获取定位",
      icon: "none",
    });
    return;
  }

  // 只更新本地状态，不调用 API，真正的提交在 handleComplete 中完成
  checkInStatus.value = "success";
  // 保存状态
  saveState();
  uni.showToast({
    title: "打卡成功",
    icon: "success",
  });
};

// 完成并进入服务中
const handleComplete = async () => {
  // 检查是否已完成打卡
  if (checkInStatus.value !== "success") {
    uni.showToast({
      title: "请先完成定位打卡",
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

  uni.showLoading({ title: "提交中..." });
  try {
    const location = locationPickerRef.value?.locationInfo;

    // 上传图片文件（支持blob URL和本地路径）
    let signPotos = "";
    if (photos.value.length > 0) {
      const photoUrls = [];
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
      signPotos = photoUrls.join(",");
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
      orderId: parseInt(orderId.value) || 0,
      signLong: location?.longitude || 0,
      signLat: location?.latitude || 0,
      signAddressName: location?.address || "",
      signAddress: location?.address || "",
    };

    // 只在有值时才添加可选参数
    if (signPotos) {
      signData.signPotos = signPotos;
    }
    if (mp3Url) {
      signData.mp3Url = mp3Url;
      signData.mp3Time = Math.floor(voiceRecorderRef.value?.recordingTime || 0);
    }

    let res;
    try {
      res = await createServiceSignStart(signData);
    } catch (apiError: any) {
      console.error("接口错误:", apiError);
      const errorMsg =
        apiError?.msg ||
        apiError?.message ||
        JSON.stringify(apiError) ||
        "提交失败";
      uni.showModal({
        title: "提交失败",
        content: errorMsg,
        showCancel: false,
      });
      uni.hideLoading();
      return;
    }

    if (res) {
      // 提交成功，清除状态
      clearState();

      emit("next-step");

      uni.showToast({
        title: "提交成功",
        icon: "success",
      });
    } else {
      uni.showModal({
        title: "提交失败",
        content: "未知错误",
        showCancel: false,
      });
    }
  } catch (error: any) {
    console.error("系统错误:", error);
    uni.showToast({
      title: error.message || "提交失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 选择照片
const choosePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
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

// 录音完成回调
const handleRecorded = (filePath: string) => {};
</script>

<template>
  <view class="service-start">
    <!-- 1) 到达打卡 -->
    <view class="section">
      <view class="section-title">1) 到达打卡(GPS定位)</view>

      <!-- 使用定位组件 -->
      <LocationPicker ref="locationPickerRef" />

      <!-- 打卡按钮 -->
      <view
        class="btn-checkin-full"
        :class="{
          success: checkInStatus === 'success',
          loading: checkInStatus === 'loading',
          disabled:
            !locationPickerRef?.locationInfo?.latitude ||
            !locationPickerRef?.locationInfo?.longitude,
        }"
        @click="handleCheckIn"
      >
        <text v-if="checkInStatus === 'idle'">
          {{
            !locationPickerRef?.locationInfo?.latitude ||
            !locationPickerRef?.locationInfo?.longitude
              ? "请先获取定位"
              : "定位打卡"
          }}
        </text>
        <text v-else-if="checkInStatus === 'loading'">打卡中...</text>
        <text v-else>已打卡</text>
      </view>
    </view>

    <!-- 2) 服务对象拍照确认 -->
    <view class="section">
      <view class="section-title">2) 服务对象拍照确认</view>
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
          class="photo-item photo-add"
          @click="choosePhoto"
        >
          <text class="add-icon">+</text>
          <text class="add-text">拍照</text>
        </view>
      </view>
    </view>

    <!-- 3) 服务前录音 -->
    <view class="section">
      <view class="section-title">3) 服务前录音</view>
      <view class="voice-box">
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

      <!-- 使用录音组件 -->
      <VoiceRecorder ref="voiceRecorderRef" @recorded="handleRecorded" />
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

    <!-- 完成按钮 -->
    <view class="btn-complete" @click="handleComplete"> 完成并进入服务中 </view>

    <!-- 服务转交/异常入口 -->
    <AbnormalAction
      @abnormal-report="handleAbnormalReport"
      @service-handover="handleAbnormalReport"
    />
  </view>
</template>

<style scoped lang="scss">
.service-start {
  padding: 20rpx;
  padding-bottom: 160rpx;

  .section {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 20rpx;
    }
  }

  // 打卡按钮
  .btn-checkin-full {
    width: 100%;
    height: 88rpx;
    background-color: #1677ff;
    color: #fff;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
    margin-top: 20rpx;

    &.success {
      background-color: #52c41a;
    }

    &.loading {
      opacity: 0.7;
      pointer-events: none;
    }

    &.disabled {
      background-color: #ccc;
      pointer-events: none;
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
      border: 2rpx solid #e8e8e8;

      .photo-remove {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: #ff4d4f;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
      }
    }

    .photo-add {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border: 2rpx dashed #d9d9d9;

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
  }

  // 服务信息文字区域
  .voice-box {
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f7ff 100%);
    border-radius: 16rpx;
    padding: 28rpx;
    margin-bottom: 24rpx;
    border-left: 6rpx solid #1677ff;
    box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.08);

    .voice-text {
      font-size: 28rpx;
      color: #333;
      line-height: 1.7;
      text-align: justify;
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

  // 完成按钮 - 固定在底部
  .btn-complete {
    position: fixed;
    left: 20rpx;
    right: 20rpx;
    bottom: 40rpx;
    height: 88rpx;
    background-color: #1677ff;
    color: #fff;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
    box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
    z-index: 100;
  }
}
</style>
