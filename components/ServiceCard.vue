//首页服务卡片
<script setup>
import { computed } from "vue";

const props = defineProps({
  labelblue: {
    type: Array,
    default: () => [],
  },
  photo: {
    type: String,
    default: "",
  },
  serTime: {
    type: Number,
    default: 0,
  },
  orderSerTimes: {
    type: Number,
    default: 0,
  },
  // 服务时长进度（秒）
  actualDuration: {
    type: Number,
    default: 0,
  },
  // 计划时长（分钟）
  plannedDuration: {
    type: Number,
    default: 40,
  },
  label: {
    type: String,
    default: "",
  },
  status: {
    type: Number,
    default: null,
  },
  orderId: {
    type: [String, Number],
    default: "",
  },
  agedId: {
    type: [String, Number],
    default: "",
  },
});

const emit = defineEmits(["startExecute"]);

// 处理开始执行点击
const handleStartClick = () => {
  emit("startExecute", { orderId: props.orderId, agedId: props.agedId });
};

// 是否为机构护理
const isInstitutionCare = computed(() => props.label === "机构护理");

// 计算标签颜色类名
const labelClass = computed(() => {
  switch (props.label) {
    case "机构护理":
      return "label-green";
    case "居家护理":
      return "label-blue";
    case "社区护理":
      return "label-orange";
    default:
      return "label-green";
  }
});

// 计算服务进度百分比（只显示整数）
const progressPercent = computed(() => {
  // 使用 actualDuration 和 plannedDuration（与服务结束页一致）
  const actualMinutes = props.actualDuration / 60;
  if (actualMinutes > 0 && props.plannedDuration > 0) {
    return Math.min(
      Math.round((actualMinutes / props.plannedDuration) * 100),
      100
    );
  }
  return 0;
});

// 状态映射
const statusMap = {
  "-1": { text: "已作废", class: "status-gray" },
  0: { text: "未派单", class: "status-gray" },
  1: { text: "待执行", class: "status-orange" },
  2: { text: "执行中", class: "status-blue" },
  3: { text: "已完成", class: "status-green" },
  4: { text: "已取消", class: "status-gray" },
};

// 按钮文字
const buttonText = computed(() => {
  // 如果状态是已完成(3)，显示"去评价"
  if (props.status === 3) {
    return "去评价";
  }
  // 如果状态是执行中(2)，显示"继续执行"
  if (props.status === 2) {
    return "继续执行";
  }
  // 其他情况显示"开始执行"
  return "开始执行";
});

// 按钮样式类
const buttonClass = computed(() => {
  // 已完成状态使用橘色
  if (props.status === 3) {
    return "buttonmin-orange";
  }
  // 其他情况使用默认蓝色
  return "";
});

// 计算状态文本和样式
const statusInfo = computed(() => {
  return statusMap[props.status] || { text: "", class: "" };
});
</script>


<template>
  <view class="ServiceCard">
    <view class="card">
      <view class="cardheader">
        <view class="touxiang">
          <image
            v-if="photo"
            :src="photo"
            mode="aspectFill"
            class="touxiang-img"
          />
        </view>
        <view class="Information">
          <text class="name"><slot name="name"></slot></text>
          <text class="info">
            <slot name="gender"></slot> • <slot name="age"></slot>岁 •
            <slot name="address"></slot>
          </text>
        </view>
        <view class="labelheader" :class="labelClass"
          ><slot name="label"></slot
        ></view>
      </view>
      <view class="label-row">
        <view class="labelone">失能：<slot name="disability"></slot></view>
        <view
          v-if="statusInfo.text"
          class="status-tag"
          :class="statusInfo.class"
        >
          {{ statusInfo.text }}
        </view>
      </view>
      <view
        style="margin: 20rpx 0 30rpx 0; height: 2rpx; background-color: #e7e7e9"
      ></view>
      <view class="middle">
        <text class="Project">本次服务项目</text>
        <view class="labelblue">
          <view
            class="labelblue-one"
            v-for="(item, index) in labelblue"
            :key="index"
          >
            <slot name="labelblue" :item="item"></slot>
          </view>
        </view>
      </view>
      <view
        style="margin: 10rpx 0 30rpx 0; height: 2rpx; background-color: #e7e7e9"
      ></view>
      <view class="below">
        <view class="plan">
          <view class="planleft">服务时长进度</view>
          <view class="planright">{{ progressPercent }}%</view>
        </view>
        <view class="step">
          <view class="stepmax">
            <view
              class="stepmin"
              :style="{ width: progressPercent + '%' }"
            ></view>
          </view>
        </view>
      </view>
      <view
        style="margin: 10rpx 0 30rpx 0; height: 2rpx; background-color: #e7e7e9"
      ></view>
      <view class="button" :class="{ 'button-single': isInstitutionCare }">
        <button v-if="!isInstitutionCare" class="buttonmin">一键拨号</button>
        <button
          class="buttonmin"
          :class="[{ 'buttonmin-full': isInstitutionCare }, buttonClass]"
          @click="handleStartClick"
        >
          {{ buttonText }}
        </button>
      </view>
    </view>
  </view>
