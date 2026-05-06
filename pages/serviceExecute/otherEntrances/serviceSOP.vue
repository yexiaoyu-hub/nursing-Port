// 服务操作标准(SOP)页面
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getServiceSopPage } from "@/api/service/service";
import { getServiceProjectPage } from "@/api/service/order";
// 页面参数
const projectId = ref("");
const projectName = ref("");

// 分类选项
const categories = [
  { id: 1, name: "生活照料类" },
  { id: 2, name: "医疗护理类" },
  { id: 3, name: "辅助器具类" },
];

// 当前选中的分类
const currentCategory = ref(1);

// 项目列表（当前分类下的所有项目）
const projectList = ref<any[]>([]);
const showProjectDropdown = ref(false);

// SOP 列表
const sopList = ref<any[]>([]);
const loading = ref(false);
const projectLoading = ref(false);

// 页面加载
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  projectId.value = options.projectId || "";
  projectName.value = decodeURIComponent(options.projectName || "");

  // 如果传入了分类ID，使用传入的分类
  const sortParam = options.sort ? parseInt(options.sort) : null;
  if (sortParam && categories.some((c) => c.id === sortParam)) {
    currentCategory.value = sortParam;
  }

  // 先获取该分类下的所有项目
  fetchProjectList();
});

// 所有项目列表（缓存）
const allProjectList = ref<any[]>([]);

// 获取项目列表（当前分类）
const fetchProjectList = async () => {
  projectLoading.value = true;
  try {
    // 如果还没有获取过所有项目，先获取
    if (allProjectList.value.length === 0) {
      const params = {
        pageNo: 1,
        pageSize: 100,
      };

      const res = await getServiceProjectPage(params);
      const data = res?.data || res;

      if (data && data.list) {
        allProjectList.value = data.list;
      } else if (Array.isArray(data)) {
        allProjectList.value = data;
      }
    }

    // 根据当前分类筛选项目
    // cateId: 1=生活照料类, 2=医疗护理类, 3=辅助器具类
    projectList.value = allProjectList.value.filter((project) => {
      const projectCateId = project.cateId || project.projectType || 1;
      return projectCateId === currentCategory.value;
    });

    // 获取项目列表后，获取SOP详情
    // 如果传入了项目名称，查询该项目的SOP
    if (projectName.value) {
      // 检查当前项目是否在当前分类中
      const exists = projectList.value.some(
        (p) => (p.projectName || p.title) === projectName.value
      );
      if (exists) {
        fetchSopList();
      } else {
        // 如果当前项目不在新分类中，清空选择
        projectName.value = "";
        projectId.value = "";
        sopList.value = [];
        // 默认选中第一个项目
        if (projectList.value.length > 0) {
          const firstProject = projectList.value[0];
          projectId.value = firstProject.id || firstProject.projectId || "";
          projectName.value =
            firstProject.projectName || firstProject.title || "";
          fetchSopList();
        }
      }
    } else if (projectList.value.length > 0) {
      // 默认选中第一个项目
      const firstProject = projectList.value[0];
      projectId.value = firstProject.id || firstProject.projectId || "";
      projectName.value = firstProject.projectName || firstProject.title || "";
      fetchSopList();
    } else {
      projectName.value = "";
      projectId.value = "";
      sopList.value = [];
    }
  } catch (error) {
    console.error("获取项目列表失败:", error);
    projectList.value = [];
  } finally {
    projectLoading.value = false;
  }
};

// 获取 SOP 列表
const fetchSopList = async () => {
  if (!projectName.value) return;

  loading.value = true;
  try {
    const params: any = {
      pageNo: 1,
      pageSize: 100,
    };

    // 优先使用项目ID查询SOP，如果没有ID则使用项目名称
    if (projectId.value) {
      params.projectId = projectId.value;
    }
    // 使用项目名称查询SOP
    params.title = projectName.value;

    const res = await getServiceSopPage(params);
    const data = res?.data || res;

    if (data && data.list) {
      sopList.value = data.list;
    } else if (Array.isArray(data)) {
      sopList.value = data;
    } else {
      sopList.value = [];
    }
  } catch (error) {
    console.error("获取 SOP 列表失败:", error);
    sopList.value = [];
  } finally {
    loading.value = false;
  }
};

// 切换分类
const switchCategory = (categoryId: number) => {
  if (currentCategory.value === categoryId) return;
  currentCategory.value = categoryId;
  // 重置项目选择
  projectName.value = "";
  projectId.value = "";
  sopList.value = [];
  // 重新获取项目列表
  fetchProjectList();
};

// 切换项目下拉框显示
const toggleProjectDropdown = () => {
  showProjectDropdown.value = !showProjectDropdown.value;
};

// 选择项目
const selectProject = (project: any) => {
  projectId.value = project.id || project.projectId || "";
  projectName.value = project.projectName || project.title || "";
  showProjectDropdown.value = false;
  // 获取该项目的SOP
  fetchSopList();
};

// 点击页面其他地方关闭下拉框
const closeDropdown = () => {
  showProjectDropdown.value = false;
};

// 预览图片
const previewImage = (url: string) => {
  uni.previewImage({
    urls: [url],
    current: url,
  });
};

// 播放视频
const playVideo = (url: string) => {
  uni.navigateTo({
    url: `/pages/common/videoPlayer?url=${encodeURIComponent(url)}`,
  });
};

// 判断是否为视频
const isVideo = (url: string) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.endsWith(ext));
};
</script>

