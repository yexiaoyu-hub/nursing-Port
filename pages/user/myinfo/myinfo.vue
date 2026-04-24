// 个人信息页面
<script setup lang="ts">
import { ref } from "vue";
import {
  getUserProfileService,
  updateUserProfileService,
  uploadAvatarService,
} from "@/api/user.js";
import { onShow } from "@dcloudio/uni-app";

// 页面显示时
onShow(() => {
  fetchUserProfile(); // 获取用户信息
});

// 用户信息
const userInfo = ref({
  avatar: "",
  name: "",
  loginDate: "",
  phone: "",
  gender: "",
  email: "",
  organization: "",
});

// 原始用户信息（用于比较是否有修改）
const originalUserInfo = ref({
  nickname: "",
  mobile: "",
  sex: 0,
  email: "",
});

// 证书信息
const certificateInfo = ref({
  status: "未认证",
  certificateImage: "",
});

// 弹窗相关
const showPopup = ref(false);
const popupTitle = ref("");
const popupPlaceholder = ref("");
const popupValue = ref("");
const currentEditField = ref<"name" | "phone" | "email">("name");

// 获取用户资料
const fetchUserProfile = async () => {
  try {
    const res = await getUserProfileService();
    if (res) {
      userInfo.value = {
        avatar: res.avatar || "",
        name: res.nickname || "",
        loginDate: res.loginDate
          ? new Date(res.loginDate)
              .toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(/\//g, "-")
          : "",
        phone: res.mobile || "",
        gender: res.sex === 1 ? "男" : res.sex === 2 ? "女" : "",
        email: res.email || "",
        organization: res.dept?.name || "",
      };
      // 保存原始数据
      originalUserInfo.value = {
        nickname: res.nickname || "",
        mobile: res.mobile || "",
        sex: res.sex || 0,
        email: res.email || "",
      };
    }
  } catch (error) {
    console.error("获取用户资料失败:", error);
  }
};

// 选择的头像临时路径（用于保存时上传）
const selectedAvatarPath = ref("");

// 选择头像
const handleSelectAvatar = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 先显示本地图片，保存时再上传
      userInfo.value.avatar = tempFilePath;
      selectedAvatarPath.value = tempFilePath;
    },
  });
};

// 上传头像
const uploadAvatar = async (filePath: string) => {
  try {
    await uploadAvatarService(filePath);
    // 上传成功，清空临时路径
    selectedAvatarPath.value = "";
    return true;
  } catch (error) {
    console.error("上传头像失败:", error);
    throw error;
  }
};

// 选择性别
const handleSelectGender = () => {
  uni.showActionSheet({
    itemList: ["男", "女"],
    success: (res) => {
      userInfo.value.gender = res.tapIndex === 0 ? "男" : "女";
    },
  });
};

// 打开编辑弹窗
const openEditPopup = (
  field: "name" | "phone" | "email",
  title: string,
  placeholder: string
) => {
  currentEditField.value = field;
  popupTitle.value = title;
  popupPlaceholder.value = placeholder;
  popupValue.value = userInfo.value[field];
  showPopup.value = true;
};

// 编辑昵称
const handleEditName = () => {
  openEditPopup("name", "编辑昵称", "请输入昵称");
};

// 编辑手机号
const handleEditPhone = () => {
  openEditPopup("phone", "编辑手机号", "请输入手机号");
};

// 编辑邮箱
const handleEditEmail = () => {
  openEditPopup("email", "编辑邮箱", "请输入邮箱地址");
};

// 确认编辑
const handleConfirmEdit = () => {
  if (popupValue.value.trim()) {
    userInfo.value[currentEditField.value] = popupValue.value.trim();
  }
  showPopup.value = false;
};

// 取消编辑
const handleCancelEdit = () => {
  showPopup.value = false;
};

// 上传证书照片
const handleUploadCertificate = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ["album", "camera"],
    success: (res) => {
      certificateInfo.value.certificateImage = res.tempFilePaths[0];
    },
  });
};

// 保存修改
const handleSave = async () => {
  // 构建更新数据
  const updateData: any = {};

  if (userInfo.value.name !== originalUserInfo.value.nickname) {
    updateData.nickname = userInfo.value.name;
  }
  if (userInfo.value.phone !== originalUserInfo.value.mobile) {
    updateData.mobile = userInfo.value.phone;
  }
  if (userInfo.value.email !== originalUserInfo.value.email) {
    updateData.email = userInfo.value.email;
  }

  const sexValue =
    userInfo.value.gender === "男" ? 1 : userInfo.value.gender === "女" ? 2 : 0;
  if (sexValue !== originalUserInfo.value.sex) {
    updateData.sex = sexValue;
  }

  // 检查是否有修改
  const hasProfileChange = Object.keys(updateData).length > 0;
  const hasAvatarChange = selectedAvatarPath.value !== "";

  if (!hasProfileChange && !hasAvatarChange) {
    uni.showToast({
      title: "暂无修改",
      icon: "none",
    });
    return;
  }

  uni.showLoading({
    title: "保存中...",
  });

  try {
    // 如果有头像修改，先上传头像
    if (hasAvatarChange) {
      await uploadAvatar(selectedAvatarPath.value);
    }

    // 如果有资料修改，更新资料
    if (hasProfileChange) {
      await updateUserProfileService(updateData);
    }

    uni.hideLoading();
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    // 更新原始数据
    if (hasProfileChange) {
      originalUserInfo.value = {
        ...originalUserInfo.value,
        ...updateData,
      };
    }

    // 重新获取用户信息获取最新头像
    await fetchUserProfile();
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: "保存失败",
      icon: "none",
    });
  }
};
</script>

