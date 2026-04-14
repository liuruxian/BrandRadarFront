# 基础组件 (Base Components)

> 所有基础 UI 元素统一使用 v5 基类，使用 CSS 令牌变量

---

## 组件目录

```
src/components/base/
 ├── BaseCard.vue          ← 玻璃卡片（核心）
 ├── BaseButton.vue        ← 品牌按钮
 ├── BaseInput.vue         ← 玻璃输入框
 ├── BaseSelect.vue        ← 选择器
 ├── BaseTag.vue           ← 标签组件
 ├── BaseBadge.vue         ← 徽章组件
 ├── BaseModal.vue         ← 玻璃弹窗
 ├── BaseDropdown.vue      ← 下拉菜单
 └── BaseSkeleton.vue      ← 骨架屏
```

---

## 组件设计原则

```
所有组件必须满足：
✔ 1. Props 驱动（无内部状态）
✔ 2. 使用 CSS 令牌变量
✔ 3. 包含 hover / focus / active 状态
✔ 4. 支持 disabled / loading 状态
✔ 5. TypeScript 类型完整
✔ 6. 导出到 src/components/index.ts
```

---

## BaseCard.vue — 玻璃卡片

### 设计规范

```
背景: var(--bg-glass) + backdrop-filter: blur(12px)
边框: 1px solid var(--border)
圆角: var(--radius-lg) (14px)
阴影: var(--card-shadow)
hover: translateY(-2px) + var(--card-shadow-hover)
glow: 可选（glow prop）
```

### Props 定义

```typescript
interface Props {
  /** 是否启用悬停动效，默认 true */
  hoverable?: boolean
  /** 是否启用 glow 效果，默认 false */
  glow?: boolean
  /** 内边距，none/sm/md/lg，默认 md */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** 圆角，sm/md/lg，默认 lg */
  radius?: 'sm' | 'md' | 'lg'
  /** 是否加粗边框 */
  border?: boolean
}
```

### 代码实现

```vue
<template>
  <div :class="['base-card', paddingClass, radiusClass, { hoverable, glow, bordered: border }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
  glow: false,
  padding: 'md',
  radius: 'lg',
  border: false,
})

const paddingClass = computed(() => `padding-${props.padding}`)
const radiusClass = computed(() => `radius-${props.radius}`)
</script>

<style scoped>
.base-card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  transition: var(--transition);
}

/* Padding */
.padding-none { padding: 0; }
.padding-sm { padding: var(--space-3); }
.padding-md { padding: var(--card-padding); }
.padding-lg { padding: var(--card-padding-lg); }

/* Radius */
.radius-sm { border-radius: var(--radius-sm); }
.radius-md { border-radius: var(--radius-md); }
.radius-lg { border-radius: var(--radius-lg); }

/* Hover */
.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--border-primary);
}

/* Glow */
.glow {
  box-shadow: var(--glow-primary);
}

.glow:hover {
  box-shadow: var(--glow-active), var(--card-shadow-hover);
}

/* Bordered */
.bordered {
  border: 1px solid var(--border-strong);
}
</style>
```

### 使用示例

```vue
<!-- 基本用法 -->
<BaseCard>
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</BaseCard>

<!-- 无 hover -->
<BaseCard :hoverable="false">
  静态卡片
</BaseCard>

<!-- Glow 效果 -->
<BaseCard glow>
  带光效的卡片
</BaseCard>

<!-- 大内边距 -->
<BaseCard padding="lg">
  宽松内边距
</BaseCard>
```

---

## BaseButton.vue — 品牌按钮

### 设计规范

```
主按钮: 品牌渐变背景 + 白色文字 + glow 阴影
次按钮: 透明背景 + 品牌边框 + 品牌文字
文字按钮: 无背景无边框 + 品牌文字

所有按钮: radius: var(--radius-button) (10px)
动效: hover scale(1.01) + translateY(-1px)
```

### Props 定义

```typescript
type ButtonType = 'primary' | 'secondary' | 'ghost' | 'text' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  /** 按钮类型，默认 primary */
  type?: ButtonType
  /** 按钮尺寸，默认 md */
  size?: ButtonSize
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否块级按钮 */
  block?: boolean
  /** 图标（可选） */
  icon?: string
}
```

### 代码实现

