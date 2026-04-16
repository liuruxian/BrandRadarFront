<!--
  UiEmpty.vue - 空状态组件
  支持多种空状态类型
  更新时间: 2026-04-16
-->
<template>
  <div class="ui-empty" :class="[`ui-empty-${type}`]">
    <!-- 图标 -->
    <div class="ui-empty-icon">
      <!-- 无数据 -->
      <svg v-if="type === 'no-data'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4" />
        <path d="M22 32h20M32 22v20" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- 无结果 -->
      <svg v-else-if="type === 'no-result'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#CBD5E1" stroke-width="2" />
        <circle cx="26" cy="26" r="6" stroke="#CBD5E1" stroke-width="2" />
        <line x1="38" y1="38" x2="50" y2="50" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
        <line x1="44" y1="38" x2="50" y2="32" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
        <line x1="50" y1="38" x2="44" y2="32" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- 筛选无结果 -->
      <svg v-else-if="type === 'no-filter'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M12 12l40 40M52 12L12 52" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
        <circle cx="32" cy="32" r="20" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4" />
        <path d="M24 32h16M32 24v16" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- 自定义图标 -->
      <slot v-else name="icon" />
    </div>

    <!-- 标题 -->
    <h3 class="ui-empty-title">{{ title }}</h3>

    <!-- 描述 -->
    <p v-if="description" class="ui-empty-description">{{ description }}</p>

    <!-- 操作按钮 -->
    <div v-if="$slots.action" class="ui-empty-action">
      <slot name="action" />
    </div>

    <!-- 预设操作按钮 -->
    <div v-else-if="actionText" class="ui-empty-action">
      <button
        v-if="actionType === 'primary'"
        class="ui-empty-btn ui-empty-btn-primary"
        @click="$emit('action')"
      >
        {{ actionText }}
      </button>
      <button
        v-else-if="actionType === 'text'"
        class="ui-empty-btn ui-empty-btn-text"
        @click="$emit('action')"
      >
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'no-data' | 'no-result' | 'no-filter' | 'custom'
  title?: string
  description?: string
  actionText?: string
  actionType?: 'primary' | 'text'
}

withDefaults(defineProps<Props>(), {
  type: 'no-data',
  title: '暂无数据',
  description: '',
  actionText: '',
  actionType: 'primary',
})

defineEmits<{
  'action': []
}>()
</script>

<style scoped>
/* ==================== 容器 ==================== */
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 图标 ==================== */
.ui-empty-icon {
  margin-bottom: 20px;
  color: #CBD5E1;
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

/* ==================== 标题 ==================== */
.ui-empty-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* ==================== 描述 ==================== */
.ui-empty-description {
  margin: 0 0 20px;
  font-size: 14px;
  color: #6B7280;
  max-width: 320px;
  line-height: 1.6;
}

/* ==================== 操作按钮 ==================== */
.ui-empty-action {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ui-empty-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
}

.ui-empty-btn:active {
  transform: scale(0.98);
}

.ui-empty-btn-primary {
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
  color: #FFFFFF;
}

.ui-empty-btn-primary:hover {
  filter: brightness(1.05);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.ui-empty-btn-text {
  background: transparent;
  color: #EC4899;
  padding: 0;
  height: auto;
}

.ui-empty-btn-text:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* ==================== 类型变体 ==================== */
.ui-empty-no-data .ui-empty-icon {
  color: #CBD5E1;
}

.ui-empty-no-result .ui-empty-icon {
  color: #94A3B8;
}

.ui-empty-no-filter .ui-empty-icon {
  color: #94A3B8;
}
</style>
