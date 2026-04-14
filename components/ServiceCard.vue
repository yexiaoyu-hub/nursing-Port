//首页服务卡片
<script setup>
const props = defineProps({
  labelblue: {
    type: Array,
    default: () => [],
  },
});
</script>


<template>
  <view class="ServiceCard">
    <view class="time">
      <text>9:00 - 10:00</text>
    </view>
    <view class="card">
      <view class="cardheader">
        <view class="touxiang"></view>
        <view class="Information">
          <text class="name"><slot name="name"></slot></text>
          <text class="info">
            <slot name="gender"></slot> • <slot name="age"></slot>岁 •
            <slot name="address"></slot>
          </text>
        </view>
        <view class="labelheader"><slot name="label"></slot></view>
      </view>
      <view class="labelone">失能：<slot name="disability"></slot></view>
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
          <view class="planright">50%</view>
        </view>
        <view class="step">
          <view class="stepmax">
            <view class="stepmin"></view>
          </view>
        </view>
      </view>
      <view
        style="margin: 10rpx 0 30rpx 0; height: 2rpx; background-color: #e7e7e9"
      ></view>
      <view class="button">
        <button class="buttonmin">一键拨号</button>
        <button class="buttonmin">开始执行</button>
      </view>
    </view>
  </view>
</template>



<style lang="scss" scoped>
.ServiceCard {
  width: 100%;
  height: 700rpx;
  box-sizing: border-box;
  .time {
    color: #778599;
  }
  .card {
    background-color: white;
    width: 100%;
    height: 620rpx;
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
        width: 150rpx;
        height: 50rpx;
        background-color: #d0f9d9;
        border-radius: 30rpx;
        color: green;
        border: 1rpx solid #00aa00;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 60rpx;
      }
    }
    .labelone {
      width: 160rpx;
      height: 40rpx;
      margin-right: 15rpx;
      border-radius: 20rpx;
      border: 1rpx solid #a6a6a6;
      margin-top: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #959595;
      text-align: center;
      font-size: 26rpx;
    }
    .middle {
      width: 100%;
      height: 120rpx;
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
        .labelblue-one {
          width: 100rpx;
          height: 100%;
          margin-right: 15rpx;
          border-radius: 20rpx;
          border: 1rpx solid #598eff;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e8f1ff;
          color: #1677ff;
          text-align: center;
          font-size: 26rpx;
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
      .buttonmin {
        width: 185rpx;
        height: 90%;
        border-radius: 30rpx;
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
    }
  }
}
</style>