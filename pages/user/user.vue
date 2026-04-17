<template>
  <view class="user-page">
    <!-- 头部用户信息卡片 -->
    <view class="header-card">
      <view class="header-bg">
        <view class="user-info">
          <view class="avatar">
            <image
              src="/static/avatar.png"
              mode="aspectFill"
              class="avatar-img"
            ></image>
          </view>
          <view class="user-detail">
            <view class="user-name">护理员A</view>
            <view class="user-id">工号：OP-2026-001</view>
          </view>
          <view class="auth-badge">已认证</view>
        </view>
      </view>
    </view>

    <!-- 功能菜单区域 -->
    <view class="menu-section">
      <!-- 主要功能 -->
      <view class="menu-card">
        <view class="menu-item" @click="navigateTo('/pages/user/profile')">
          <view class="menu-icon blue">
            <uni-icons type="person" size="20" color="#4a90d9"></uni-icons>
          </view>
          <text class="menu-text">个人信息</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/data')">
          <view class="menu-icon green">
            <uni-icons type="bars" size="20" color="#52c41a"></uni-icons>
          </view>
          <text class="menu-text">我的数据</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/abnormal')">
          <view class="menu-icon red">
            <uni-icons type="info-filled" size="20" color="#EF4444"></uni-icons>
          </view>
          <text class="menu-text">异常信息</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/messages')">
          <view class="menu-icon orange">
            <uni-icons
              type="notification"
              size="20"
              color="#fa8c16"
            ></uni-icons>
          </view>
          <text class="menu-text">系统消息</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <!-- 辅助功能 -->
      <view class="menu-card">
        <view class="menu-item" @click="navigateTo('/pages/user/help')">
          <view class="menu-icon cyan">
            <uni-icons type="help" size="20" color="#13c2c2"></uni-icons>
          </view>
          <text class="menu-text">帮助与反馈</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/agreement')">
          <view class="menu-icon gray">
            <uni-icons type="wallet" size="20" color="#8c8c8c"></uni-icons>
          </view>
          <text class="menu-text">用户协议</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/user/privacy')">
          <view class="menu-icon gray">
            <uni-icons type="locked" size="20" color="#8c8c8c"></uni-icons>
          </view>
          <text class="menu-text">隐私政策</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <text class="logout-text" @click="logout">退出登录</text>
    </view>
  </view>
</template>

<script setup>
const navigateTo = (url) => {
  uni.navigateTo({
    url,
  });
};

const logout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

// 头部卡片
.header-card {
  .header-bg {
    background: linear-gradient(120deg, #549bff, #144cd8);
    padding: 40rpx 30rpx 60rpx;
    border-radius: 0 0 40rpx 40rpx;
  }

  .user-info {
    display: flex;
    align-items: center;
    position: relative;
  }

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 20rpx;
    background-color: #8ab7fc;
    overflow: hidden;
    margin-right: 30rpx;

    .avatar-img {
      width: 100%;
      height: 100%;
    }
  }

  .user-detail {
    flex: 1;

    .user-name {
      color: #fff;
      font-size: 40rpx;
      font-weight: 600;
      margin-bottom: 10rpx;
    }

    .user-id {
      color: rgba(255, 255, 255, 0.8);
      font-size: 26rpx;
    }
  }

  .auth-badge {
    background-color: rgba(255, 255, 255, 0.25);
    color: #fff;
    font-size: 24rpx;
    padding: 8rpx 24rpx;
    border-radius: 30rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.4);
  }
}

// 菜单区域
.menu-section {
  padding: 30rpx;
  margin-top: 10rpx;

  .menu-card {
    background-color: #fff;
    border-radius: 30rpx;
    padding: 0 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .menu-item {
      display: flex;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        opacity: 0.7;
      }
    }

    .menu-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;

      &.blue {
        background-color: #e6f2ff;
        color: #4a90d9;
      }

      &.green {
        background-color: #e6f9f0;
        color: #52c41a;
      }

      &.red {
        background-color: #fff2f0;
        color: #ff4d4f;
      }

      &.orange {
        background-color: #fff7e6;
        color: #fa8c16;
      }

      &.cyan {
        background-color: #e6fffb;
        color: #13c2c2;
      }

      &.gray {
        background-color: #f5f5f5;
        color: #8c8c8c;
      }
    }

    .menu-text {
      flex: 1;
      font-size: 15px;
      color: #111828;
      font-weight: 600;
    }

    .arrow {
      font-size: 28rpx;
      color: #ccc;
    }
  }
}

// 退出登录
.logout-section {
  padding: 20rpx 0rpx;
  text-align: center;
  border: 1rpx solid #e49c9c;
  border-radius: 30rpx;
  margin: 0 30rpx;

  .logout-text {
    color: #ff4d4f;
    font-size: 30rpx;
  }
}
</style>
