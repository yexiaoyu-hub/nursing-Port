// 新建异常页面
<script setup lang="ts">
import { ref } from "vue";

// 表单数据
const formData = ref({
  elderlyId: "",
  elderlyName: "",
  workOrderId: "",
  workOrderNo: "",
  abnormalType: "",
  emergencyLevel: "critical",
  photos: [] as string[],
  description: "",
});

// 异常类型选项
const abnormalTypeOptions = [
  { value: "service_exception", label: "服务异常" },
  { value: "elderly_exception", label: "老人异常" },
  { value: "equipment_exception", label: "设备异常" },
  { value: "environment_exception", label: "环境异常" },
  { value: "other", label: "其他" },
];

// 紧急程度选项
const emergencyLevelOptions = [
  { value: "critical", label: "危急", color: "#ff4d4f" },
  { value: "urgent", label: "紧急", color: "#faad14" },
  { value: "normal", label: "一般", color: "#52c41a" },
];

// 返回上一页
const handleBack = () => {
  uni.navigateBack();
};

// 选择老人
const handleSelectElderly = () => {
  uni.showToast({
    title: "选择老人",
    icon: "none",
  });
};

// 选择关联工单
const handleSelectWorkOrder = () => {
  uni.showToast({
    title: "选择关联工单",
    icon: "none",
  });
};

// 选择异常类型
const handleSelectAbnormalType = () => {
  uni.showActionSheet({
    itemList: abnormalTypeOptions.map((item) => item.label),
    success: (res) => {
      formData.value.abnormalType = abnormalTypeOptions[res.tapIndex].value;
    },
  });
};

// 选择紧急程度
const handleSelectEmergencyLevel = () => {
  uni.showActionSheet({
    itemList: emergencyLevelOptions.map((item) => item.label),
    success: (res) => {
      formData.value.emergencyLevel = emergencyLevelOptions[res.tapIndex].value;
    },
  });
};

// 获取紧急程度显示文本
const getEmergencyLevelLabel = () => {
  const option = emergencyLevelOptions.find(
    (item) => item.value === formData.value.emergencyLevel
  );
  return option?.label || "";
};

// 获取紧急程度颜色
const getEmergencyLevelColor = () => {
  const option = emergencyLevelOptions.find(
    (item) => item.value === formData.value.emergencyLevel
  );
  return option?.color || "#333";
};

// 获取异常类型显示文本
const getAbnormalTypeLabel = () => {
  const option = abnormalTypeOptions.find(
    (item) => item.value === formData.value.abnormalType
  );
  return option?.label || "";
};

// 拍照
const handleTakePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["camera"],
    success: (res) => {
      if (formData.value.photos.length < 3) {
        formData.value.photos.push(res.tempFilePaths[0]);
      }
    },
  });
};

// 删除照片
const removePhoto = (index: number) => {
  formData.value.photos.splice(index, 1);
};

// 提交表单
const handleSubmit = () => {
  if (!formData.value.elderlyId) {
    uni.showToast({
      title: "请选择涉及老人",
      icon: "none",
    });
    return;
  }
  if (!formData.value.abnormalType) {
    uni.showToast({
      title: "请选择异常类型",
      icon: "none",
    });
    return;
  }
  if (!formData.value.description.trim()) {
    uni.showToast({
      title: "请填写异常描述",
      icon: "none",
    });
    return;
  }

  uni.showLoading({
    title: "提交中...",
  });

  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: "提交成功",
      icon: "success",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1500);
};
</script>

<template>
  <view class="service-failure-page">
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 异常信息 -->
      <view class="section">
        <view class="section-label">异常信息</view>

        <!-- 涉及老人 -->
        <view class="form-item">
          <text class="form-label">涉及老人</text>
          <view class="form-input" @click="handleSelectElderly">
            <text class="input-placeholder" v-if="!formData.elderlyName">
              请选择老人
            </text>
            <text class="input-text" v-else>{{ formData.elderlyName }}</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 关联工单 -->
        <view class="form-item">
          <text class="form-label">关联工单</text>
          <view class="form-input" @click="handleSelectWorkOrder">
            <text class="input-placeholder" v-if="!formData.workOrderNo">
              请选择关联工单
            </text>
            <text class="input-text" v-else>{{ formData.workOrderNo }}</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 异常类型 -->
        <view class="form-item">
          <text class="form-label">异常类型</text>
          <view class="form-input" @click="handleSelectAbnormalType">
            <text class="input-placeholder" v-if="!formData.abnormalType">
              请选择异常类型
            </text>
            <text class="input-text" v-else>{{ getAbnormalTypeLabel() }}</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 紧急程度 -->
        <view class="form-item">
          <text class="form-label">紧急程度</text>
          <view class="form-input" @click="handleSelectEmergencyLevel">
            <text
              class="emergency-text"
              :style="{ color: getEmergencyLevelColor() }"
            >
              {{ getEmergencyLevelLabel() }}
            </text>
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 现场照片 -->
      <view class="section">
        <view class="section-label">1) 现场照片</view>
        <view class="photo-list">
          <view
            v-for="(photo, index) in formData.photos"
            :key="index"
            class="photo-item"
            :style="{ backgroundImage: `url(${photo})` }"
          >
            <view class="photo-remove" @click="removePhoto(index)">×</view>
          </view>
          <view
            v-if="formData.photos.length < 3"
            class="photo-item add"
            @click="handleTakePhoto"
          >
            <text class="camera-icon">+</text>
          </view>
        </view>
      </view>

      <!-- 异常描述 -->
      <view class="section">
        <view class="section-label">2) 异常描述</view>
        <view class="textarea-wrapper">
          <textarea
            class="description-textarea"
            v-model="formData.description"
            placeholder="记录关键操作及老人反应…"
            maxlength="500"
          />
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <view class="btn-submit" @click="handleSubmit">提交</view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area"></view>
  </view>
</template>

<style lang="scss" scoped>
.service-failure-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  // 表单容器
  .form-container {
    padding: 20rpx;

    .section {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;

      .section-label {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
      }

      // 表单项
      .form-item {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .form-label {
          width: 140rpx;
          font-size: 28rpx;
          color: #333;
          flex-shrink: 0;
        }

        .form-input {
          flex: 1;
          height: 72rpx;
          border: 2rpx solid #dfdfdf;
          border-radius: 12rpx;
          padding: 0 20rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .input-placeholder {
            font-size: 28rpx;
            color: #999;
          }

          .input-text {
            font-size: 28rpx;
            color: #333;
          }

          .emergency-text {
            font-size: 28rpx;
            font-weight: 500;
          }

          .arrow-icon {
            font-size: 32rpx;
            color: #999;
          }
        }
      }

      // 照片列表
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
            background-color: #f8f8f8;
            border: 2rpx dashed #ddd;
            display: flex;
            align-items: center;
            justify-content: center;

            .camera-icon {
              font-size: 48rpx;
              color: #999;
            }
          }

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
      }

      // 文本域
      .textarea-wrapper {
        border-radius: 12rpx;
        padding: 20rpx;
        border: 2rpx solid #dfdfdf;

        .description-textarea {
          width: 100%;
          height: 200rpx;
          font-size: 28rpx;
          line-height: 1.6;

          &::placeholder {
            color: #999;
          }
        }
      }
    }
  }

  // 提交区域
  .submit-section {
    padding: 20rpx;
    padding-top: 0;

    .btn-submit {
      width: 100%;
      height: 88rpx;
      background: #1677ff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  // 底部安全区域
  .safe-area {
    height: 40rpx;
  }
}
</style>