```vue
<template>
  <button
    :class="['base-btn', `btn-${type}`, `btn-${size}`, { disabled, loading, block }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Loading 状态 -->
    <span v-if="loading" class="btn-spinner">
      <svg class="spinner-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" />
      </svg>
    </span>

    <!-- 图标 -->
    <span v-else-if="icon" class="btn-icon" v-html="icon" />

    <!-- 内容 -->
    <span class="btn-content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<Props>()
defineEmits<{ (e: 'click', event: MouseEvent): void }>()
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-button);
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

/* Size */
.btn-sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
}

.btn-md {
  height: 38px;
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
}

.btn-lg {
  height: 44px;
  padding: 0 var(--space-6);
  font-size: var(--text-base);
}

/* Primary */
.btn-primary {
  background: var(--gradient);
  color: var(--text-inverse);
  box-shadow: 0 8px 20px rgba(102,126,234,0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 14px 30px rgba(102,126,234,0.30);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
}

/* Secondary */
.btn-secondary {
  background: var(--bg-glass);
  border: 1px solid var(--border-primary);
  color: var(--primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--primary-soft);
  transform: translateY(-1px);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--primary-soft);
  border-color: var(--border-primary);
  color: var(--primary);
}

/* Text */
.btn-text {
  background: transparent;
  color: var(--primary);
  padding: 0;
  height: auto;
}

.btn-text:hover:not(:disabled) {
  color: var(--secondary);
  text-decoration: underline;
}

/* Danger */
.btn-danger {
  background: var(--danger);
  color: var(--text-inverse);
  box-shadow: 0 8px 20px rgba(239,68,68,0.20);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(239,68,68,0.25);
  background: #DC2626;
}

/* Disabled */
.disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Loading */
.loading {
  cursor: wait;
}

.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Block */
.block {
  width: 100%;
}
</style>
```

### 使用示例

```vue
<!-- Primary -->
<BaseButton type="primary">提交</BaseButton>

<!-- Secondary -->
<BaseButton type="secondary">取消</BaseButton>

<!-- Ghost -->
<BaseButton type="ghost">了解更多</BaseButton>

<!-- 尺寸变体 -->
<BaseButton size="sm">小按钮</BaseButton>
<BaseButton size="lg">大按钮</BaseButton>

<!-- 状态 -->
<BaseButton :disabled="true">禁用</BaseButton>
<BaseButton :loading="true">加载中</BaseButton>
<BaseButton block>块级按钮</BaseButton>

<!-- 带图标 -->
<BaseButton icon="<svg>...</svg>">下载</BaseButton>
```

---

## BaseInput.vue — 玻璃输入框

### 设计规范

```
背景: var(--bg-base)（非玻璃，更适合输入）
边框: 1px solid var(--border)
hover: border-color 变亮
focus: border-color 品牌色 + glow
圆角: var(--radius-input) (10px)
```

### Props 定义

```typescript
type InputSize = 'sm' | 'md' | 'lg'
type InputType = 'text' | 'password' | 'email' | 'number' | 'search'

interface Props {
  /** 输入框类型 */
  type?: InputType
  /** 尺寸 */
  size?: InputSize
  /** 占位符 */
  placeholder?: string
  /** 值（v-model） */
  modelValue?: string | number
  /** 禁用 */
  disabled?: boolean
  /** 只读 */
  readonly?: boolean
  /** 前缀图标 */
  prefix?: string
  /** 后缀图标 */
  suffix?: string
  /** 错误状态 */
  error?: string
}
```

### 代码实现

```vue
<template>
  <div :class="['base-input-wrapper', `size-${size}`, { disabled, error: !!error }]">
    <!-- 前缀 -->
    <span v-if="prefix" class="input-prefix" v-html="prefix" />

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="base-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <!-- 后缀 -->
    <span v-if="suffix" class="input-suffix" v-html="suffix" />

    <!-- 清除按钮 -->
    <button v-if="modelValue && !disabled" class="input-clear" @click="$emit('update:modelValue', '')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <!-- 错误信息 -->
  <p v-if="error" class="input-error">{{ error }}</p>
</template>

<script setup lang="ts">
withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  modelValue: '',
})

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped>
.base-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  transition: var(--transition);
}

.base-input-wrapper:hover:not(.disabled) {
  border-color: var(--border-strong);
}

.base-input-wrapper:focus-within:not(.disabled) {
  border-color: var(--primary);
  box-shadow: var(--glow-primary);
}

.base-input-wrapper.error {
  border-color: var(--danger);
}

.base-input-wrapper.error:focus-within {
  box-shadow: var(--glow-danger);
}

/* Size */
.size-sm { height: 32px; }
.size-md { height: 38px; }
.size-lg { height: 44px; }

.base-input {
  flex: 1;
  height: 100%;
  padding: 0 var(--space-3);
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  outline: none;
}

.base-input::placeholder {
  color: var(--text-muted);
}

.base-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-3);
  color: var(--text-muted);
}

.input-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.input-clear:hover {
  background: var(--border);
  color: var(--text-primary);
}

.input-error {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--danger);
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

### 使用示例

```vue
<!-- 基本用法 -->
<BaseInput
  v-model="name"
  placeholder="请输入名称"
/>

<!-- 带前缀 -->
<BaseInput
  v-model="email"
  type="email"
  prefix="<svg>...</svg>"
  placeholder="邮箱"
/>

<!-- 错误状态 -->
<BaseInput
  v-model="value"
  :error="'输入不合法'"
/>

<!-- 禁用 -->
<BaseInput
  v-model="value"
  :disabled="true"
  placeholder="禁用"
/>
```

---

## BaseTag.vue — 标签组件

### Props 定义

```typescript
type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
type TagSize = 'sm' | 'md'

interface Props {
  /** 变体 */
  variant?: TagVariant
  /** 尺寸 */
  size?: TagSize
  /** 是否可关闭 */
  closable?: boolean
}
```

### 代码实现

```vue
<template>
  <span :class="['base-tag', `tag-${variant}`, `tag-${size}`]">
    <slot />
    <button v-if="closable" class="tag-close" @click="$emit('close')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

