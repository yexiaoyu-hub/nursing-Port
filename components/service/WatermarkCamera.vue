<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  maxCount?: number;
  watermarkText?: string;
  showLocation?: boolean;
  showTime?: boolean;
  showNurseName?: boolean;
  nurseName?: string;
  modelValue?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 3,
  watermarkText: "护理服务",
  showLocation: true,
  showTime: true,
  showNurseName: false,
  nurseName: "",
  modelValue: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", photos: string[]): void;
  (e: "photo-taken", photo: string): void;
}>();

const photos = ref<string[]>([...props.modelValue]);
const location = ref<string>("");

watch(
  () => props.modelValue,
  (newVal) => {
    photos.value = [...newVal];
  }
);

const getLocation = async () => {
  try {
    const res = await uni.getLocation({
      type: "gcj02",
    });

    const { latitude, longitude } = res;
    const geoRes: any = await new Promise((resolve, reject) => {
      uni.request({
        url: `https://restapi.amap.com/v3/geocode/regeo?key=YOUR_AMAP_KEY&location=${longitude},${latitude}&extensions=base`,
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      });
    });

    if (geoRes.data?.regeocode?.formatted_address) {
      location.value = geoRes.data.regeocode.formatted_address;
    } else {
      location.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  } catch (error) {
    console.error("获取位置失败:", error);
    location.value = "位置获取失败";
  }
};

const addWatermarkH5 = (tempFilePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: tempFilePath,
      success: (imageInfo: any) => {
        const canvas = document.createElement("canvas");
        canvas.width = imageInfo.width;
        canvas.height = imageInfo.height;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0);

          const padding = 20;
          const lineHeight = 30;
          const fontSize = 24;
          let startY = imageInfo.height - padding;

          ctx.font = `${fontSize}px Arial`;
          ctx.textAlign = "left";

          const lines: string[] = [];
          const now = new Date();

          if (props.showTime) {
            const dateStr = `${now.getFullYear()}-${String(
              now.getMonth() + 1
            ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const timeStr = `${String(now.getHours()).padStart(
              2,
              "0"
            )}:${String(now.getMinutes()).padStart(2, "0")}:${String(
              now.getSeconds()
            ).padStart(2, "0")}`;
            lines.push(`时间: ${dateStr} ${timeStr}`);
          }

          if (props.showLocation && location.value) {
            lines.push(`地点: ${location.value}`);
          }

          if (props.showNurseName && props.nurseName) {
            lines.push(`护理员: ${props.nurseName}`);
          }

          lines.push(props.watermarkText);

          const maxWidth = Math.max(
            ...lines.map((line) => ctx.measureText(line).width)
          );
          const boxHeight = lines.length * lineHeight + padding * 2;
          const boxY = imageInfo.height - boxHeight;

          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, boxY, maxWidth + padding * 2, boxHeight);

          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          lines.reverse().forEach((line, index) => {
            ctx.fillText(line, padding, startY - index * lineHeight);
          });

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve(url);
              } else {
                reject(new Error("Canvas to Blob 失败"));
              }
            },
            "image/jpeg",
            0.9
          );
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = tempFilePath;
      },
      fail: (err) => reject(err),
    });
  });
};

const addWatermarkMiniProgram = (tempFilePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: tempFilePath,
      success: (imageInfo: any) => {
        const canvasId = "watermarkCanvas";
        const ctx = uni.createCanvasContext(canvasId);

        ctx.drawImage(tempFilePath, 0, 0, imageInfo.width, imageInfo.height);

        const padding = 20;
        const lineHeight = 30;
        const fontSize = 24;
        let startY = imageInfo.height - padding;

        ctx.setFontSize(fontSize);
        ctx.setTextAlign("left");

        const lines: string[] = [];
        const now = new Date();

        if (props.showTime) {
          const dateStr = `${now.getFullYear()}-${String(
            now.getMonth() + 1
          ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
          lines.push(`时间: ${dateStr} ${timeStr}`);
        }

        if (props.showLocation && location.value) {
          lines.push(`地点: ${location.value}`);
        }

        if (props.showNurseName && props.nurseName) {
          lines.push(`护理员: ${props.nurseName}`);
        }

        lines.push(props.watermarkText);

        ctx.setFillStyle("rgba(0, 0, 0, 0.5)");
        ctx.fillRect(0, imageInfo.height - 150, imageInfo.width, 150);

        ctx.setFillStyle("rgba(255, 255, 255, 0.95)");
        lines.reverse().forEach((line, index) => {
          ctx.fillText(line, padding, startY - index * lineHeight);
        });

        ctx.draw(false, () => {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              canvasId: canvasId,
              width: imageInfo.width,
              height: imageInfo.height,
              destWidth: imageInfo.width,
              destHeight: imageInfo.height,
              fileType: "jpg",
              quality: 0.9,
              success: (res) => {
                resolve(res.tempFilePath);
              },
              fail: (err) => {
                reject(err);
              },
            });
          }, 100);
        });
      },
      fail: (err) => reject(err),
    });
  });
};