<template>
  <view class="myinfo-page">
    <!-- 基本信息 -->
    <view class="info-section">
      <!-- 头像 -->
      <view class="info-item" @click="handleSelectAvatar">
        <text class="info-label">头像</text>
        <view class="info-value">
          <view class="avatar-wrapper">
            <image
              v-if="userInfo.avatar"
              :src="userInfo.avatar"
              class="avatar-img"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder"></view>
          </view>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="info-item" @click="handleEditName">
        <text class="info-label">昵称</text>
        <view class="info-value">
          <text class="info-text">{{ userInfo.name }}</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 性别 -->
      <view class="info-item" @click="handleSelectGender">
        <text class="info-label">性别</text>
        <view class="info-value">
          <text class="info-text">{{ userInfo.gender || "请选择" }}</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 手机号 -->
      <view class="info-item" @click="handleEditPhone">
        <text class="info-label">手机号</text>
        <view class="info-value">
          <text class="info-text">{{ userInfo.phone }}</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 邮箱 -->
      <view class="info-item" @click="handleEditEmail">
        <text class="info-label">邮箱</text>
        <view class="info-value">
          <text class="info-text placeholder" v-if="!userInfo.email">
            请填写
          </text>
          <text class="info-text" v-else>{{ userInfo.email }}</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 登录日期 -->
      <view class="info-item">
        <text class="info-label">登录日期</text>
        <text class="info-text basic-info">{{ userInfo.loginDate }}</text>
      </view>

      <!-- 所属部门 -->
      <view class="info-item">
        <text class="info-label">所属部门</text>
        <text class="info-text basic-info">{{ userInfo.organization }}</text>
      </view>
    </view>

    <!-- 资质信息 -->
    <view class="qualification-section">
      <text class="section-title">资质信息</text>
      <view class="qualification-card">
        <view class="qualification-header">
          <text class="qualification-title">证书验证</text>
          <text class="qualification-status">{{ certificateInfo.status }}</text>
        </view>
        <view class="certificate-upload" @click="handleUploadCertificate">
          <image
            v-if="certificateInfo.certificateImage"
            :src="certificateInfo.certificateImage"
            class="certificate-img"
            mode="aspectFit"
          />
          <text v-else class="upload-text">证件照片预览区域</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <view class="btn-save" @click="handleSave">保存修改</view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area"></view>

    <!-- 编辑弹窗 -->
    <view v-if="showPopup" class="popup-mask" @click="handleCancelEdit">
      <view class="popup-wrapper" @click.stop>
        <view class="edit-popup">
          <view class="popup-header">
            <text class="popup-title">{{ popupTitle }}</text>
          </view>
          <view class="popup-content">
            <input
              v-model="popupValue"
              class="popup-input"
              :placeholder="popupPlaceholder"
              type="text"
            />
          </view>
          <view class="popup-footer">
            <view class="popup-btn cancel" @click="handleCancelEdit">取消</view>
            <view class="popup-btn confirm" @click="handleConfirmEdit"
              >确定</view
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.myinfo-page {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-top: 10rpx;

  // 基本信息区域
  .info-section {
    background-color: #fff;
    border: 1rpx solid #e5e5e5;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    border-radius: 16rpx;
    margin: 20rpx;
    padding: 0 24rpx;

    .info-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 120rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 28rpx;
        color: #333;
      }

      .info-value {
        display: flex;
        align-items: center;

        .avatar-wrapper {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          overflow: hidden;
          background-color: #f0f0f0;

          .avatar-img {
            width: 100%;
            height: 100%;
          }

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            background-color: #e8e8e8;
          }
        }

        .arrow-icon {
          font-size: 32rpx;
          color: #999;
          margin-left: 16rpx;
        }
      }

      .info-text {
        font-size: 28rpx;
        color: #333;

        &.basic-info {
          font-size: 28rpx;
          color: #64748b;
        }

        &.placeholder {
          color: #999;
        }
      }
    }
  }

  // 资质信息区域
  .qualification-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .qualification-card {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      border: 1rpx solid #e5e5e5;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

      .qualification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .qualification-title {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }

        .qualification-status {
          font-size: 24rpx;
          color: #52c41a;
          background-color: #f6ffed;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          border: 1rpx solid #b7eb8f;
        }
      }

      .certificate-upload {
        height: 200rpx;
        background-color: #f8f8f8;
        border-radius: 12rpx;
        border: 2rpx dashed #ddd;
        display: flex;
        align-items: center;
        justify-content: center;

        .certificate-img {
          width: 100%;
          height: 100%;
          border-radius: 12rpx;
        }

        .upload-text {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
  }

  // 保存按钮区域
  .save-section {
    padding: 40rpx 20rpx;

    .btn-save {
      width: 100%;
      height: 88rpx;
      background: #1677ff;
      border-radius: 44rpx;
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

  // 编辑弹窗样式
  .popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-wrapper {
    width: 560rpx;
  }

  .edit-popup {
    width: 100%;
    background-color: #fff;
    border-radius: 24rpx;
    overflow: hidden;

    .popup-header {
      padding: 40rpx 40rpx 20rpx;
      text-align: center;

      .popup-title {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }
    }

    .popup-content {
      padding: 20rpx 40rpx 40rpx;

      .popup-input {
        width: 100%;
        height: 80rpx;
        background-color: #f5f5f5;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }
    }

    .popup-footer {
      display: flex;
      border-top: 1rpx solid #e5e5e5;

      .popup-btn {
        flex: 1;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;

        &.cancel {
          color: #666;
          border-right: 1rpx solid #e5e5e5;
        }

        &.confirm {
          color: #1677ff;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
