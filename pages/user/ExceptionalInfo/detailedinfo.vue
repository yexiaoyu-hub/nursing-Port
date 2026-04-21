// 异常详情页面
<script setup lang="ts">
import { ref } from "vue";

// 异常详情数据
const exceptionDetail = ref({
  id: "E1001",
  status: "待处理",
  statusColor: "#faad14",
  exceptionNo: "E1001",
  elderlyName: "李红",
  level: "危急",
  levelColor: "#ff4d4f",
  type: "健康指标异常",
  orderNo: "日常生活护理 (#5002)",
  reportTime: "昨日 14:30",
  description:
    "在进行例行血压测量时，发现老人血压高达180/110 mmHg，且老人自述头晕。已暂停服务并联系家属及站点负责人。",
  photos: ["https://placeholder.com/photo1", "https://placeholder.com/photo2"],
});

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: exceptionDetail.value.photos,
    current: index,
  });
};
</script>

<template>
  <view class="exception-detail-page">
    <view class="container">
      <!-- 异常信息卡片 -->
      <view class="info-card">
        <!-- 异常头部信息 -->
        <view class="header-section">
          <view class="header-top">
            <text class="exception-title">异常 {{ exceptionDetail.id }}</text>
            <view
              class="status-tag"
              :style="{
                color: exceptionDetail.statusColor,
                borderColor: exceptionDetail.statusColor,
              }"
            >
              {{ exceptionDetail.status }}
            </view>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="info-section">
          <view class="info-item">
            <text class="info-label">异常编号</text>
            <text class="info-value">{{ exceptionDetail.exceptionNo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">涉及老人</text>
            <text class="info-value">{{ exceptionDetail.elderlyName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">紧急程度</text>
            <text
              class="info-value"
              :style="{ color: exceptionDetail.levelColor }"
            >
              {{ exceptionDetail.level }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">异常类型</text>
            <text class="info-value">{{ exceptionDetail.type }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">关联工单</text>
            <text class="info-value">{{ exceptionDetail.orderNo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">上报时间</text>
            <text class="info-value">{{ exceptionDetail.reportTime }}</text>
          </view>
        </view>
      </view>

      <!-- 异常描述卡片 -->
      <view class="description-card">
        <text class="section-title">异常描述</text>
        <view class="description-content">
          <text class="description-text">{{
            exceptionDetail.description
          }}</text>
        </view>
      </view>

      <!-- 现场照片卡片 -->
      <view class="photos-card" v-if="exceptionDetail.photos.length > 0">
        <text class="section-title">现场照片</text>
        <view class="photos-list">
          <view
            v-for="(photo, index) in exceptionDetail.photos"
            :key="index"
            class="photo-item"
            @click="previewImage(index)"
          >
            <image :src="photo" mode="aspectFill" class="photo-image" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area"></view>
  </view>
</template>

<style lang="scss" scoped>
.exception-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .container {
    padding: 20rpx;
  }

  // 卡片通用样式
  .info-card,
  .description-card,
  .photos-card {
    background-color: #fff;
    border: 1rpx solid #e5e5e5;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
  }

  // 异常信息卡片
  .info-card {
    // 异常头部信息
    .header-section {
      padding: 24rpx 20rpx;
      border-bottom: 1rpx solid #f0f0f0;

      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .exception-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
        }

        .status-tag {
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          border: 1rpx solid;
        }
      }
    }

    // 基本信息
    .info-section {
      padding: 0 20rpx;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 28rpx;
          color: #666;
        }

        .info-value {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }

  // 异常描述卡片
  .description-card {
    padding: 24rpx 20rpx;

    .section-title {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .description-content {
      background-color: #f8f8f8;
      border-radius: 12rpx;
      padding: 24rpx;

      .description-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
      }
    }
  }

  // 现场照片卡片
  .photos-card {
    padding: 24rpx 20rpx;

    .section-title {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .photos-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .photo-item {
        width: 200rpx;
        height: 200rpx;
        border-radius: 12rpx;
        overflow: hidden;
        background-color: #e6f2ff;

        .photo-image {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  // 底部安全区域
  .safe-area {
    height: 40rpx;
  }
}
</style>