<template>
  <view class="sop-page" @click="closeDropdown">
    <!-- 所属分类 -->
    <view class="section" @click.stop>
      <view class="section-label">所属分类</view>
      <view class="category-list">
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: currentCategory === category.id }"
          @click="switchCategory(category.id)"
        >
          <text>{{ category.name }}</text>
        </view>
      </view>
    </view>

    <!-- 项目名称 -->
    <view class="section" @click.stop>
      <view class="section-label">项目名称</view>
      <view class="project-select-wrapper">
        <view class="project-select" @click="toggleProjectDropdown">
          <text class="project-name">{{ projectName || "请选择项目" }}</text>
          <text class="select-icon" :class="{ open: showProjectDropdown }"
            >▼</text
          >
        </view>
        <!-- 项目下拉列表 -->
        <view v-if="showProjectDropdown" class="project-dropdown">
          <view
            v-for="project in projectList"
            :key="project.id || project.projectId"
            class="dropdown-item"
            :class="{
              active: projectName === (project.projectName || project.title),
            }"
            @click="selectProject(project)"
          >
            <text>{{ project.projectName || project.title }}</text>
          </view>
          <view v-if="projectList.length === 0" class="dropdown-empty">
            暂无项目
          </view>
        </view>
      </view>
    </view>

    <!-- SOP 步骤列表 -->
    <view class="sop-section" v-if="projectName">
      <!-- SOP 标题 -->
      <view class="sop-title">{{ projectName }}</view>

      <view class="sop-header">
        <text class="sop-label">服务标准 (SOP)</text>
        <text class="sop-count" v-if="!loading">({{ sopList.length }} 步)</text>
      </view>

      <view v-if="loading" class="loading-text">加载中...</view>

      <view v-else-if="sopList.length === 0" class="empty-text">
        暂无操作标准
      </view>

      <view v-else class="step-list">
        <view v-for="(item, index) in sopList" :key="item.id" class="step-item">
          <view class="step-image">
            <!-- 视频 - 直接播放 -->
            <video
              v-if="item.videoUrl"
              :src="item.videoUrl"
              class="step-video-player"
              controls
              object-fit="cover"
            />
            <!-- 图片 -->
            <image
              v-else-if="item.imageUrl"
              :src="item.imageUrl"
              mode="aspectFill"
              class="step-img"
              @click="previewImage(item.imageUrl)"
            />
            <view v-else class="step-img-placeholder">
              <text class="placeholder-text">暂无图片/视频</text>
            </view>
          </view>
          <view class="step-content">
            <view class="step-title">
              <text class="step-number"
                >STEP {{ String(index + 1).padStart(2, "0") }}</text
              >
              <text class="step-dot">·</text>
              <text class="step-name">{{
                item.title || "步骤" + (index + 1)
              }}</text>
            </view>
            <view class="step-desc">{{ item.content || "暂无描述" }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 未选择项目提示 -->
    <view v-else class="empty-section">
      <text class="empty-hint">请选择项目查看操作标准</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.sop-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

// 区块样式
.section {
  background-color: #fff;
  padding: 24rpx 30rpx;
  margin-bottom: 2rpx;

  .section-label {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }
}

// 分类列表
.category-list {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;

  .category-item {
    padding: 12rpx 28rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
    background-color: #fff;
    transition: all 0.3s;

    &.active {
      background-color: #4a90e2;
      color: #fff;
      border-color: #4a90e2;
    }
  }
}

// 项目选择
.project-select-wrapper {
  position: relative;
}

.project-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background-color: #fff;

  .project-name {
    font-size: 28rpx;
    color: #333;
  }

  .select-icon {
    font-size: 20rpx;
    color: #999;
    transition: transform 0.3s;

    &.open {
      transform: rotate(180deg);
    }
  }
}

// 项目下拉列表
.project-dropdown {
  position: absolute;
  top: calc(100% + 8rpx);
  left: 0;
  right: 0;
  background-color: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  max-height: 400rpx;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  .dropdown-item {
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    font-size: 28rpx;
    color: #333;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      background-color: #e6f7ff;
      color: #4a90e2;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }

  .dropdown-empty {
    padding: 40rpx;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }
}

// SOP 区块
.sop-section {
  background-color: #fff;
  padding: 0rpx 30rpx 30rpx;
  margin-top: 20rpx;
}

// SOP 标题
.sop-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  padding: 30rpx 0rpx;
  background-color: #fff;
  border-bottom: 2rpx solid #e0e0e0;
}

// SOP 头部
.sop-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-top: 20rpx;
  margin-bottom: 30rpx;

  .sop-label {
    font-size: 28rpx;
    color: #666;
  }

  .sop-count {
    font-size: 28rpx;
    color: #999;
  }
}

// 步骤列表
.step-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  background-color: #fff;
  border: 2rpx solid #d2d2d2;
  border-radius: 16rpx;
  align-items: flex-start;

  .step-image {
    flex-shrink: 0;
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background-color: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;

    .step-img {
      width: 100%;
      height: 100%;
    }

    // 视频播放器
    .step-video-player {
      width: 100%;
      height: 100%;
    }

    .step-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;

      .placeholder-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 8rpx;

    .step-title {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 16rpx;

      .step-number {
        font-size: 26rpx;
        font-weight: 600;
        color: #4a90e2;
      }

      .step-dot {
        font-size: 26rpx;
        color: #4a90e2;
        font-weight: 600;
      }

      .step-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .step-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

// 加载和空状态
.loading-text,
.empty-text {
  text-align: center;
  padding: 60rpx 0;
  font-size: 28rpx;
  color: #999;
}

// 未选择项目提示
.empty-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 100rpx 30rpx;
  text-align: center;

  .empty-hint {
    font-size: 30rpx;
    color: #999;
  }
}
</style>
