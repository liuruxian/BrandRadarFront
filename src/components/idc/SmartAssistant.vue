// 智能推荐引擎和冲突提示组件
// 更新时间: 2026-04-10
<template>
  <div class="smart-assistant">
    <!-- 冲突提示 -->
    <transition-group name="fade" tag="div" class="conflict-list">
      <div
        v-for="conflict in conflicts"
        :key="conflict.type"
        class="conflict-item"
        :class="`severity-${conflict.severity}`"
      >
        <component :is="getSeverityIcon(conflict.severity)" class="conflict-icon" />
        <div class="conflict-content">
          <div class="conflict-title">{{ conflict.message }}</div>
          <div v-if="conflict.suggestion" class="conflict-suggestion">
            建议: {{ conflict.suggestion }}
          </div>
        </div>
        <n-button text size="tiny" @click="dismissConflict(conflict.type)">
          <CloseIcon />
        </n-button>
      </div>
    </transition-group>

    <!-- 智能推荐 -->
    <div v-if="recommendations.length > 0" class="recommendations">
      <div class="section-header">
        <SparklesIcon class="section-icon" />
        <span>智能推荐</span>
        <n-badge :value="recommendations.length" type="success" />
      </div>

      <div class="recommendation-list">
        <div
          v-for="rec in sortedRecommendations"
          :key="rec.type"
          class="recommendation-item"
          @click="applyRecommendation(rec)"
        >
          <div class="rec-header">
            <span class="rec-title">{{ rec.title }}</span>
            <div class="rec-confidence">
              <n-progress
                type="line"
                :percentage="rec.confidence * 100"
                :show-indicator="false"
                :height="4"
                :stroke-width="4"
                :color="getConfidenceColor(rec.confidence)"
              />
              <span class="confidence-text">{{ (rec.confidence * 100).toFixed(0) }}%</span>
            </div>
          </div>
          <div class="rec-description">{{ rec.description }}</div>
          <div class="rec-reason">{{ rec.reason }}</div>
          <n-button size="tiny" type="primary" ghost>
            应用推荐
          </n-button>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="section-header">
        <LightningIcon class="section-icon" />
        <span>快捷操作</span>
      </div>
      <div class="action-buttons">
        <n-button size="small" @click="handleOptimize">
          <template #icon>
            <OptimizeIcon />
          </template>
          优化配置
        </n-button>
        <n-button size="small" @click="handleSuggestView">
          <template #icon>
            <ChartIcon />
          </template>
          推荐视图
        </n-button>
        <n-button size="small" @click="handleSaveAsTemplate">
          <template #icon>
            <SaveIcon />
          </template>
          保存模板
        </n-button>
      </div>
    </div>

    <!-- 数据质量提示 -->
    <div v-if="dataQuality" class="data-quality">
      <div class="section-header">
        <ChartIcon class="section-icon" />
        <span>数据质量</span>
      </div>
      <div class="quality-metrics">
        <div class="metric">
          <span class="metric-label">预估行数</span>
          <span class="metric-value">{{ dataQuality.estimatedRows.toLocaleString() }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">数据稀疏度</span>
          <n-progress
            type="line"
            :percentage="dataQuality.dataSparsity"
            :show-indicator="false"
            :height="6"
            :stroke-width="6"
            status="warning"
          />
        </div>
        <div class="metric">
          <span class="metric-label">置信度</span>
          <n-progress
            type="line"
            :percentage="dataQuality.confidence * 100"
            :show-indicator="false"
            :height="6"
            :stroke-width="6"
            status="success"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NButton,
  NBadge,
  NProgress,
  useMessage,
} from 'naive-ui'
import {
  Close as CloseIcon,
  AlertCircle as AlertIcon,
  Warning as WarningIcon,
  InformationCircle as InfoIcon,
  Sparkles as SparklesIcon,
  Flash as LightningIcon,
  AnalyticsOutline as ChartIcon,
  RocketOutline as OptimizeIcon,
  SaveOutline as SaveIcon,
} from '@vicons/ionicons5'
import type { ConflictInfo, Recommendation, ValidateConfigResponse } from '@/api/idcApiTypes'

// Props定义
interface Props {
  conflicts?: ConflictInfo[]
  recommendations?: Recommendation[]
  dataQuality?: ValidateConfigResponse['dataQuality']
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  conflicts: () => [],
  recommendations: () => [],
  dataQuality: undefined,
  loading: false,
})

// Emits定义
const emit = defineEmits<{
  (e: 'dismiss-conflict', type: string): void
  (e: 'apply-recommendation', recommendation: Recommendation): void
  (e: 'optimize'): void
  (e: 'suggest-view'): void
  (e: 'save-template'): void
}>()

const message = useMessage()

// 内部冲突状态
const conflicts = ref<ConflictInfo[]>(props.conflicts)

// 监听props变化
watch(
  () => props.conflicts,
  (newConflicts) => {
    conflicts.value = [...newConflicts]
  }
)

// 排序后的推荐（按优先级和置信度）
const sortedRecommendations = computed(() => {
  return [...props.recommendations].sort((a, b) => {
    // 先按优先级排序
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    // 再按置信度排序
    return b.confidence - a.confidence
  })
})

// 获取严重程度图标
function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'error':
      return AlertIcon
    case 'warning':
      return WarningIcon
    default:
      return InfoIcon
  }
}

// 获取置信度颜色
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10B981'
  if (confidence >= 0.6) return '#F59E0B'
  return '#EF4444'
}

// 关闭冲突提示
function dismissConflict(type: string) {
  conflicts.value = conflicts.value.filter((c) => c.type !== type)
  emit('dismiss-conflict', type)
}

// 应用推荐
function applyRecommendation(rec: Recommendation) {
  emit('apply-recommendation', rec)
  message.success(`已应用推荐: ${rec.title}`)
}

// 优化配置
function handleOptimize() {
  emit('optimize')
}

// 推荐视图
function handleSuggestView() {
  emit('suggest-view')
}

// 保存为模板
function handleSaveAsTemplate() {
  emit('save-template')
}
</script>

<style scoped>
.smart-assistant {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

/* 冲突提示样式 */
.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conflict-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: white;
}

.conflict-item.severity-error {
  border-left: 3px solid #ef4444;
  background: #fef2f2;
}

.conflict-item.severity-warning {
  border-left: 3px solid #f59e0b;
  background: #fffbeb;
}

.conflict-item.severity-info {
  border-left: 3px solid #3b82f6;
  background: #eff6ff;
}

.conflict-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.severity-error .conflict-icon {
  color: #ef4444;
}

.severity-warning .conflict-icon {
  color: #f59e0b;
}

.severity-info .conflict-icon {
  color: #3b82f6;
}

.conflict-content {
  flex: 1;
  min-width: 0;
}

.conflict-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.conflict-suggestion {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 推荐样式 */
.recommendations {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.section-icon {
  font-size: 16px;
  color: #6366f1;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.recommendation-item:hover {
  border-color: #6366f1;
  background: #f9fafb;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.rec-title {
  font-weight: 600;
  font-size: 13px;
  color: #111827;
}

.rec-confidence {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
}

.confidence-text {
  font-size: 11px;
  color: #6b7280;
  width: 32px;
  text-align: right;
}

.rec-description {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.rec-reason {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 8px;
  font-style: italic;
}

/* 快捷操作 */
.quick-actions {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 数据质量 */
.data-quality {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  flex-shrink: 0;
  width: 80px;
  font-size: 12px;
  color: #6b7280;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.metric .n-progress {
  flex: 1;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