const choosePhoto = async () => {
  if (props.showLocation) {
    await getLocation();
  }

  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["camera"],
    success: async (res) => {
      const originalPath = res.tempFilePaths[0];

      try {
        let watermarkedPath: string;

        // #ifdef H5
        watermarkedPath = await addWatermarkH5(originalPath);
        // #endif

        // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
        watermarkedPath = await addWatermarkMiniProgram(originalPath);
        // #endif

        photos.value.push(watermarkedPath);
        emit("update:modelValue", photos.value);
        emit("photo-taken", watermarkedPath);
      } catch (error) {
        console.error("添加水印失败:", error);
        uni.showToast({
          title: "添加水印失败",
          icon: "none",
        });
      }
    },
  });
};

const deletePhoto = (index: number) => {
  const photo = photos.value[index];
  if (photo.startsWith("blob:")) {
    URL.revokeObjectURL(photo);
  }
  photos.value.splice(index, 1);
  emit("update:modelValue", photos.value);
};

const previewPhoto = (index: number) => {
  uni.previewImage({
    urls: photos.value,
    current: index,
  });
};
</script>

<template>
  <view class="watermark-camera">
    <view class="photo-list">
      <view v-for="(photo, index) in photos" :key="index" class="photo-item">
        <image
          :src="photo"
          class="photo-img"
          mode="aspectFill"
          @click="previewPhoto(index)"
        />
        <view class="delete-btn" @click="deletePhoto(index)">
          <text class="delete-icon">×</text>
        </view>
      </view>

      <view
        v-if="photos.length < maxCount"
        class="photo-item photo-add"
        @click="choosePhoto"
      >
        <text class="add-icon">+</text>
        <text class="add-text">拍照</text>
      </view>
    </view>

    <!-- #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ -->
    <canvas
      canvas-id="watermarkCanvas"
      class="watermark-canvas"
      :style="{ width: '750px', height: '1000px' }"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.watermark-camera {
  width: 100%;

  .photo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .photo-item {
      position: relative;
      width: 200rpx;
      height: 200rpx;
      border-radius: 12rpx;
      overflow: hidden;
      background-color: #f5f5f5;

      .photo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .delete-btn {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .delete-icon {
          color: #fff;
          font-size: 28rpx;
          font-weight: bold;
          line-height: 1;
        }
      }
    }

    .photo-add {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2rpx dashed #dcdfe6;
      background-color: #fafafa;
      cursor: pointer;
      transition: all 0.3s;

      &:active {
        background-color: #f0f0f0;
      }

      .add-icon {
        font-size: 60rpx;
        color: #909399;
        line-height: 1;
        margin-bottom: 8rpx;
      }

      .add-text {
        font-size: 24rpx;
        color: #909399;
      }
    }
  }

  .watermark-canvas {
    position: absolute;
    left: -9999px;
    top: -9999px;
  }
}
</style>
