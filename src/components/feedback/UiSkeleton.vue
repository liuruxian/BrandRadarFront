<!--
  UiSkeleton.vue - 骨架屏组件库
  提供多种骨架类型，1:1 映射真实内容布局
  更新时间: 2026-04-16
-->
<template>
  <!-- 文本行 -->
  <template v-if="type === 'text'">
    <div
      class="skeleton-text"
      :style="{
        width: width || '100%',
        height: height || '14px',
        borderRadius: radius || '4px'
      }"
    />
  </template>

  <!-- 标题 -->
  <template v-else-if="type === 'title'">
    <div
      class="skeleton-title"
      :style="{
        width: width || '60%',
        height: height || '20px',
        borderRadius: radius || '4px'
      }"
    />
  </template>

  <!-- 头像 -->
  <template v-else-if="type === 'avatar'">
    <div
      class="skeleton-avatar"
      :style="{
        width: size || '40px',
        height: size || '40px',
        borderRadius: '50%'
      }"
    />
  </template>

  <!-- 图片 -->
  <template v-else-if="type === 'image'">
    <div
      class="skeleton-image"
      :style="{
        width: width || '100%',
        height: height || '200px',
        borderRadius: radius || '12px'
      }"
    />
  </template>

  <!-- 图表区域 -->
  <template v-else-if="type === 'chart'">
    <div
      class="skeleton-chart"
      :style="{
        width: width || '100%',
        height: height || '200px',
        borderRadius: radius || '12px'
      }"
    >
      <!-- 模拟柱状图 -->
      <div class="skeleton-chart-bars">
        <div
          v-for="(h, i) in chartHeights"
          :key="i"
          class="skeleton-chart-bar"
          :style="{ height: `${h}%` }"
        />
      </div>
      <!-- 模拟网格线 -->
      <div class="skeleton-chart-grid">
        <div v-for="i in 4" :key="i" class="skeleton-chart-grid-line" />
      </div>
    </div>
  </template>

  <!-- 卡片 -->
  <template v-else-if="type === 'card'">
    <div
      class="skeleton-card"
      :style="{
        width: width || '100%',
        padding: padding || '20px',
        borderRadius: radius || '16px'
      }"
    >
      <div class="skeleton-card-header">
        <div class="skeleton-avatar" :style="{ width: '48px', height: '48px' }" />
        <div class="skeleton-card-header-text">
          <div class="skeleton-title" style="width: 60%; height: 16px; margin-bottom: 8px;" />
          <div class="skeleton-text" style="width: 40%; height: 12px;" />
        </div>
      </div>
      <div class="skeleton-card-body">
        <div v-for="i in 3" :key="i" class="skeleton-text" :style="{ marginBottom: '8px', width: `${100 - i * 10}%` }" />
      </div>
      <div class="skeleton-card-footer">
        <div class="skeleton-text" style="width: 80px; height: 28px; border-radius: 6px;" />
        <div class="skeleton-text" style="width: 60px; height: 28px; border-radius: 6px;" />
      </div>
    </div>
  </template>

  <!-- KPI 卡片 -->
  <template v-else-if="type === 'kpi'">
    <div
      class="skeleton-kpi"
      :style="{
        width: width || '100%',
        padding: padding || '20px',
        borderRadius: radius || '12px'
      }"
    >
      <div class="skeleton-kpi-icon" />
      <div class="skeleton-kpi-content">
        <div class="skeleton-kpi-value" />
        <div class="skeleton-kpi-label" />
      </div>
    </div>
  </template>

  <!-- 列表项 -->
  <template v-else-if="type === 'list-item'">
    <div
      class="skeleton-list-item"
      :style="{
        padding: padding || '12px 16px',
        borderRadius: radius || '8px'
      }"
    >
      <div v-if="showAvatar" class="skeleton-avatar" :style="{ width: avatarSize || '40px', height: avatarSize || '40px' }" />
      <div class="skeleton-list-item-content">
        <div class="skeleton-text" :style="{ width: titleWidth || '70%', height: '14px', marginBottom: '6px' }" />
        <div class="skeleton-text" :style="{ width: descWidth || '50%', height: '12px' }" />
      </div>
    </div>
  </template>

  <!-- Paragraph 段落 -->
  <template v-else-if="type === 'paragraph'">
    <div class="skeleton-paragraph" :style="{ width: width || '100%' }">
      <div
        v-for="(line, i) in lines"
        :key="i"
        class="skeleton-text"
        :style="{
          width: i === lines - 1 ? lastLineWidth || '40%' : '100%',
          height: height || '14px',
          marginBottom: i < lines - 1 ? '8px' : '0'
        }"
      />
    </div>
  </template>

  <!-- 自定义默认 -->
  <template v-else>
    <div
      class="skeleton-base skeleton--shimmer"
      :style="{
        width: width || '100%',
        height: height || '20px',
        borderRadius: radius || '4px'
      }"
    />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'title' | 'avatar' | 'image' | 'chart' | 'card' | 'kpi' | 'list-item' | 'paragraph' | 'custom'
  width?: string
  height?: string
  radius?: string
  padding?: string
  size?: string
  lines?: number
  lastLineWidth?: string
  titleWidth?: string
  descWidth?: string
  showAvatar?: boolean
  avatarSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'custom',
  width: '100%',
  height: '20px',
  radius: '4px',
  padding: undefined,
  size: '40px',
  lines: 3,
  lastLineWidth: '40%',
  titleWidth: '70%',
  descWidth: '50%',
  showAvatar: true,
  avatarSize: '40px',
})

