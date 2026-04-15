// 模板管理组件 - 我的模板列表和操作
// 更新时间: 2026-04-10
<template>
  <div class="template-manager">
    <!-- 模板列表标签页 -->
    <n-tabs v-model:value="activeTab" type="line">
      <!-- 系统模板 -->
      <n-tab-pane name="system" tab="系统模板">
        <div class="template-list">
          <div
            v-for="template in systemTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplate?.id === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="card-header">
              <span class="template-name">{{ template.name }}</span>
              <n-badge :value="template.categoryLabel" type="info" />
            </div>
            <div class="card-desc">{{ template.description }}</div>
            <div class="card-meta">
              <span class="meta-item">
                <GridIcon />
                {{ template.row_fields.length }} 个维度
              </span>
              <span class="meta-item">
                <CalculatorIcon />
                {{ template.value_configs.length }} 个统计量
              </span>
            </div>
            <div class="card-footer">
              <n-button size="tiny" @click.stop="applyTemplate(template)">
                应用
              </n-button>
              <n-button size="tiny" @click.stop="viewTemplate(template)">
                预览
              </n-button>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <!-- 我的模板 -->
      <n-tab-pane name="my" tab="我的模板">
        <template #tab>
          <span>我的模板</span>
          <n-badge v-if="myTemplates.length > 0" :value="myTemplates.length" type="success" />
        </template>

        <div v-if="myTemplates.length > 0" class="template-list">
          <div
            v-for="template in myTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplate?.id === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="card-header">
              <span class="template-name">{{ template.name }}</span>
              <n-tag size="tiny" :type="getShareTypeTag(template.share_status)">
                {{ getShareLabel(template.share_status) }}
              </n-tag>
            </div>
            <div class="card-desc">{{ template.description }}</div>
            <div class="card-meta">
              <span class="meta-item">
                <TimeIcon />
                {{ formatDate(template.updated_at) }}
              </span>
              <span v-if="template.version" class="meta-item">
                <LayersIcon />
                v{{ template.version }}
              </span>
            </div>
            <div class="card-footer">
              <n-button size="tiny" type="primary" @click.stop="applyTemplate(template)">
                应用
              </n-button>
              <n-button size="tiny" @click.stop="editTemplate(template)">
                编辑
              </n-button>
              <n-button size="tiny" @click.stop="cloneTemplate(template)">
                复制
              </n-button>
              <n-button size="tiny" type="error" ghost @click.stop="deleteTemplate(template)">
                删除
              </n-button>
            </div>
          </div>
        </div>
        <n-empty v-else description="暂无自定义模板" class="empty-state">
          <template #extra>
            <n-button type="primary" size="small" @click="handleSaveCurrent">
              <template #icon>
                <AddIcon />
              </template>
              保存当前配置
            </n-button>
          </template>
        </n-empty>
      </n-tab-pane>

      <!-- 分类浏览 -->
      <n-tab-pane name="category" tab="分类浏览">
        <n-collapse>
          <n-collapse-item
            v-for="category in categoryTemplates"
            :key="category.key"
            :title="category.label"
            :name="category.key"
          >
            <template #header-extra>
              <n-badge :value="category.templates.length" type="info" />
            </template>
            <div class="category-list">
              <div
                v-for="template in category.templates"
                :key="template.id"
                class="category-item"
                @click="applyTemplate(template)"
              >
                <span class="item-name">{{ template.name }}</span>
                <span class="item-desc">{{ template.description }}</span>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </n-tab-pane>
    </n-tabs>

    <!-- 保存模板弹窗 -->
    <n-modal
      v-model:show="showSaveModal"
      preset="card"
      title="保存为模板"
      style="width: 500px"
      :bordered="false"
    >
      <n-form ref="formRef" :model="saveForm" label-placement="top">
        <n-form-item label="模板名称" path="name" required>
          <n-input v-model:value="saveForm.name" placeholder="请输入模板名称" />
        </n-form-item>
        <n-form-item label="模板描述" path="description">
          <n-input
            v-model:value="saveForm.description"
            type="textarea"
            placeholder="请输入模板描述"
            :rows="3"
          />
        </n-form-item>
        <n-form-item label="模板分类" path="category" required>
          <n-select
            v-model:value="saveForm.category"
            :options="categoryOptions"
            placeholder="选择模板分类"
          />
        </n-form-item>
        <n-form-item label="分享设置" path="share_status">
          <n-radio-group v-model:value="saveForm.share_status">
            <n-space>
              <n-radio value="private">私有</n-radio>
              <n-radio value="team">团队共享</n-radio>
              <n-radio value="public">公开</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSaveModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">
            保存
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 模板详情弹窗 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="selectedTemplate?.name || '模板详情'"
      style="width: 600px"
      :bordered="false"
    >
      <div v-if="selectedTemplate" class="template-detail">
        <n-descriptions :column="2" bordered size="small">
          <n-descriptions-item label="名称">
            {{ selectedTemplate.name }}
          </n-descriptions-item>
          <n-descriptions-item label="分类">
            {{ selectedTemplate.categoryLabel }}
          </n-descriptions-item>
          <n-descriptions-item label="描述" :span="2">
            {{ selectedTemplate.description }}
          </n-descriptions-item>
          <n-descriptions-item label="行维度" :span="2">
            {{ selectedTemplate.row_fields.join(' → ') }}
          </n-descriptions-item>
          <n-descriptions-item v-if="selectedTemplate.col_field" label="列维度">
            {{ selectedTemplate.col_field }}
          </n-descriptions-item>
          <n-descriptions-item label="统计量">
            {{ selectedTemplate.value_configs?.length || 0 }}个统计量
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="handleApplyDetail">
            应用此模板
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NTabs,
  NTabPane,
  NButton,
  NBadge,
  NTag,
  NEmpty,
  NCollapse,
  NCollapseItem,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  NSpace,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  useDialog,
  type FormInst,
} from 'naive-ui'
import {
  GridOutline as GridIcon,
  CalculatorOutline as CalculatorIcon,
  TimeOutline as TimeIcon,
  LayersOutline as LayersIcon,
  AddOutline as AddIcon,
} from '@vicons/ionicons5'
import { idcApi } from '@/api/idcApi'
import type { AdvancedTemplateItem, MyTemplateItem, TemplateCategory } from '@/api/idcApiTypes'

