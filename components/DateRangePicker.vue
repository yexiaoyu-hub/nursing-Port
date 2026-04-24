// 日期范围选择器组件
<script setup lang="ts">
import { ref, watch } from "vue";

// 定义 props
const props = defineProps<{
  show: boolean;
  beginDate?: string;
  endDate?: string;
  title?: string;
}>();

// 定义 emits
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "confirm", beginDate: string, endDate: string): void;
  (e: "clear"): void;
}>();

// 临时日期值（用于选择器）
const tempBeginDate = ref("");
const tempEndDate = ref("");
const beginDateValue = ref([0, 0, 0]);
const endDateValue = ref([0, 0, 0]);

// 生成日期数据
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

// 监听 show 变化，初始化日期值
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      // 弹窗打开时，初始化临时日期值
      tempBeginDate.value = props.beginDate || "";
      tempEndDate.value = props.endDate || "";

      // 设置选择器默认值
      if (props.beginDate) {
        const [year, month, day] = props.beginDate.split("-").map(Number);
        beginDateValue.value = [
          years.indexOf(year),
          months.indexOf(month),
          days.indexOf(day),
        ];
      } else {
        // 默认选中今天
        const now = new Date();
        beginDateValue.value = [
          years.indexOf(now.getFullYear()),
          months.indexOf(now.getMonth() + 1),
          days.indexOf(now.getDate()),
        ];
      }

      if (props.endDate) {
        const [year, month, day] = props.endDate.split("-").map(Number);
        endDateValue.value = [
          years.indexOf(year),
          months.indexOf(month),
          days.indexOf(day),
        ];
      } else {
        // 默认选中今天
        const now = new Date();
        endDateValue.value = [
          years.indexOf(now.getFullYear()),
          months.indexOf(now.getMonth() + 1),
          days.indexOf(now.getDate()),
        ];
      }
    }
  },
  { immediate: true }
);

// 关闭弹窗
const close = () => {
  emit("update:show", false);
};

// 开始日期选择器变化
const onBeginDatePickerChange = (e: any) => {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value;
  const year = years[yearIndex];
  const month = months[monthIndex];
  const day = days[dayIndex];
  tempBeginDate.value = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  beginDateValue.value = e.detail.value;
};

// 结束日期选择器变化
const onEndDatePickerChange = (e: any) => {
  const [yearIndex, monthIndex, dayIndex] = e.detail.value;
  const year = years[yearIndex];
  const month = months[monthIndex];
  const day = days[dayIndex];
  tempEndDate.value = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  endDateValue.value = e.detail.value;
};

// 清空日期筛选
const clear = () => {
  tempBeginDate.value = "";
  tempEndDate.value = "";
  emit("clear");
  close();
};

// 确认日期筛选
const confirm = () => {
  if (!tempBeginDate.value || !tempEndDate.value) {
    uni.showToast({
      title: "请选择完整的日期范围",
      icon: "none",
    });
    return;
  }
  if (tempBeginDate.value > tempEndDate.value) {
    uni.showToast({
      title: "开始日期不能晚于结束日期",
      icon: "none",
    });
    return;
  }
  emit("confirm", tempBeginDate.value, tempEndDate.value);
  close();
};
</script>

<template>
  <view class="date-range-picker" v-if="show">
    <view class="picker-mask" @click="close"></view>
    <view class="picker-content">
      <view class="picker-title">{{ title || "选择日期范围" }}</view>

      <!-- 开始日期选择器 -->
      <view class="date-picker-wrapper">
        <picker-view
          class="date-picker"
          :value="beginDateValue"
          @change="onBeginDatePickerChange"
        >
          <picker-view-column>
            <view class="picker-item" v-for="year in years" :key="year"
              >{{ year }}年</view
            >
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="month in months" :key="month"
              >{{ month }}月</view
            >
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="day in days" :key="day"
              >{{ day }}日</view
            >
          </picker-view-column>
        </picker-view>
        <view class="picker-label">开始日期</view>
      </view>

      <!-- 分隔符 -->
      <view class="date-separator">至</view>

      <!-- 结束日期选择器 -->
      <view class="date-picker-wrapper">
        <picker-view
          class="date-picker"
          :value="endDateValue"
          @change="onEndDatePickerChange"
        >
          <picker-view-column>
            <view class="picker-item" v-for="year in years" :key="year"
              >{{ year }}年</view
            >
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="month in months" :key="month"
              >{{ month }}月</view
            >
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="day in days" :key="day"
              >{{ day }}日</view
            >
          </picker-view-column>
        </picker-view>
        <view class="picker-label">结束日期</view>
      </view>

      <!-- 操作按钮 -->
      <view class="picker-actions">
        <view class="btn-clear" @click="clear">清空</view>
        <view class="btn-confirm" @click="confirm">确定</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.date-range-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  .picker-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .picker-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    width: 600rpx;

    .picker-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 30rpx;
    }

    .date-picker-wrapper {
      margin-bottom: 20rpx;

      .date-picker {
        height: 300rpx;

        .picker-item {
          line-height: 100rpx;
          text-align: center;
          font-size: 28rpx;
        }
      }

      .picker-label {
        text-align: center;
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
      }
    }

    .date-separator {
      text-align: center;
      font-size: 28rpx;
      color: #666;
      margin: 20rpx 0;
    }

    .picker-actions {
      display: flex;
      gap: 20rpx;
      margin-top: 30rpx;

      .btn-clear,
      .btn-confirm {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 28rpx;
      }

      .btn-clear {
        background-color: #f5f5f5;
        color: #666;
      }

      .btn-confirm {
        background-color: #1677ff;
        color: #fff;
      }
    }
  }
}
</style>