// 图表柱状图高度（模拟真实图表）
const chartHeights = computed(() => {
  return [65, 80, 45, 90, 55, 70, 85, 50, 75, 60]
})
</script>

<style scoped>
/* ==================== 基础骨架 ==================== */
.skeleton-base {
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton--shimmer {
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ==================== 文本骨架 ==================== */
.skeleton-text {
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* ==================== 标题骨架 ==================== */
.skeleton-title {
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* ==================== 头像骨架 ==================== */
.skeleton-avatar {
  background: #F1F5F9;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ==================== 图片骨架 ==================== */
.skeleton-image {
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.skeleton-image::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  height: 40%;
  border: 2px dashed #CBD5E1;
  border-radius: 8px;
}

/* ==================== 图表骨架 ==================== */
.skeleton-chart {
  background: #FAFAFA;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 16px;
}

.skeleton-chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 70%;
  z-index: 1;
}

.skeleton-chart-bar {
  width: 8%;
  background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
  border-radius: 4px 4px 0 0;
}

.skeleton-chart-grid {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.skeleton-chart-grid-line {
  height: 1px;
  background: #E2E8F0;
  border-style: dashed;
}

/* ==================== 卡片骨架 ==================== */
.skeleton-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-card-header-text {
  flex: 1;
}

.skeleton-card-body {
  margin-bottom: 16px;
}

.skeleton-card-footer {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #F1F5F9;
}

/* ==================== KPI 骨架 ==================== */
.skeleton-kpi {
  background: #FAFAFA;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #F1F5F9;
  flex-shrink: 0;
}

.skeleton-kpi-content {
  flex: 1;
}

.skeleton-kpi-value {
  width: 80px;
  height: 28px;
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-kpi-label {
  width: 60px;
  height: 12px;
  background: #F1F5F9;
  border-radius: 4px;
}

/* ==================== 列表项骨架 ==================== */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FFFFFF;
  border-bottom: 1px solid #F1F5F9;
}

.skeleton-list-item:last-child {
  border-bottom: none;
}

.skeleton-list-item-content {
  flex: 1;
}

/* ==================== 段落骨架 ==================== */
.skeleton-paragraph {
  display: flex;
  flex-direction: column;
}
</style>