// Props定义
interface Props {
  currentConfig?: {
    row_fields: string[]
    col_field?: string
    value_configs?: { aggregation: string; label: string }[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  currentConfig: undefined,
})

// Emits定义
const emit = defineEmits<{
  (e: 'apply', template: AdvancedTemplateItem | MyTemplateItem): void
  (e: 'save', data: { name: string; description: string; category: TemplateCategory; share_status: string }): void
}>()

const message = useMessage()
const dialog = useDialog()

// 状态
const activeTab = ref('system')
const selectedTemplate = ref<AdvancedTemplateItem | MyTemplateItem | null>(null)
const systemTemplates = ref<AdvancedTemplateItem[]>([])
const myTemplates = ref<MyTemplateItem[]>([])
const loading = ref(false)

// 保存弹窗
const showSaveModal = ref(false)
const saving = ref(false)
const formRef = ref<FormInst>()

const saveForm = ref({
  name: '',
  description: '',
  category: 'market_overview' as TemplateCategory,
  share_status: 'private',
})

// 详情弹窗
const showDetailModal = ref(false)

// 分类选项
const categoryOptions = [
  { label: '市场概览', value: 'market_overview' },
  { label: '地理分析', value: 'geo_analysis' },
  { label: '技术分析', value: 'tech_analysis' },
  { label: '商业分析', value: 'business_analysis' },
  { label: '深度洞察', value: 'deep_insight' },
]

// 分类模板
const categoryTemplates = computed(() => {
  const categories = [
    { key: 'market_overview', label: '市场概览类', templates: systemTemplates.value.filter((t) => t.category === 'market_overview') },
    { key: 'geo_analysis', label: '地理分析类', templates: systemTemplates.value.filter((t) => t.category === 'geo_analysis') },
    { key: 'tech_analysis', label: '技术分析类', templates: systemTemplates.value.filter((t) => t.category === 'tech_analysis') },
    { key: 'business_analysis', label: '商业分析类', templates: systemTemplates.value.filter((t) => t.category === 'business_analysis') },
    { key: 'deep_insight', label: '深度洞察类', templates: systemTemplates.value.filter((t) => t.category === 'deep_insight') },
  ]
  return categories
})

// 生命周期
onMounted(async () => {
  await loadTemplates()
})

// 加载模板
async function loadTemplates() {
  loading.value = true
  try {
    // 加载系统模板
    const systemRes = await idcApi.getAdvancedTemplates()
    if (systemRes.success && systemRes.data) {
      systemTemplates.value = systemRes.data
    }

    // 加载我的模板
    const myRes = await idcApi.getMyTemplates()
    if (myRes.success && myRes.data) {
      myTemplates.value = myRes.data
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  } finally {
    loading.value = false
  }
}

// 选择模板
function selectTemplate(template: AdvancedTemplateItem | MyTemplateItem) {
  selectedTemplate.value = template
}

// 应用模板
function applyTemplate(template: AdvancedTemplateItem | MyTemplateItem) {
  emit('apply', template)
  message.success(`已应用模板: ${template.name}`)
}

// 查看模板
function viewTemplate(template: AdvancedTemplateItem | MyTemplateItem) {
  selectedTemplate.value = template
  showDetailModal.value = true
}

// 编辑模板
function editTemplate(template: MyTemplateItem) {
  saveForm.value = {
    name: template.name,
    description: template.description,
    category: template.category,
    share_status: template.share_status,
  }
  showSaveModal.value = true
}

// 复制模板
async function cloneTemplate(template: MyTemplateItem) {
  try {
    const res = await idcApi.cloneTemplate(template.id, `${template.name} (副本)`)
    if (res.success && res.data) {
      // 确保 data 是数组
      const templates = Array.isArray(res.data) ? res.data : [res.data]
      myTemplates.value.push(...templates)
      message.success('模板复制成功')
    }
  } catch (error) {
    message.error('模板复制失败')
  }
}

// 删除模板
function deleteTemplate(template: MyTemplateItem) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除模板 "${template.name}" 吗？此操作不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await idcApi.deleteTemplate(template.id)
        myTemplates.value = myTemplates.value.filter((t) => t.id !== template.id)
        message.success('模板已删除')
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

// 保存当前配置
function handleSaveCurrent() {
  if (!props.currentConfig) {
    message.warning('请先配置透视表')
    return
  }

  saveForm.value = {
    name: '',
    description: '',
    category: 'deep_insight' as TemplateCategory,
    share_status: 'private',
  }
  showSaveModal.value = true
}

// 保存模板
async function handleSave() {
  if (!saveForm.value.name.trim()) {
    message.warning('请输入模板名称')
    return
  }

  saving.value = true
  try {
    const res = await idcApi.saveTemplate({
      name: saveForm.value.name,
      description: saveForm.value.description,
      category: saveForm.value.category,
      row_fields: props.currentConfig?.row_fields as any || [],
      col_field: props.currentConfig?.col_field as any,
      value_configs: props.currentConfig?.value_configs as any || [],
      share_status: saveForm.value.share_status as any,
    })

    if (res.success && res.data) {
      // 确保 data 是数组
      const templates = Array.isArray(res.data) ? res.data : [res.data]
      myTemplates.value.push(...templates)
      showSaveModal.value = false
      message.success('模板保存成功')
    }
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 应用详情中的模板
function handleApplyDetail() {
  if (selectedTemplate.value) {
    applyTemplate(selectedTemplate.value)
    showDetailModal.value = false
  }
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 获取分享标签类型
function getShareTypeTag(status: string): 'default' | 'info' | 'success' {
  switch (status) {
    case 'private':
      return 'default'
    case 'team':
      return 'info'
    case 'public':
      return 'success'
    default:
      return 'default'
  }
}

// 获取分享标签文本
function getShareLabel(status: string): string {
  switch (status) {
    case 'private':
      return '私有'
    case 'team':
      return '团队'
    case 'public':
      return '公开'
    default:
      return '私有'
  }
}
</script>

<style scoped>
.template-manager {
  height: 100%;
  overflow-y: auto;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 12px 0;
}

.template-card {
  padding: 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.template-card.active {
  border-color: #6366f1;
  background: #f9fafb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.card-desc {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 11px;
  color: #9ca3af;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.empty-state {
  padding: 40px 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: #f3f4f6;
}

.item-name {
  font-weight: 500;
  font-size: 13px;
  color: #374151;
}

.item-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.template-detail {
  padding: 12px 0;
}
</style>