defineEmits<{ (e: 'close'): void }>()
</script>

<style scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border-radius: var(--radius-badge);
  font-weight: var(--font-medium);
  transition: var(--transition);
}

/* Size */
.tag-sm {
  padding: 2px 8px;
  font-size: var(--text-xs);
}

.tag-md {
  padding: 4px 10px;
  font-size: var(--text-xs);
}

/* Variant */
.tag-default {
  background: var(--border);
  color: var(--text-secondary);
}

.tag-primary {
  background: var(--primary-soft);
  color: var(--primary);
}

.tag-success {
  background: var(--success-soft);
  color: var(--success);
}

.tag-warning {
  background: var(--warning-soft);
  color: var(--warning);
}

.tag-danger {
  background: var(--danger-soft);
  color: var(--danger);
}

.tag-info {
  background: var(--info-soft);
  color: var(--info);
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(--transition);
}

.tag-close:hover {
  opacity: 1;
}
</style>
```

### 使用示例

```vue
<BaseTag variant="default">默认</BaseTag>
<BaseTag variant="primary">主要</BaseTag>
<BaseTag variant="success">成功</BaseTag>
<BaseTag variant="warning">警告</BaseTag>
<BaseTag variant="danger">危险</BaseTag>
<BaseTag variant="info">信息</BaseTag>
<BaseTag closable @close="handleClose">可关闭</BaseTag>
```

---

## BaseBadge.vue — 徽章组件

### Props 定义

```typescript
type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  /** 是否显示点状 */
  dot?: boolean
  /** 是否闪烁（通知类） */
  pulse?: boolean
}
```

### 代码实现

```vue
<template>
  <span :class="['base-badge', `badge-${variant}`, `badge-${size}`, { dot, pulse }]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  border-radius: var(--radius-badge);
}

/* Size */
.badge-sm {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
}

.badge-md {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  font-size: var(--text-xs);
}

/* Variant */
.badge-primary { background: var(--primary); color: white; }
.badge-success { background: var(--success); color: white; }
.badge-warning { background: var(--warning); color: white; }
.badge-danger { background: var(--danger); color: white; }
.badge-info { background: var(--info); color: white; }
.badge-neutral { background: var(--chart-9); color: white; }

/* Dot */
.dot {
  min-width: 8px;
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
}

/* Pulse */
.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

### 使用示例

```vue
<!-- 数字徽章 -->
<BaseBadge variant="danger">3</BaseBadge>

<!-- 点状 -->
<BaseBadge variant="danger" dot />

<!-- 闪烁 -->
<BaseBadge variant="warning" pulse>新</BaseBadge>
```

---

## BaseModal.vue — 玻璃弹窗

### Props 定义

```typescript
interface Props {
  /** 是否显示 */
  modelValue: boolean
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: string
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否显示遮罩 */
  mask?: boolean
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
}
```

### 代码实现

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-mask" @click.self="handleMaskClick">
        <div class="modal-container" :style="{ maxWidth: width || '520px' }">
          <!-- Header -->
          <div v-if="title || closable" class="modal-header">
            <h3 v-if="title" class="modal-title">{{ title }}</h3>
            <button v-if="closable" class="modal-close" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<Props>(), {
  width: '520px',
  closable: true,
  mask: true,
  maskClosable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

function handleMaskClick() {
  if (props.maskClosable) {
    close()
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(6px);
  z-index: 1000;
}

.modal-container {
  width: 100%;
  background: var(--bg-soft);
  border-radius: var(--radius-modal);
  box-shadow: var(--modal-shadow);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition);
}

.modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--space-5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--duration-normal) var(--ease);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all var(--duration-normal) var(--ease);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
```

### 使用示例

```vue
<BaseModal v-model="visible" title="编辑品牌" width="600px">
  <p>弹窗内容</p>

  <template #footer>
    <BaseButton type="ghost" @click="visible = false">取消</BaseButton>
    <BaseButton type="primary" @click="handleSave">保存</BaseButton>
  </template>
</BaseModal>
```

---

## 统一导出

在 `src/components/index.ts` 中导出所有组件：

```typescript
// Base Components
export { default as BaseCard } from './base/BaseCard.vue'
export { default as BaseButton } from './base/BaseButton.vue'
export { default as BaseInput } from './base/BaseInput.vue'
export { default as BaseSelect } from './base/BaseSelect.vue'
export { default as BaseTag } from './base/BaseTag.vue'
export { default as BaseBadge } from './base/BaseBadge.vue'
export { default as BaseModal } from './base/BaseModal.vue'
export { default as BaseDropdown } from './base/BaseDropdown.vue'
export { default as BaseSkeleton } from './base/BaseSkeleton.vue'

// Layout Components
export { default as AppLayout } from './layout/AppLayout.vue'
export { default as AppSidebar } from './layout/AppSidebar.vue'
export { default as AppTopbar } from './layout/AppTopbar.vue'
```
