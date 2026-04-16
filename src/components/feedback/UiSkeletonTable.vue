<!--
  UiSkeletonTable.vue - 表格骨架屏组件
  1:1 映射真实表格结构，支持多种列类型
  更新时间: 2026-04-16
-->
<template>
  <div class="skeleton-table-wrapper" :style="{ maxHeight: maxHeight }">
    <!-- 表头 -->
    <div class="skeleton-table-header">
      <div
        v-if="showIndex"
        class="skeleton-th skeleton-th-index"
      >
        <span class="skeleton-th-text">#</span>
      </div>
      <div
        v-for="col in columns"
        :key="col.key"
        class="skeleton-th"
        :style="{
          width: col.width || 'auto',
          flex: col.width ? 'none' : '1',
          textAlign: col.align || 'left'
        }"
      >
        <span class="skeleton-th-text">{{ col.title }}</span>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="skeleton-table-body">
      <div
        v-for="rowIndex in displayRows"
        :key="rowIndex"
        class="skeleton-table-row"
      >
        <!-- 序号列 -->
        <div
          v-if="showIndex"
          class="skeleton-td skeleton-td-index"
        >
          <div class="skeleton skeleton-cell-index" />
        </div>

        <!-- 数据列 -->
        <div
          v-for="col in columns"
          :key="col.key"
          class="skeleton-td"
          :style="{
            width: col.width || 'auto',
            flex: col.width ? 'none' : '1',
            textAlign: col.align || 'left'
          }"
        >
          <!-- 图片列 -->
          <template v-if="col.type === 'image'">
            <div class="skeleton-cell-image">
              <div class="skeleton skeleton-img" />
            </div>
          </template>

          <!-- 头像列 -->
          <template v-else-if="col.type === 'avatar'">
            <div class="skeleton-cell-avatar">
              <div class="skeleton skeleton-avatar" :style="{ width: col.cellWidth || '36px', height: col.cellWidth || '36px' }" />
            </div>
          </template>

          <!-- 标签列 (状态) -->
          <template v-else-if="col.type === 'tag'">
            <div class="skeleton-cell-tag">
              <div
                class="skeleton skeleton-tag"
                :class="getTagClass(rowIndex)"
                :style="{ width: col.tagWidth || '60px' }"
              />
            </div>
          </template>

          <!-- 进度列 -->
          <template v-else-if="col.type === 'progress'">
            <div class="skeleton-cell-progress">
              <div class="skeleton-progress-bar">
                <div class="skeleton-progress-fill" :style="{ width: `${getProgressWidth(rowIndex)}%` }" />
              </div>
            </div>
          </template>

          <!-- 价格列 -->
          <template v-else-if="col.type === 'price'">
            <div class="skeleton-cell-price">
              <div class="skeleton skeleton-price" />
            </div>
          </template>

          <!-- 操作列 -->
          <template v-else-if="col.type === 'action'">
            <div class="skeleton-cell-action">
              <div class="skeleton skeleton-action-btn" />
              <div class="skeleton skeleton-action-btn" />
            </div>
          </template>

          <!-- 默认文本列 -->
          <template v-else>
            <div
              class="skeleton-cell-text"
              :style="{ width: getTextWidth(col, rowIndex) }"
            >
              <div class="skeleton skeleton-text" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 分页骨架 (可选) -->
    <div v-if="showPagination" class="skeleton-table-pagination">
      <div class="skeleton-pagination-info">
        <div class="skeleton skeleton-text" style="width: 120px; height: 12px;" />
      </div>
      <div class="skeleton-pagination-buttons">
        <div class="skeleton skeleton-page-btn" />
        <div class="skeleton skeleton-page-btn" />
        <div class="skeleton skeleton-page-btn active" />
        <div class="skeleton skeleton-page-btn" />
        <div class="skeleton skeleton-page-btn" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SkeletonColumn {
  key: string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'image' | 'avatar' | 'tag' | 'progress' | 'price' | 'action'
  cellWidth?: string
  tagWidth?: string
}

interface Props {
  columns: SkeletonColumn[]
  rows?: number
  loading?: boolean
  showIndex?: boolean
  showPagination?: boolean
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 8,
  loading: true,
  showIndex: false,
  showPagination: false,
  maxHeight: 'none',
})