</template>



<style lang="scss" scoped>
.ServiceCard {
  width: 100%;
  box-sizing: border-box;

  .card {
    flex: 1;
    background-color: white;
    width: 100%;
    border-radius: 30rpx;
    border: 1rpx solid #e5edf8;
    box-shadow: 10rpx 10rpx 5rpx #f2f8ff;
    padding: 20rpx;
    box-sizing: border-box;
    .cardheader {
      width: 100%;
      height: 100rpx;
      display: flex;
      align-items: center;
      .touxiang {
        width: 80rpx;
        height: 80rpx;
        background-color: #d5e6ff;
        border-radius: 20rpx;
        overflow: hidden;

        .touxiang-img {
          width: 100%;
          height: 100%;
          border-radius: 20rpx;
        }
      }
      .Information {
        flex: 1;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;
        .name {
          font-size: 36rpx;
          font-weight: 700;
        }
        .info {
          font-size: 24rpx;
          color: #778599;
        }
      }
      .labelheader {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 60rpx;

        &.label-green {
          background-color: #d0f9d9;
          color: #52c41a;
          border: 1rpx solid #52c41a;
        }

        &.label-blue {
          background-color: #e6f4ff;
          color: #1677ff;
          border: 1rpx solid #1677ff;
        }

        &.label-orange {
          background-color: #fff2e8;
          color: #fa8c16;
          border: 1rpx solid #fa8c16;
        }
      }
    }
    .label-row {
      display: flex;
      align-items: center;
      margin-top: 20rpx;
    }
    .labelone {
      min-width: 120rpx;
      max-width: 260rpx;
      height: 40rpx;
      padding: 0 5rpx;
      margin-right: 15rpx;
      border-radius: 20rpx;
      border: 1rpx solid #a6a6a6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #959595;
      text-align: center;
      font-size: 26rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-tag {
      height: 40rpx;
      padding: 0 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;

      &.status-gray {
        background-color: #f5f5f5;
        color: #999999;
        border: 1rpx solid #d9d9d9;
      }

      &.status-orange {
        background-color: #fff7e6;
        color: #fa8c16;
        border: 1rpx solid #ffd591;
      }

      &.status-blue {
        background-color: #e6f7ff;
        color: #1890ff;
        border: 1rpx solid #91d5ff;
      }

      &.status-green {
        background-color: #f6ffed;
        color: #52c41a;
        border: 1rpx solid #b7eb8f;
      }
    }
    .middle {
      width: 100%;
      .Project {
        font-size: 28rpx;
        font-weight: 700;
        color: #1677ff;
        border-left: 10rpx solid #1677ff;
        padding-left: 20rpx;
      }
      .labelblue {
        width: 100%;
        flex: 1;
        margin-top: 20rpx;
        display: flex;
        flex-wrap: wrap;
        gap: 15rpx;
        .labelblue-one {
          padding: 5rpx 20rpx;
          border-radius: 20rpx;
          border: 1rpx solid #598eff;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e8f1ff;
          color: #1677ff;
          text-align: center;
          font-size: 26rpx;
          white-space: nowrap;
        }
      }
    }
    .below {
      width: 100%;
      height: 90rpx;
      .plan {
        height: 30rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .planleft {
          width: 200rpx;
          height: 100%;
          color: #98aa95;
          font-size: 24rpx;
        }
        .planright {
          width: 100rpx;
          height: 100%;
          color: #626d60;
          font-size: 28rpx;
          font-weight: 700;
          text-align: right;
        }
      }
      .step {
        width: 100%;
        height: 30rpx;
        .stepmax {
          width: 100%;
          height: 20rpx;
          margin-top: 20rpx;
          border: 1rpx solid #cccccc;
          background-color: #e1e1e1;
          border-radius: 30rpx;
          position: relative;
          .stepmin {
            width: 50%;
            height: 100%;
            background-color: #409eff;
            border-radius: 30rpx;
            position: absolute;
            top: 0;
            left: 0;
          }
        }
      }
    }
    .button {
      width: 100%;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 10rpx;
      box-sizing: border-box;
      &.button-single {
        justify-content: center;
      }
      .buttonmin {
        width: 280rpx;
        height: 90%;
        border-radius: 20rpx;
        font-size: 24rpx;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1rpx solid #e0e7ff;
        background-color: #fff;
      }
      .buttonmin:last-child {
        background-color: #1677ff;
        color: #fff;
      }
      .buttonmin-full {
        width: 100%;
        max-width: 600rpx;
      }

      // 橘色按钮 - 去评价
      .buttonmin-orange {
        background-color: #f39e43 !important;
        border-color: #f39e43 !important;
      }
    }
  }
}
</style>