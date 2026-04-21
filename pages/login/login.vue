<template>
  <view class="login-page">
    <image src="/static/login/beijing.png" mode="aspectFill" class="login-bg" />
    <!-- 登录背景 -->
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo">
        <image src="" mode="aspectFit" class="logo-img" />
      </view>
      <text class="app-name">长护险 · 服务端</text>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 登录表单 -->
      <view class="login-form">
        <!-- 租户输入 -->
        <view
          class="input-item"
          :class="{ focused: focusedField === 'tenant' }"
        >
          <input
            v-model="form.tenant"
            type="text"
            placeholder="请输入租户名称"
            class="input-field"
            @focus="focusedField = 'tenant'"
            @blur="focusedField = ''"
          />
        </view>
        <!-- 账号输入 -->
        <view
          class="input-item"
          :class="{ focused: focusedField === 'username' }"
        >
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            class="input-field"
            @focus="focusedField = 'username'"
            @blur="focusedField = ''"
          />
        </view>

        <!-- 密码输入 -->
        <view
          class="input-item"
          :class="{ focused: focusedField === 'password' }"
        >
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="input-field"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''"
          />
        </view>

        <!-- 协议勾选 -->
        <view class="agreement-check">
          <view
            class="checkbox"
            :class="{ checked: isAgreed }"
            @click="toggleAgreement"
          >
            <text v-if="isAgreed" class="check-icon">✓</text>
          </view>
          <text class="agreement-text">我已阅读</text>
          <text class="agreement-link" @click="navigateToAgreement"
            >用户手册</text
          >
          <text class="agreement-text">和</text>
          <text class="agreement-link" @click="navigateToPrivacy"
            >隐私政策</text
          >
        </view>

        <!-- 登录按钮 -->
        <button class="login-btn" @click="handleLogin">登录</button>
      </view>
    </view>

    <!-- 底部协议说明 -->
    <view class="footer-agreement">
      <text class="footer-text">登录即同意长护险系统</text>
      <text class="footer-link" @click="navigateToAgreement">用户协议</text>
      <text class="footer-text">以及</text>
      <text class="footer-link" @click="navigateToPrivacy">隐私政策</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

// 登录表单数据
const form = ref({
  tenant: "",
  username: "",
  password: "",
});

// 当前聚焦的输入框
const focusedField = ref("");

// 是否同意协议
const isAgreed = ref(false);

// 切换协议勾选
const toggleAgreement = () => {
  isAgreed.value = !isAgreed.value;
};

// 登录
const handleLogin = () => {
  if (!form.value.username) {
    uni.showToast({ title: "请输入账号", icon: "none" });
    return;
  }
  if (!form.value.password) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return;
  }
  if (!isAgreed.value) {
    uni.showToast({ title: "请阅读并同意协议", icon: "none" });
    return;
  }

  // 模拟登录成功
  uni.showToast({ title: "登录成功", icon: "success" });
  setTimeout(() => {
    uni.switchTab({ url: "/pages/index/index" });
  }, 1500);
};

// 跳转用户协议
const navigateToAgreement = () => {
  uni.navigateTo({
    url: "/pages/user/privacyAgreement/userAgreement",
  });
};

// 跳转隐私协议
const navigateToPrivacy = () => {
  uni.navigateTo({
    url: "/pages/user/privacyAgreement/userPrivacy",
  });
};
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #f5f9ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40rpx;
  position: relative;

  // 登录背景图
  .login-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0.3;
  }

  // Logo区域
  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100rpx;
    margin-bottom: 60rpx;
    z-index: 1;
    position: relative;

    .logo {
      width: 100rpx;
      height: 100rpx;
      background: linear-gradient(135deg, #4a90d9, #357abd);
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24rpx;

      .logo-img {
        width: 60rpx;
        height: 60rpx;
      }
    }

    .app-name {
      font-size: 40rpx;
      font-weight: 700;
      color: #202020;
    }
  }

  // 登录卡片
  .login-card {
    width: 85%;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 60rpx 40rpx 40rpx 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    z-index: 1;
    position: relative;

    // 登录表单
    .login-form {
      .input-item {
        margin-bottom: 30rpx;
        border-radius: 20rpx;
        border: 2rpx solid #e5e5e5;
        transition: all 0.3s;

        &.focused {
          border-color: #4a90d9;
          box-shadow: 0 0 0 8rpx rgba(74, 144, 217, 0.15);
        }

        .input-field {
          width: 100%;
          height: 90rpx;
          background-color: #ffffff;
          border-radius: 20rpx;
          padding: 0 40rpx;
          font-size: 28rpx;
          color: #333;
          box-sizing: border-box;
          border: none;
        }
      }

      // 协议勾选
      .agreement-check {
        display: flex;
        align-items: center;
        margin-bottom: 40rpx;
        flex-wrap: wrap;

        .checkbox {
          width: 32rpx;
          height: 32rpx;
          border: 2rpx solid #ccc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12rpx;

          &.checked {
            background-color: #4a90d9;
            border-color: #4a90d9;
          }

          .check-icon {
            color: #fff;
            font-size: 20rpx;
          }
        }

        .agreement-text {
          font-size: 24rpx;
          color: #666;
        }

        .agreement-link {
          font-size: 24rpx;
          color: #4a90d9;
          margin: 0 4rpx;
        }
      }

      // 登录按钮
      .login-btn {
        width: 100%;
        height: 90rpx;
        background: linear-gradient(90deg, #1677ff, #6ba5e7);
        border-radius: 45rpx;
        color: #fff;
        font-size: 32rpx;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;

        &:active {
          opacity: 0.9;
        }
      }
    }
  }

  // 底部协议说明
  .footer-agreement {
    margin-top: auto;
    margin-bottom: 120rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    z-index: 1;
    position: relative;

    .footer-text {
      font-size: 24rpx;
      color: #1b1b1b;
    }

    .footer-link {
      font-size: 24rpx;
      color: #4a90d9;
      margin: 0 4rpx;
    }
  }
}
</style>