const displayRows = computed(() => props.loading ? props.rows : 0)

// 根据行号生成不同的文本宽度（模拟真实数据）
function getTextWidth(col: SkeletonColumn, rowIndex: number): string {
  const widths = ['65%', '80%', '55%', '70%', '45%', '75%', '60%', '85%']
  const index = (rowIndex + col.key.length) % widths.length
  return widths[index]
}

// 标签样式类
function getTagClass(rowIndex: number): string {
  const classes = ['tag-primary', 'tag-success', 'tag-warning']
  return classes[rowIndex % classes.length]
}

// 进度条宽度
function getProgressWidth(rowIndex: number): number {
  const widths = [30, 50, 70, 45, 85, 60, 40, 75, 55, 90]
  return widths[rowIndex % widths.length]
}
</script>

<style scoped>
/* ==================== 表格容器 ==================== */
.skeleton-table-wrapper {
  width: 100%;
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

/* ==================== 表头 ==================== */
.skeleton-table-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.skeleton-th {
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.skeleton-th-index {
  width: 50px;
  flex: none;
  justify-content: center;
}

.skeleton-th-text {
  display: inline-block;
  background: #E2E8F0;
  height: 12px;
  border-radius: 3px;
}

/* ==================== 表格内容 ==================== */
.skeleton-table-body {
  padding: 0;
}

/* ==================== 表格行 ==================== */
.skeleton-table-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #F1F5F9;
  transition: background-color 0.2s;
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-table-row:hover {
  background: #FDF2F8;
}

/* ==================== 单元格 ==================== */
.skeleton-td {
  display: flex;
  align-items: center;
  padding: 0 8px;
  min-height: 24px;
}

.skeleton-td-index {
  width: 50px;
  flex: none;
  justify-content: center;
}

/* ==================== 单元格骨架样式 ==================== */
.skeleton {
  background: linear-gradient(90deg, #F8FAFC 25%, #E2E8F0 50%, #F8FAFC 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 序号 */
.skeleton-cell-index {
  width: 24px;
  height: 14px;
  border-radius: 4px;
}

/* 文本 */
.skeleton-cell-text {
  width: 100%;
}

.skeleton-text {
  height: 14px;
  border-radius: 4px;
}

/* 图片 */
.skeleton-cell-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

/* 头像 */
.skeleton-cell-avatar {
  display: flex;
  align-items: center;
}

.skeleton-avatar {
  border-radius: 50%;
}

/* 标签 */
.skeleton-cell-tag {
  display: flex;
  align-items: center;
}

.skeleton-tag {
  height: 22px;
  border-radius: 11px;
}

.skeleton-tag.tag-primary {
  background: linear-gradient(90deg, rgba(236, 72, 153, 0.15) 25%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-tag.tag-success {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 25%, rgba(16, 185, 129, 0.25) 50%, rgba(16, 185, 129, 0.15) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-tag.tag-warning {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.15) 25%, rgba(245, 158, 11, 0.25) 50%, rgba(245, 158, 11, 0.15) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* 进度条 */
.skeleton-cell-progress {
  width: 100%;
  max-width: 120px;
}

.skeleton-progress-bar {
  width: 100%;
  height: 8px;
  background: #F1F5F9;
  border-radius: 4px;
  overflow: hidden;
}

.skeleton-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #EC4899 0%, #8B5CF6 100%);
  border-radius: 4px;
  animation: progress-grow 1.5s ease-out forwards;
}

@keyframes progress-grow {
  from { width: 0; }
  to { width: inherit; }
}

/* 价格 */
.skeleton-cell-price {
  width: 80px;
}

.skeleton-price {
  width: 60px;
  height: 14px;
  border-radius: 4px;
}

/* 操作按钮 */
.skeleton-cell-action {
  display: flex;
  gap: 8px;
}

.skeleton-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

/* ==================== 分页骨架 ==================== */
.skeleton-table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-top: 1px solid #F1F5F9;
}

.skeleton-pagination-info {
  flex: 1;
}

.skeleton-pagination-buttons {
  display: flex;
  gap: 6px;
}

.skeleton-page-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.skeleton-page-btn.active {
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
</style>
