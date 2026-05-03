// IDC 市场探索视图 - 严格按需求文档实现
// 更新时间: 2026-04-10
// 功能: 多维透视分析、拖拽配置、26个预设模板、30个统计量、激光/喷墨双品类适配
<template>
  <div class="page-container idc-explore-view">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧：字段池 -->
      <FieldPool
        :collapsed="fieldPoolCollapsed"
        :assigned-fields="assignedFields"
        :active-zone="activeZone"
        :selected-values="fieldSelections"
        :focus-field="fieldPoolFocusField"
        @toggle-collapse="fieldPoolCollapsed = !fieldPoolCollapsed"
        @value-click="handleFieldValueClick"
        @select-all="handleSelectAll"
        @clear-all="handleClearAll"
      />

      <!-- 右侧：配置和结果 -->
      <div class="config-result-container">
        <!-- 透视配置区域 -->
        <div class="config-section">
          <!-- 配置区域标题 -->
          <div class="config-header">
            <h3 class="config-title">
              <IconSettings />
              透视配置
            </h3>
            <div class="config-actions">
              <n-button class="btn-reset" @click="handleResetConfig">
                <template #icon>
                  <IconRefresh />
                </template>
                重置
              </n-button>
              <n-button type="primary" class="btn-execute" :loading="queryLoading" @click="handleExecuteQuery">
                <template #icon>
                  <IconPlay />
                </template>
                执行分析
              </n-button>
            </div>
          </div>

          <!-- 配置区域 -->
          <ConfigZones
            v-model="config"
            :active-zone="activeZone"
            :field-selection-counts="fieldSelectionCounts"
            :aggregation-grouped="aggregationGrouped"
            :selected-values="fieldSelections"
            @zone-activate="(zone: any) => activeZone = zone"
            @zone-deactivate="activeZone = null"
            @add-aggregation="handleAddAggregation"
            @remove-aggregation="handleRemoveAggregation"
            @chip-click="(field: any) => { fieldPoolFocusField = field.value; fieldPoolFocusField = null }"
            @field-remove="handleFieldRemove"
            @save-template="handleSaveAsTemplate"
          />
        </div>

        <!-- 分析结果区域 -->
        <div class="result-preview-panel">
          <div class="panel-header">
            <span class="panel-title">
              <IconChart />
              分析结果
            </span>
            <div class="view-switcher">
              <button
                v-for="view in viewTypes"
                :key="view.value"
                class="view-btn"
                :class="{ active: currentView === view.value }"
                @click="currentView = view.value"
                :title="view.label"
              >
                <component :is="view.icon" />
              </button>
            </div>
          </div>

          <!-- 结果内容 -->
          <div class="result-content">
            <!-- 加载状态 -->
            <div v-if="queryLoading" class="result-loading">
              <div class="loading-spinner">
                <div class="spinner-ring" />
              </div>
              <span>正在分析数据...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!hasResult" class="result-empty">
              <div class="empty-illustration">
                <IconEmptyChart />
              </div>
              <h3>开始你的数据分析</h3>
              <p>拖拽字段到配置区域，点击"执行分析"获取结果</p>
              <div class="empty-tips">
                <div class="tip-item">
                  <IconTip />
                  <span>选择分析品类</span>
                </div>
                <div class="tip-item">
                  <IconTip />
                  <span>拖拽行/列维度</span>
                </div>
                <div class="tip-item">
                  <IconTip />
                  <span>选择统计量指标</span>
                </div>
              </div>
            </div>

            <!-- 数据结果 -->
            <div v-else class="result-data">
              <!-- 结果概览 -->
              <div class="result-summary">
                <div class="summary-item">
                  <span class="summary-label">查询结果</span>
                  <span class="summary-value">{{ queryResult.length }} 条</span>
                </div>
                <div v-if="hasResult && config.colFields.length > 0" class="summary-item">
                  <n-switch v-model:value="pivotViewEnabled" size="small" />
                  <span class="summary-label" style="margin-left:6px;">透视表</span>
                </div>
              </div>

              <!-- 列表视图（扁平表格） -->
              <div v-if="currentView === 'table' && !pivotViewEnabled" class="result-table">
                <n-data-table
                  :columns="tableColumns"
                  :data="tableData"
                  :pagination="pagination"
                  :max-height="450"
                  virtual-scroll
                  striped
                  size="small"
                />
              </div>

              <!-- 透视表视图（多级表头） -->
              <div v-else-if="currentView === 'table' && pivotViewEnabled" class="result-table pivot-table">
                <PivotTableView
                  :data="pivotTableData"
                  :left-fixed-cols="pivotTableLeftCols"
                  :column-groups="pivotTableColGroups"
                  :value-sub-columns="pivotTableValueCols"
                />
              </div>

              <!-- 柱状图视图 -->
              <div v-else-if="currentView === 'bar'" class="result-chart">
                <BaseChart :option="barChartOption" style="height: 400px" />
              </div>

              <!-- 饼图视图 -->
              <div v-else-if="currentView === 'pie'" class="result-chart">
                <BaseChart :option="pieChartOption" style="height: 400px" />
              </div>

              <!-- 折线图视图 -->
              <div v-else-if="currentView === 'line'" class="result-chart">
                <BaseChart :option="lineChartOption" style="height: 400px" />
              </div>

              <!-- 热力图视图 -->
              <div v-else-if="currentView === 'heatmap'" class="result-chart">
                <BaseChart :option="heatmapChartOption" style="height: 400px" />
              </div>
            </div>
          </div>

          <!-- 结果操作栏 -->
          <div v-if="hasResult" class="result-actions">
            <n-button size="small" @click="handleExport('csv')">
              <template #icon>
                <IconDownload />
              </template>
              CSV
            </n-button>
            <n-button size="small" type="primary" @click="handleExport('excel')">
              <template #icon>
                <IconDownload />
              </template>
              Excel
            </n-button>
            <n-button size="small" @click="handleShare">
              <template #icon>
                <IconShare />
              </template>
              分享
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
      @confirm="handleFilterConfirm"
    />

    <!-- 条件编辑弹窗 -->
    <FilterConditionEditor
      v-model:visible="showConditionEditor"
      :field="editingConditionField"
      :existing-condition="editingCondition"
      @confirm="handleConditionConfirm"
      @back="showFilterSelector = true"
    />

    <!-- 值字段配置弹窗 -->
    <ValueFieldConfigEditor
      v-model:visible="showValueConfig"
      :config="editingValueConfig"
      @confirm="handleValueConfigConfirm"
    />

    <!-- 右键菜单 -->
    <n-popover
      v-model:show="showContextMenu"
      trigger="manual"
      placement="bottom-start"
      :x="contextMenuX"
      :y="contextMenuY"
      :show-arrow="true"
    >
      <div class="context-menu">
        <div class="context-menu-item" @click="handleContextAction('sort')">
          <IconSort />
          <span>设置排序</span>
        </div>
        <div class="context-menu-item" @click="handleContextAction('filter')">
          <IconFilterSmall />
          <span>设为筛选条件</span>
        </div>
        <div class="context-menu-divider" />
        <div class="context-menu-item danger" @click="handleContextAction('delete')">
          <IconClose />
          <span>删除字段</span>
        </div>
      </div>
    </n-popover>

    <!-- 字段选择器弹窗 -->
    <n-modal
      v-model:show="showFilterSelector"
      preset="card"
      title="选择筛选字段"
      style="width: 400px"
    >
      <div class="filter-selector">
        <n-input
          v-model:value="filterSelectorKeyword"
          placeholder="搜索字段..."
          clearable
        >
          <template #prefix>
            <IconSearch />
          </template>
        </n-input>
        <div class="selector-list">
          <div
            v-for="field in filteredSelectableFields"
            :key="field.value"
            class="selector-item"
            @click="handleFilterField(field)"
          >
            <span class="selector-icon">{{ field.icon || '📋' }}</span>
            <span class="selector-label">{{ field.label }}</span>
            <span class="selector-type">{{ field.type }}</span>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 模板库抽屉 -->
    <n-drawer
      v-model:show="showTemplateLibrary"
      :width="720"
      title="分析模板库"
    >
      <div class="template-library">
        <!-- 分类标签 -->
        <div class="library-tabs">
          <button
            v-for="cat in templateCategories"
            :key="cat.value"
            class="library-tab"
            :class="{ active: selectedTemplateCategory === cat.value }"
            @click="selectedTemplateCategory = cat.value"
          >
            {{ cat.label }}
            <n-badge :value="getTemplateCountByCategory(cat.value)" type="info" />
          </button>
        </div>

        <!-- 模板卡片 -->
        <div class="library-grid">
          <div
            v-for="tpl in filteredTemplates"
            :key="tpl.id"
            class="template-card"
            :class="{ active: activeTemplateId === tpl.id }"
            @click="handleApplyTemplate(tpl)"
          >
            <div class="card-header">
              <span class="tpl-badge" :class="getTemplateBadgeClass(tpl)">
                {{ getTemplateBadgeText(tpl) }}
              </span>
              <span class="tpl-category">{{ tpl.categoryLabel }}</span>
            </div>
            <h4 class="card-title">{{ tpl.name }}</h4>
            <p class="card-desc">{{ tpl.description }}</p>
            <div class="card-meta">
              <span class="meta-item">
                <IconRows />
                {{ tpl.row_fields?.length || 0 }}个行维度
              </span>
              <span class="meta-item">
                <IconChart />
                {{ tpl.value_configs?.length || 0 }}个统计量
              </span>
            </div>
            <div class="card-actions">
              <n-button type="primary" size="small" @click.stop="handleApplyTemplate(tpl)">
                应用模板
              </n-button>
              <n-button size="small" @click.stop="handlePreviewTemplate(tpl)">
                预览
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-drawer>

    <!-- 保存模板弹窗 -->
    <n-modal
      v-model:show="showSaveTemplateModal"
      preset="dialog"
      title="保存为模板"
      style="width: 480px"
    >
      <n-form :model="templateForm" label-placement="top">
        <n-form-item label="模板名称" required>
          <n-input v-model:value="templateForm.name" placeholder="输入模板名称" />
        </n-form-item>
        <n-form-item label="模板分类">
          <n-select
            v-model:value="templateForm.category"
            :options="templateCategoryOptions"
            placeholder="选择模板分类"
          />
        </n-form-item>
        <n-form-item label="模板描述">
          <n-input
            v-model:value="templateForm.description"
            type="textarea"
            placeholder="输入模板描述（可选）"
            :rows="3"
          />
        </n-form-item>
        <n-form-item label="共享范围">
          <n-radio-group v-model:value="templateForm.shareStatus">
            <n-space>
              <n-radio value="private">仅自己可见</n-radio>
              <n-radio value="team">团队可见</n-radio>
              <n-radio value="public">全员可见</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showSaveTemplateModal = false">取消</n-button>
        <n-button type="primary" @click="handleConfirmSaveTemplate">保存</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, h, onMounted, watch, nextTick } from 'vue'
import {
  NButton,
  NBadge,
  NTag,
  NDataTable,
  NDrawer,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  NRadioButton,
  NSpace,
  NTooltip,
  NPopover,
} from 'naive-ui'
import { useSafeMessage } from '@/composables/useSafeMessage'
import type { DataTableColumns } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'
import type {
  PivotDimension,
  ProductType,
  AggregationType,
  AdvancedTemplateItem,
  TemplateCategory,
  ViewType,
  ValueFieldConfig,
} from '@/api/idcApiTypes'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'
import FilterConditionEditor from '@/components/idc/FilterConditionEditor.vue'
import ValueFieldConfigEditor from '@/components/idc/ValueFieldConfigEditor.vue'
import FieldPool from '@/components/idc/FieldPool.vue'
import PivotTableView from '@/components/idc/PivotTableView.vue'
import ConfigZones from '@/components/idc/ConfigZones.vue'

// ==================== Web3 蓝色风格常量 ====================
const WEB3_COLORS = ['#004ac6', '#2563eb', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#1d4ed8', '#60a5fa']

// 统一 tooltip
const WEB3_TOOLTIP = {
  trigger: 'axis',
  backgroundColor: '#fff',
  borderColor: '#e2e8f0',
  borderWidth: 1,
  textStyle: { color: '#44403c', fontSize: 12 },
  shadowColor: 'rgba(0, 74, 198, 0.06)',
  shadowBlur: 10,
}

// 统一 grid
const WEB3_GRID = {
  left: '3%', right: '4%', bottom: '10%', top: '10%',
  containLabel: true,
}

// 统一 xAxis
const WEB3_XAXIS = {
  axisLine: { lineStyle: { color: '#e7e5e4' } },
  axisLabel: { color: '#4b5563', fontSize: 12 },
  splitLine: { show: false },
}

// 统一 yAxis
const WEB3_YAXIS = {
  type: 'value' as const,
  axisLine: { show: false },
  axisLabel: { color: '#4b5563', fontSize: 12 },
  splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
}

// 统一 legend
const WEB3_LEGEND = {
  textStyle: { color: '#4b5563', fontSize: 12 },
}

// 获取渐变柱状图 itemStyle
function getGradientBarStyle(colorIndex: number) {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    color: {
      type: 'linear' as const,
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: color + 'aa' },
      ],
    },
    borderRadius: [6, 6, 0, 0],
  }
}

// ==================== 图标组件 ====================

const IconFilter = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
])
const IconRefresh = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '23 4 23 10 17 10' }),
  h('polyline', { points: '1 20 1 14 7 14' }),
  h('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
])
const IconChevronRight = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '9 18 15 12 9 6' })
])
const IconChevronLeft = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '15 18 9 12 15 6' })
])
const IconChevronDown = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '6 9 12 15 18 9' })
])
const IconDatabase = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('ellipse', { cx: 12, cy: 5, rx: 9, ry: 3 }),
  h('path', { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }),
  h('path', { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' })
])
const IconRows = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
  h('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
  h('line', { x1: 3, y1: 18, x2: 21, y2: 18 })
])
const IconColumns = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 6, y1: 3, x2: 6, y2: 21 }),
  h('line', { x1: 12, y1: 3, x2: 12, y2: 21 }),
  h('line', { x1: 18, y1: 3, x2: 18, y2: 21 })
])
const IconChart = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
  h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
  h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
])
const IconPlus = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
  h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
])
const IconClose = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
])
const IconPlay = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polygon', { points: '5 3 19 12 5 21 5 3' })
])
const IconDownload = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '7 10 12 15 17 10' }),
  h('line', { x1: 12, y1: 15, x2: 12, y2: 3 })
])
const IconShare = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 18, cy: 5, r: 3 }),
  h('circle', { cx: 6, cy: 12, r: 3 }),
  h('circle', { cx: 18, cy: 19, r: 3 }),
  h('line', { x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 }),
  h('line', { x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 })
])
const IconDrag = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 9, cy: 5, r: 1 }),
  h('circle', { cx: 9, cy: 12, r: 1 }),
  h('circle', { cx: 9, cy: 19, r: 1 }),
  h('circle', { cx: 15, cy: 5, r: 1 }),
  h('circle', { cx: 15, cy: 12, r: 1 }),
  h('circle', { cx: 15, cy: 19, r: 1 })
])
const IconInfo = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }),
  h('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 })
])
const IconSearch = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 11, cy: 11, r: 8 }),
  h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
])
const IconSettings = () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 3 }),
  h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
])
const IconTarget = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('circle', { cx: 12, cy: 12, r: 6 }),
  h('circle', { cx: 12, cy: 12, r: 2 })
])
const IconTemplate = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }),
  h('line', { x1: 3, y1: 9, x2: 21, y2: 9 }),
  h('line', { x1: 9, y1: 21, x2: 9, y2: 9 })
])
const IconEmptyChart = () => h('svg', { width: 64, height: 64, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1, opacity: 0.3 }, [
  h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
  h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
  h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
])
const IconTip = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'currentColor' }, [
  h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' })
])
const IconSort = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 4, y1: 6, x2: 20, y2: 6 }),
  h('line', { x1: 4, y1: 12, x2: 14, y2: 12 }),
  h('line', { x1: 4, y1: 18, x2: 8, y2: 18 })
])
const IconEdit = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
])
const IconFilterSmall = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
])

const message = useSafeMessage()
const idcStore = useIDCStore()
const { filters } = storeToRefs(idcStore)

// ==================== 状态 ====================

// 品类选择
const currentCategory = ref<ProductType>('all')
const categoryOptions = [
  { value: 'all' as ProductType, label: '全品类', icon: '📊', color: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)' },
  { value: 'laser' as ProductType, label: '激光打印机', icon: '🔵', color: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' },
  { value: 'inkjet' as ProductType, label: '喷墨打印机', icon: '🔴', color: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)' },
]

// 拖拽状态（保留用于内部字段排序）
const draggingFieldItem = ref<string | null>(null)
const draggingFieldType = ref<'row' | 'col' | null>(null)
const draggingFieldIndex = ref<number>(-1)

// 展开/折叠状态
const expandedRowFields = ref<PivotDimension[]>([])

// 右键菜单状态
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuFieldType = ref<'row' | 'col' | null>(null)
const contextMenuFieldIndex = ref(-1)

// 筛选条件状态
interface FilterCondition {
  id: string
  field: string
  fieldLabel: string
  operator: string
  value: string | number | string[]
}

const filterConditions = ref<FilterCondition[]>([])
const filterLogic = ref<'AND' | 'OR'>('AND')
const activeFilterPresets = ref<string[]>([])

// 条件编辑状态
const showConditionEditor = ref(false)
const editingConditionField = ref<{ value: string; label: string; type: 'number' | 'text' | 'enum' | 'boolean' } | null>(null)
const editingCondition = ref<FilterCondition | null>(null)

// 值字段配置状态
const showValueConfig = ref(false)
const editingValueConfig = ref<{
  aggregation: string
  aggregationLabel: string
  format?: string
  decimalPlaces?: number
} | null>(null)

// 筛选字段选择器
const showFilterSelector = ref(false)
const filterSelectorKeyword = ref('')

// 字段搜索
const fieldSearchKeyword = ref('')

// 配置状态
interface FieldDef {
  value: PivotDimension
  label: string
  icon?: string
  category?: 'laser' | 'inkjet'
}

let config = ref({
  rowFields: [
    { value: 'Region' as PivotDimension, label: 'Region', icon: undefined, category: undefined },
    { value: 'Brand' as PivotDimension, label: 'Brand', icon: undefined, category: undefined },
    { value: 'Quarter' as PivotDimension, label: 'Quarter', icon: undefined, category: undefined },
  ],
  colFields: [
    { value: 'Year' as PivotDimension, label: 'Year', icon: undefined, category: undefined },
  ],
  filterFields: [
    { value: 'Channel' as PivotDimension, label: 'Channel', icon: undefined, category: undefined },
    { value: 'Product Category' as PivotDimension, label: 'Product Category', icon: undefined, category: undefined },
  ],
  valueFields: [] as ValueFieldConfig[],
})

// 分析编排器 TARGET-FIRST 状态
type ZoneId = 'row' | 'col' | 'filter' | 'val'

// 字段归属映射（用于 FieldPool 状态显示）
// 仅当字段在某个维度中且有选中值时才显示归属；清空选中值后字段恢复为未配置状态
const assignedFields = computed((): Record<string, ZoneId> => {
  const map: Record<string, ZoneId> = {}
  config.value.rowFields.forEach(f => {
    if (fieldSelections.value[f.value]?.length > 0) map[f.value] = 'row'
  })
  config.value.colFields.forEach(f => {
    if (fieldSelections.value[f.value]?.length > 0) map[f.value] = 'col'
  })
  config.value.filterFields.forEach(f => {
    if (fieldSelections.value[f.value]?.length > 0) map[f.value] = 'filter'
  })
  return map
})

// 字段选中值 mock 初始数据
const fieldSelections = ref<Record<string, string[]>>({
  'Region': ['NA', 'WE'],
  'Brand': ['HP', 'Canon'],
  'Quarter': ['Q1', 'Q2', 'Q3'],
  'Channel': ['Direct', 'Distributor'],
})

// 分析编排器 TARGET-FIRST 状态
const activeZone = ref<ZoneId | null>('row')

const fieldSelectionCounts = computed(() => {
  const counts: Record<string, number> = {}
  ;[...config.value.rowFields, ...config.value.colFields, ...config.value.filterFields].forEach(f => {
    counts[f.value] = fieldSelections.value[f.value]?.length || 0
  })
  return counts
})

// 已选统计量
const selectedAggregation = ref<AggregationType | null>(null)

// 值字段颜色
const valueColors = WEB3_COLORS

// 面板状态
const fieldPoolCollapsed = ref(false)
const fieldPoolFocusField = ref<string | null>(null)
const showFilterDrawer = ref(false)
const showTemplateLibrary = ref(false)
const showSaveTemplateModal = ref(false)

// 模板
const activeTemplateId = ref<string | null>(null)
const selectedTemplateCategory = ref<TemplateCategoryValue>('all')
const systemTemplates = ref<AdvancedTemplateItem[]>([])
const templatesLoading = ref(false)
const aggregationDefs = ref<{ id: string; name: string; sourceFields: string[]; format?: string; decimalPlaces?: number }[]>([])
const templateForm = reactive({
  name: '',
  category: '' as string,
  description: '',
  shareStatus: 'private' as 'private' | 'team' | 'public',
})

// 查询状态
const queryLoading = ref(false)
const queryResult = ref<Record<string, unknown>[]>([])
const currentView = ref<'table' | 'bar' | 'line' | 'pie' | 'heatmap'>('table')

// 国家饼图颜色
const PIE_COLORS = ['#2563EB', '#06b6d4', '#f59e0b', '#6b7280', '#34d399']

// 模板分类
type TemplateCategoryValue = 'all' | 'market_overview' | 'geo_analysis' | 'tech_analysis' | 'business_analysis' | 'deep_insight'
const templateCategories: Array<{ value: TemplateCategoryValue; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'market_overview', label: '市场概览' },
  { value: 'geo_analysis', label: '地理分析' },
  { value: 'tech_analysis', label: '技术分析' },
  { value: 'business_analysis', label: '商业分析' },
  { value: 'deep_insight', label: '深度洞察' },
]

const templateCategoryOptions = templateCategories.filter(c => c.value !== 'all').map(c => ({
  label: c.label,
  value: c.value,
}))

// 视图类型
type ViewTypeValue = 'table' | 'bar' | 'line' | 'pie' | 'heatmap'
const viewTypes: Array<{ value: ViewTypeValue; label: string; icon: typeof IconRows }> = [
  { value: 'table', label: '表格', icon: IconRows },
  { value: 'bar', label: '柱状图', icon: IconChart },
  { value: 'pie', label: '饼图', icon: IconChart },
  { value: 'line', label: '折线图', icon: IconChart },
  { value: 'heatmap', label: '热力图', icon: IconChart },
]

// 透视表视图状态
const pivotViewEnabled = ref(false)
const pivotTableData = ref<PivotRowData[]>([])
const pivotTableColumns = ref<any[]>([])
const pivotHeaderRows = ref(2)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
})

// ==================== 计算属性 ====================

// 活跃筛选数量
const activeFiltersCount = computed(() => {
  let count = 0
  Object.entries(filters.value).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && key !== 'product_type') {
      count += value.length
    }
  })
  return count
})

// 扁平字段分类列表（保留分类结构用于渲染分类头，过滤 Year）
interface FlatFieldCategory {
  name: string
  icon: string
  fields: FieldDef[]
}

type FieldGroupItem = FieldDef

const flatFieldCategories = computed((): FlatFieldCategory[] => {
  const groups: FlatFieldCategory[] = [
    {
      name: '时间维度',
      icon: '📅',
      fields: [
        { value: 'Half Year' as PivotDimension, label: 'Half Year (半年度)' },
      ],
    },
    {
      name: '地理维度',
      icon: '🌍',
      fields: [
        { value: 'Global Region' as PivotDimension, label: 'Global Region (全球区域)' },
        { value: 'Region' as PivotDimension, label: 'Region (区域)' },
        { value: 'Country' as PivotDimension, label: 'Country (国家)' },
      ],
    },
    {
      name: '厂商维度',
      icon: '🏢',
      fields: [
        { value: 'Brand' as PivotDimension, label: 'Brand (品牌)' },
        { value: 'Company' as PivotDimension, label: 'Company (公司)' },
        { value: 'OEM' as PivotDimension, label: 'OEM (原始制造商)' },
      ],
    },
    {
      name: '产品维度',
      icon: '📦',
      fields: [
        { value: 'Product' as PivotDimension, label: 'Product (品类)' },
        { value: 'Product Category' as PivotDimension, label: 'Product Category (产品类别)' },
        { value: 'Format' as PivotDimension, label: 'Format (幅面)' },
        { value: 'Model Name' as PivotDimension, label: 'Model Name (型号)' },
      ],
    },
    {
      name: '速度维度',
      icon: '⚡',
      fields: [
        { value: 'Speed Range A4' as PivotDimension, label: 'Speed Range A4 (速度段)' },
      ],
    },
    {
      name: '功能维度',
      icon: '🔧',
      fields: [
        { value: 'ADF' as PivotDimension, label: 'ADF (自动输稿器)' },
        { value: 'Duplex' as PivotDimension, label: 'Duplex (双面打印)' },
        { value: 'Wireless' as PivotDimension, label: 'Wireless (无线)' },
      ],
    },
    {
      name: '耗材维度',
      icon: '🖨️',
      fields: [
        { value: 'Ink Tank/ Ink Cartridge' as PivotDimension, label: 'Ink Tank/ Ink Cartridge (墨仓/墨盒)', category: 'inkjet' },
      ],
    },
    {
      name: '渠道维度',
      icon: '🏪',
      fields: [
        { value: 'Channel' as PivotDimension, label: 'Channel (渠道)' },
        { value: 'Channel Group' as PivotDimension, label: 'Channel Group (渠道组)' },
      ],
    },
    {
      name: '业务分级',
      icon: '⭐',
      fields: [
        { value: 'Production Classification' as PivotDimension, label: 'Production Classification (生产级)', category: 'laser' },
        { value: 'Business Inkjet Detail' as PivotDimension, label: 'Business Inkjet Detail (商用级别)', category: 'inkjet' },
      ],
    },
  ]

  if (currentCategory.value === 'laser') {
    return groups.map(g => ({
      ...g,
      fields: g.fields.filter(f => f.category !== 'inkjet'),
    })).filter(g => g.fields.length > 0)
  }
  if (currentCategory.value === 'inkjet') {
    return groups.map(g => ({
      ...g,
      fields: g.fields.filter(f => f.category !== 'laser'),
    })).filter(g => g.fields.length > 0)
  }
  return groups
})

// 扁平字段列表（用于拖拽和 badge 计数）
const flatFields = computed((): FieldGroupItem[] => {
  return flatFieldCategories.value.flatMap(c => c.fields)
})

// 分类展开状态
const expandedCategories = ref<string[]>(['时间维度', '地理维度', '厂商维度'])

// 分类搜索过滤后的字段列表
const filteredFlatFields = computed(() => {
  if (!fieldSearchKeyword.value.trim()) return flatFields.value
  const keyword = fieldSearchKeyword.value.toLowerCase()
  return flatFields.value.filter(f =>
    f.label.toLowerCase().includes(keyword) ||
    f.value.toLowerCase().includes(keyword)
  )
})

// 切换分类展开
function toggleCategory(name: string) {
  const idx = expandedCategories.value.indexOf(name)
  if (idx > -1) {
    expandedCategories.value.splice(idx, 1)
  } else {
    expandedCategories.value.push(name)
  }
}

// 获取字段标签（ROW/COL/VAL）
function getFieldTag(value: PivotDimension): string {
  if (config.value.rowFields.some(f => f.value === value)) return 'ROW'
  if (config.value.colFields.some(f => f.value === value)) return 'COL'
  return ''
}

// ─── FieldPool TARGET-FIRST ───────────────────────────

/** FieldPool 值点击：切换选中值，选中后自动加入 activeZone */
function handleFieldValueClick(field: { value: string; label: string; category: string }, val: string) {
  if (!activeZone.value) return

  const existing = fieldSelections.value[field.value] || []
  const idx = existing.indexOf(val)
  if (idx >= 0) {
    existing.splice(idx, 1)
  } else {
    existing.push(val)
  }
  fieldSelections.value = { ...fieldSelections.value, [field.value]: [...existing] }

  const key = activeZone.value === 'row' ? 'rowFields'
    : activeZone.value === 'col' ? 'colFields'
    : activeZone.value === 'filter' ? 'filterFields'
    : null

  if (key && existing.length > 0) {
    const arr = config.value[key as keyof typeof config.value] as Array<{ value: PivotDimension; label: string }>
    if (!arr.some(f => f.value === field.value)) {
      arr.push({ value: field.value as PivotDimension, label: field.label })
    }
  }
  if (key && existing.length === 0) {
    const arr = config.value[key as keyof typeof config.value] as Array<{ value: PivotDimension; label: string }>
    const i = arr.findIndex(f => f.value === field.value)
    if (i >= 0) arr.splice(i, 1)
  }
}

/** FieldPool Select All */
function handleSelectAll(field: { value: string; label: string; category: string }) {
  if (!activeZone.value) return
  const vals = (field as any).values?.map((v: any) => v.value) || []
  fieldSelections.value = { ...fieldSelections.value, [field.value]: vals }
  const key = activeZone.value === 'row' ? 'rowFields'
    : activeZone.value === 'col' ? 'colFields'
    : activeZone.value === 'filter' ? 'filterFields'
    : null
  if (key) {
    const arr = config.value[key as keyof typeof config.value] as Array<{ value: PivotDimension; label: string }>
    if (!arr.some(f => f.value === field.value)) {
      arr.push({ value: field.value as PivotDimension, label: field.label })
    }
  }
}

/** FieldPool Clear All */
function handleClearAll(field: { value: string; label: string; category: string }) {
  fieldSelections.value = { ...fieldSelections.value, [field.value]: [] }
  for (const key of ['rowFields', 'colFields', 'filterFields'] as const) {
    const arr = config.value[key] as Array<{ value: string; label: string }>
    const i = arr.findIndex(f => f.value === field.value)
    if (i >= 0) arr.splice(i, 1)
  }
}

/** 字段池点击 - 由 FieldPool 内联面板处理 */
function handleRemoveAggregation(aggregation: AggregationType) {
  config.value.valueFields = config.value.valueFields.filter(f => f.aggregation !== aggregation)
}

/** ConfigZones 中删除字段时，同步清理 fieldSelections 中该字段的选中值 */
function handleFieldRemove(fieldValue: string) {
  const newSelections = { ...fieldSelections.value }
  delete newSelections[fieldValue]
  fieldSelections.value = newSelections
}

// 可用字段
const availableFields = computed(() => {
  return flatFields.value
})

// 统计量选项
const aggregationOptions = computed(() => {
  return aggregationDefs.value.map(a => ({
    value: a.id,
    label: a.name,
  }))
})

// 筛选预设
const filterPresets = [
  {
    id: 'ink_tank',
    name: '仅墨仓式喷墨',
    conditions: [
      { field: 'Ink Tank/ Ink Cartridge', operator: '=', value: 'Ink Tank' } as any,
    ],
  },
  {
    id: 'a4_format',
    name: '仅A4幅面',
    conditions: [
      { field: 'Format', operator: '=', value: 'A4' } as any,
    ],
  },
  {
    id: 'duplex',
    name: '仅双面打印',
    conditions: [
      { field: 'Duplex', operator: '=', value: 'Y' } as any,
    ],
  },
]

// 筛选字段选择器 - 可筛选的字段
const filterableFields = [
  { value: 'brand', label: 'Brand (品牌)', type: 'enum', icon: '🏢' },
  { value: 'company', label: 'Company (公司)', type: 'enum', icon: '🏢' },
  { value: 'country', label: 'Country (国家)', type: 'enum', icon: '🌍' },
  { value: 'region', label: 'Region (区域)', type: 'enum', icon: '🌍' },
  { value: 'global_region', label: 'Global Region (全球区域)', type: 'enum', icon: '🌍' },
  { value: 'product', label: 'Product (品类)', type: 'enum', icon: '📦' },
  { value: 'product_category', label: 'Product Category (产品类别)', type: 'enum', icon: '📦' },
  { value: 'format', label: 'Format (幅面)', type: 'enum', icon: '📄' },
  { value: 'speed_range_a4', label: 'Speed Range A4 (速度段)', type: 'text', icon: '⚡' },
  { value: 'adf', label: 'ADF (自动输稿器)', type: 'boolean', icon: '🔧' },
  { value: 'duplex', label: 'Duplex (双面打印)', type: 'boolean', icon: '🔧' },
  { value: 'wireless', label: 'Wireless (无线)', type: 'boolean', icon: '🔧' },
  { value: 'ink_tank', label: 'Ink Tank/ Ink Cartridge (墨仓/墨盒)', type: 'enum', icon: '🖨️' },
  { value: 'channel', label: 'Channel (渠道)', type: 'enum', icon: '🏪' },
  { value: 'units', label: 'Units (销量)', type: 'number', icon: '📊' },
  { value: 'asp', label: 'ASP (平均单价)', type: 'number', icon: '💰' },
]

// 过滤后的筛选字段
const filteredSelectableFields = computed(() => {
  if (!filterSelectorKeyword.value.trim()) return filterableFields
  const keyword = filterSelectorKeyword.value.toLowerCase()
  return filterableFields.filter(f =>
    f.label.toLowerCase().includes(keyword) ||
    f.value.toLowerCase().includes(keyword)
  )
})

// 分类统计量
const aggregationGrouped = computed(() => {
  return [
    {
      category: '基础',
      items: [
        { value: 'sum_units' as AggregationType, label: '销量求和' },
        { value: 'sum_value' as AggregationType, label: '销售额' },
        { value: 'asp' as AggregationType, label: 'ASP' },
        { value: 'avg_value' as AggregationType, label: '平均值' },
        { value: 'min_value' as AggregationType, label: '最小值' },
        { value: 'max_value' as AggregationType, label: '最大值' },
      ],
    },
    {
      category: '衍生',
      items: [
        { value: 'market_share' as AggregationType, label: '市场份额' },
        { value: 'revenue_share' as AggregationType, label: '销售额占比' },
        { value: 'units_share' as AggregationType, label: '销量占比' },
        { value: 'yoy_growth' as AggregationType, label: 'YoY 增长率' },
        { value: 'mom_growth' as AggregationType, label: 'MoM 增长率' },
      ],
    },
    {
      category: '结构',
      items: [
        { value: 'a4_a3_ratio' as AggregationType, label: 'A4/A3 Ratio' },
        { value: 'color_mono_mix' as AggregationType, label: 'Color/Mono Mix' },
      ],
    },
    {
      category: '智能',
      items: [
        { value: 'dev_indicator' as AggregationType, label: '偏差监控' },
      ],
    },
    {
      category: '高级',
      items: [
        { value: 'cagr' as AggregationType, label: 'CAGR' },
        { value: 'concentration' as AggregationType, label: '市场集中度' },
        { value: 'top3_share' as AggregationType, label: 'Top3 份额' },
        { value: 'hh_index' as AggregationType, label: 'HHI 指数' },
      ],
    },
  ]
})

// 过滤的快速模板
const filteredQuickTemplates = computed(() => {
  return systemTemplates.value.slice(0, 6)
})

// 过滤的模板库
const filteredTemplates = computed(() => {
  if (selectedTemplateCategory.value === 'all') {
    return systemTemplates.value
  }
  return systemTemplates.value.filter(t => t.category === (selectedTemplateCategory.value as TemplateCategory))
})

// 是否有结果
const hasResult = computed(() => queryResult.value.length > 0)

// 表格数据
const tableData = computed(() => {
  return queryResult.value
})

// 表格列
const tableColumns = computed(() => {
  if (tableData.value.length === 0) return []
  const keys = Object.keys(tableData.value[0])
  return keys.map(key => ({
    title: String(key),
    key: String(key),
    ellipsis: { tooltip: true },
    sortable: true,
  }))
})

// ==================== 透视表核心逻辑 ====================

// 透视表行数据类型
interface PivotRowData {
  _rowKey: string        // 唯一行标识
  _brandRowspan: number  // 品牌行合并数
  _isFirstOfBrand: boolean
  [key: string]: unknown
}

// 探测列维度字段名（第一个非行维度的字段）
function detectColField(): string | null {
  if (config.value.colFields.length > 0) {
    return config.value.colFields[0].value
  }
  if (queryResult.value.length === 0) return null
  const rowFieldValues = config.value.rowFields.map(f => f.value)
  const keys = Object.keys(queryResult.value[0])
  return keys.find(k => !(rowFieldValues as string[]).includes(k)) || null
}

// 生成透视表数据（将扁平行按列维度值展开为宽表）
function buildPivotTableData(
  flatData: Record<string, unknown>[],
  rowFieldKeys: string[],
  colFieldKey: string | null,
  valueFieldKeys: string[]
): PivotRowData[] {
  if (!colFieldKey) {
    // 无列维度，保留原样
    return flatData.map((row, idx) => ({
      _rowKey: `${idx}`,
      _brandRowspan: 1,
      _isFirstOfBrand: true,
      ...row,
    }))
  }

  // 收集所有列维度值并排序（Period: H1 2024 < H2 2024）
  const colValues = [...new Set(flatData.map(r => String(r[colFieldKey] ?? '')))].sort()

  // 按行维度分组
  const groups = new Map<string, Record<string, unknown>[]>()
  for (const row of flatData) {
    const key = rowFieldKeys.map(k => String(row[k] ?? '')).join('|||')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  const result: PivotRowData[] = []
  let brandCount = 0

  for (const [groupKey, groupRows] of groups) {
    const keyParts = groupKey.split('|||')

    // 计算该行组在每个列值下的每个统计量的值
    const rowMap: Record<string, unknown> = { _rowKey: groupKey }
    rowFieldKeys.forEach((fk, i) => { rowMap[fk] = keyParts[i] })

    for (const cv of colValues) {
      const matched = groupRows.find(r => String(r[colFieldKey]) === cv)
      if (matched) {
        for (const vk of valueFieldKeys) {
          rowMap[`${cv}|||${vk}`] = matched[vk]
        }
      } else {
        for (const vk of valueFieldKeys) {
          rowMap[`${cv}|||${vk}`] = null
        }
      }
    }

    // 品牌行合并逻辑（按第一个行维度分组）
    const brandKey = keyParts[0] || ''
    const sameBrandRows = [...groups.entries()].filter(
      ([gk]) => gk.split('|||')[0] === brandKey
    ).reduce((acc, [, v]) => acc + v.length, 0)
    const brandStartIdx = [...groups.entries()].findIndex(
      ([gk]) => gk.split('|||')[0] === brandKey && gk === groupKey
    )

    rowMap._brandRowspan = sameBrandRows
    rowMap._isFirstOfBrand = brandStartIdx === [...groups.entries()].findIndex(
      ([gk]) => gk.split('|||')[0] === brandKey
    )

    result.push(rowMap as PivotRowData)
  }

  return result
}

// 生成透视表多级表头列配置
function buildPivotColumns(
  rowFieldKeys: string[],
  colValues: string[],
  valueFieldKeys: string[]
): any[] {
  const columns: any[] = []

  // 行维度列（固定在最左侧）
  for (let i = 0; i < rowFieldKeys.length; i++) {
    const fk = rowFieldKeys[i]
    columns.push({
      title: config.value.rowFields[i]?.label || fk,
      key: fk,
      fixed: 'left',
      width: 140,
      rowSpan: ({ rowData }: any) => {
        if (i === 0 && rowData._isFirstOfBrand && rowData._brandRowspan > 1) {
          return rowData._brandRowspan
        }
        if (i > 0) return 1
        return 1
      },
      render: (rowData: any) => rowData[fk] ?? '',
    })
  }

  // 列维度值 × 统计量（动态生成多级表头）
  for (const cv of colValues) {
    const subColumns = valueFieldKeys.map((vk, vkIdx) => {
      const valCfg = config.value.valueFields[vkIdx]
      return {
        title: valCfg?.label || vk,
        key: `${cv}|||${vk}`,
        width: 130,
        align: 'right' as const,
        aggregation: valCfg?.aggregation,
        format: valCfg?.format,
        decimalPlaces: valCfg?.decimalPlaces,
        render: (rowData: PivotRowData) => {
          const val = rowData[`${cv}|||${vk}`]
          if (val === null || val === undefined) return '—'
          return formatCellValue(val, valCfg)
        },
      }
    })

    columns.push({
      title: cv,
      key: `group_${cv}`,
      children: subColumns,
    })
  }

  return columns
}

// 格式化单元格值
function formatCellValue(val: unknown, valCfg?: ValueFieldConfig): string {
  if (val === null || val === undefined) return '—'
  const num = Number(val)
  if (isNaN(num)) return String(val)
  const dp = valCfg?.decimalPlaces ?? 0
  if (valCfg?.format === 'percent') {
    return `${(num * 100).toFixed(dp)}%`
  }
  if (valCfg?.format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    }).format(num)
  }
  if (valCfg?.format === 'ratio_display') {
    // A4/A3 Ratio: "82 / 18"（两个值比例）
    if (valCfg.aggregation === 'a4_a3_ratio') {
      const parts = String(val).split('|||')
      if (parts.length >= 2) {
        return `${parts[0].trim()} / ${parts[1].trim()}`
      }
    }
    // Color/Mono Mix: "54% Color"（带标注的百分比）
    if (valCfg.aggregation === 'color_mono_mix') {
      return `${num.toFixed(0)}% Color`
    }
    // 偏差监控: 显示 HIGH/NORM/LOW
    if (valCfg.aggregation === 'dev_indicator') {
      const levelMap: Record<string, string> = { HIGH: 'HIGH', NORM: 'NORM', LOW: 'LOW' }
      return levelMap[String(val).toUpperCase()] || 'NORM'
    }
    // 默认显示百分比
    return `${num.toFixed(dp)}%`
  }
  if (dp === 0) return num.toLocaleString()
  return num.toFixed(dp)
}

// 生成扁平表头（用于 CSV 导出）
function buildFlatHeaders(
  rowFieldKeys: string[],
  colFieldKey: string | null,
  valueFieldKeys: string[]
): string[] {
  const headers: string[] = []
  rowFieldKeys.forEach((fk, i) => {
    headers.push(config.value.rowFields[i]?.label || fk)
  })
  if (!colFieldKey) {
    valueFieldKeys.forEach((vk, i) => {
      headers.push(config.value.valueFields[i]?.label || vk)
    })
  } else {
    const colValues = [...new Set(queryResult.value.map(r => String(r[colFieldKey] ?? '')))].sort()
    colValues.forEach(cv => {
      valueFieldKeys.forEach((vk, i) => {
        headers.push(`${cv} - ${config.value.valueFields[i]?.label || vk}`)
      })
    })
  }
  return headers
}

// 偏差监控预计算数据（每个行组 key -> CV 值）
const devIndicatorCache = ref<Record<string, { cv: number; level: 'HIGH' | 'NORM' | 'LOW'; detail: string }>>({})

// 计算一组值的变异系数 (CV = std/mean)
function calculateCV(values: number[]): number {
  const valid = values.filter(v => !isNaN(v) && v > 0)
  if (valid.length < 2) return 0
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length
  const variance = valid.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / valid.length
  return Math.sqrt(variance) / mean
}

// 预计算所有行组的偏差监控数据
function computeDeviationCache(
  flatData: Record<string, unknown>[],
  rowFieldKeys: string[],
  valueFieldKeys: string[]
) {
  const cache: Record<string, { cv: number; level: 'HIGH' | 'NORM' | 'LOW'; detail: string }> = {}
  const groups = new Map<string, Record<string, unknown>[]>()

  for (const row of flatData) {
    const key = rowFieldKeys.map(k => String(row[k] ?? '')).join('|||')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  for (const [groupKey, groupRows] of groups) {
    for (const vk of valueFieldKeys) {
      const values = groupRows
        .map(r => Number(r[vk]))
        .filter(v => !isNaN(v))
      if (values.length < 2) {
        cache[`${groupKey}|||${vk}`] = { cv: 0, level: 'NORM', detail: '—' }
        continue
      }
      const cv = calculateCV(values)
      let level: 'HIGH' | 'NORM' | 'LOW'
      let detail: string
      if (cv > 0.5) {
        level = 'HIGH'
        detail = `CV=${(cv * 100).toFixed(1)}%`
      } else if (cv < 0.15) {
        level = 'LOW'
        detail = `CV=${(cv * 100).toFixed(1)}%`
      } else {
        level = 'NORM'
        detail = `CV=${(cv * 100).toFixed(1)}%`
      }
      cache[`${groupKey}|||${vk}`] = { cv, level, detail }
    }
  }
  devIndicatorCache.value = cache
}

// 智能监控 (Deviance)：单值偏差（各国数据间的统计方差）
// 用于某一行的某个指标值相对全局均值的偏差，标注 HIGH/NORM/LOW
function computeDevianceLevel(
  value: number,
  allValues: number[]
): { level: 'HIGH' | 'NORM' | 'LOW'; label: string } {
  if (allValues.length < 2) return { level: 'NORM', label: '—' }
  const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length
  if (mean === 0) return { level: 'NORM', label: '—' }
  const zScore = Math.abs((value - mean) / mean)
  if (zScore > 1.5) return { level: 'HIGH', label: 'HIGH' }
  if (zScore < 0.3) return { level: 'LOW', label: 'LOW' }
  return { level: 'NORM', label: 'NORM' }
}

// 刷新透视表（供查询完成后调用）
function refreshPivotTable() {
  if (!hasResult.value) return

  const rowFieldKeys = config.value.rowFields.map(f => f.value)
  const colFieldKey = detectColField()
  const valueFieldKeys = config.value.valueFields.map(f => f.aggregation)

  if (rowFieldKeys.length === 0 || valueFieldKeys.length === 0) return

  // 预计算偏差监控缓存
  if (config.value.valueFields.some(f => f.aggregation === 'dev_indicator')) {
    computeDeviationCache(queryResult.value, rowFieldKeys, valueFieldKeys)
  }

  // 1. 转换数据
  pivotTableData.value = buildPivotTableData(
    queryResult.value,
    rowFieldKeys,
    colFieldKey,
    valueFieldKeys
  )

  // 2. 生成列配置
  const colValues = colFieldKey
    ? [...new Set(queryResult.value.map(r => String(r[colFieldKey] ?? '')))].sort()
    : []
  pivotTableColumns.value = buildPivotColumns(rowFieldKeys, colValues, valueFieldKeys)
}

// PivotTableView 所需的结构化列配置
const pivotTableLeftCols = computed(() => {
  if (!pivotTableColumns.value || pivotTableColumns.value.length === 0) return []
  // 取 fixed='left' 的列
  return pivotTableColumns.value
    .filter((col: any) => col.fixed === 'left')
    .map((col: any) => ({ key: col.key, title: col.title, width: col.width || 140 }))
})

const pivotTableColGroups = computed(() => {
  if (!pivotTableColumns.value || pivotTableColumns.value.length === 0) return []
  // 取有 children（列维度分组）的列
  const groupColors = ['#2563EB', '#9333EA', '#D97706', '#10B981', '#06B6D4']
  return pivotTableColumns.value
    .filter((col: any) => col.children && col.children.length > 0)
    .map((col: any, idx: number) => ({
      key: col.key,
      title: col.title,
      color: groupColors[idx % groupColors.length],
      colspan: col.children.length,
      subColumns: col.children.map((sub: any) => ({
        key: sub.key,
        title: sub.title,
        width: sub.width || 130,
        align: 'right' as const,
      })),
    }))
})

const pivotTableValueCols = computed(() => {
  if (!pivotTableColumns.value || pivotTableColumns.value.length === 0) return []
  const cols: any[] = []
  const groupColors = ['#2563EB', '#9333EA', '#D97706', '#10B981', '#06B6D4']
  let groupIdx = 0
  for (const col of pivotTableColumns.value) {
    if (col.children) {
      for (const sub of col.children) {
        cols.push({
          key: sub.key,
          title: sub.title,
          width: sub.width || 130,
          align: 'right' as const,
          colorIndex: cols.length % valueColors.length,
          style: {},
          aggregation: sub.aggregation,
          format: sub.format,
          decimalPlaces: sub.decimalPlaces,
        })
      }
      groupIdx++
    }
  }
  return cols
})

// 导出时的扁平数据（用于 CSV 展平格式）
const pivotFlatDataForExport = computed(() => {
  if (!hasResult.value) return []
  const rowFieldKeys = config.value.rowFields.map(f => f.value)
  const colFieldKey = detectColField()
  const valueFieldKeys = config.value.valueFields.map(f => f.aggregation)
  const flatData = buildPivotTableData(queryResult.value, rowFieldKeys, colFieldKey, valueFieldKeys)
  const headers = buildFlatHeaders(rowFieldKeys, colFieldKey, valueFieldKeys)

  return flatData.map(row => {
    const out: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      if (i < rowFieldKeys.length) {
        out[h] = row[rowFieldKeys[i]]
      } else {
        const colVal = colFieldKey
          ? [...new Set(queryResult.value.map(r => String(r[colFieldKey] ?? '')))].sort()
          : []
        const valueIdx = (i - rowFieldKeys.length) % valueFieldKeys.length
        const colIdx = Math.floor((i - rowFieldKeys.length) / valueFieldKeys.length)
        const cv = colVal[colIdx] || ''
        out[h] = row[`${cv}|||${valueFieldKeys[valueIdx]}`]
      }
    })
    return out
  })
})

// Excel 多级表头导出
function exportPivotExcel(pivotData: PivotRowData[], pivotCols: any[], flatExportData: Record<string, unknown>[]) {
  const rowFieldKeys = config.value.rowFields.map(f => f.value)
  const colFieldKey = detectColField()
  const colValues = colFieldKey
    ? [...new Set(queryResult.value.map(r => String(r[colFieldKey] ?? '')))].sort()
    : []

  // 构建表头行
  const headerRow1: string[] = rowFieldKeys.map((_, i) => config.value.rowFields[i]?.label || '')
  const headerRow2: string[] = rowFieldKeys.map(() => '')

  colValues.forEach(cv => {
    headerRow1.push(cv)
    headerRow1.push(...Array(config.value.valueFields.length - 1).fill(''))
    config.value.valueFields.forEach(vf => {
      headerRow2.push(vf.label || '')
    })
  })

  // 构建数据行
  const dataRows = pivotData.map(row => {
    const row1: string[] = []
    rowFieldKeys.forEach((fk, i) => {
      row1.push(String(row[fk] ?? ''))
    })
    colValues.forEach(cv => {
      config.value.valueFields.forEach((vf, vkIdx) => {
        const val = row[`${cv}|||${vf.aggregation}`]
        row1.push(val !== null && val !== undefined ? formatCellValue(val, vf) : '—')
      })
    })
    return row1
  })

  // 生成 HTML 表格（含多级表头跨列合并）
  const colSpanCount = rowFieldKeys.length + colValues.length * config.value.valueFields.length
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>IDC_Pivot</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1" style="border-collapse:collapse;font-size:12px;"><thead>`

  // 第一行：行维度名称 + 列维度值（跨列合并）
  html += `<tr>`
  rowFieldKeys.forEach(() => { html += `<th style="background:#f3f4f6;font-weight:bold;">${''}</th>` })
  colValues.forEach(cv => {
    html += `<th colspan="${config.value.valueFields.length}" style="background:#2563eb;color:#fff;font-weight:bold;text-align:center;">${cv}</th>`
  })
  html += `</tr>`

  // 第二行：行维度名称 + 统计量名称
  html += `<tr>`
  rowFieldKeys.forEach(h => { html += `<th style="background:#f3f4f6;font-weight:bold;">${config.value.rowFields.find(f => f.value === h)?.label || h}</th>` })
  colValues.forEach(() => {
    config.value.valueFields.forEach(vf => {
      html += `<th style="background:#f3f4f6;font-weight:bold;text-align:right;">${vf.label || ''}</th>`
    })
  })
  html += `</tr></thead><tbody>`

  // 数据行（带行合并）
  pivotData.forEach(row => {
    html += `<tr>`
    rowFieldKeys.forEach((fk, i) => {
      const isBrandCell = i === 0 && row._isFirstOfBrand
      const attrs = isBrandCell && row._brandRowspan > 1 ? ` rowspan="${row._brandRowspan}"` : ''
      html += `<th style="background:#fff;font-weight:normal;text-align:left;"${attrs}>${row[fk] ?? ''}</th>`
    })
    colValues.forEach(cv => {
      config.value.valueFields.forEach((vf, vkIdx) => {
        const val = row[`${cv}|||${vf.aggregation}`]
        const isBrandCell = rowFieldKeys.length === 0 ? false : row._isFirstOfBrand
        const attrs = vkIdx === 0 && isBrandCell && row._brandRowspan > 1 ? ` rowspan="${row._brandRowspan}"` : ''
        html += `<td style="text-align:right;"${attrs}>${val !== null && val !== undefined ? formatCellValue(val, vf) : '—'}</td>`
      })
    })
    html += `</tr>`
  })
  html += `</tbody></table></body></html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `IDC_Pivot_${Date.now()}.xls`
  link.click()
  URL.revokeObjectURL(url)
}

// 柱状图配置
const barChartOption = computed(() => {
  if (!hasResult.value) return {}
  const data = tableData.value.slice(0, 10)
  const firstKey = tableColumns.value[0]?.key || ''
  const secondKey = tableColumns.value[1]?.key || ''
  const categories = data.map(d => String(d[firstKey] ?? ''))
  const seriesData = data.map(d => Number(d[secondKey] ?? 0))

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    grid: { ...WEB3_GRID },
    xAxis: {
      type: 'category',
      data: categories,
      ...WEB3_XAXIS,
      axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 },
    },
    yAxis: { ...WEB3_YAXIS },
    series: [{
      type: 'bar',
      data: seriesData.map((v, idx) => ({ value: v, itemStyle: getGradientBarStyle(idx) })),
      barWidth: '50%',
    }],
  }
})

// 饼图配置
const pieChartOption = computed(() => {
  if (!hasResult.value) return {}
  const data = tableData.value.slice(0, 8)
  const firstKey = tableColumns.value[0]?.key || ''
  const secondKey = tableColumns.value[1]?.key || ''
  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', ...WEB3_LEGEND },
    series: [{
      type: 'pie',
      radius: ['65%', '85%'],
      center: ['40%', '50%'],
      itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        scale: true,
        scaleSize: 8,
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 74, 198, 0.2)' },
      },
      data: data.map((d, i) => ({
        name: String(d[firstKey] ?? `Item ${i}`),
        value: Number(d[secondKey] ?? 0),
        itemStyle: { color: WEB3_COLORS[i % WEB3_COLORS.length] },
      })),
    }],
  }
})

// 折线图配置
const lineChartOption = computed(() => {
  if (!hasResult.value) return {}
  const data = tableData.value
  const firstKey = tableColumns.value[0]?.key || ''
  const secondKey = tableColumns.value[1]?.key || ''
  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    grid: { ...WEB3_GRID },
    xAxis: {
      type: 'category',
      data: data.map(d => String(d[firstKey] ?? '')),
      ...WEB3_XAXIS,
    },
    yAxis: { ...WEB3_YAXIS },
    series: [{
      type: 'line',
      data: data.map(d => Number(d[secondKey] ?? 0)),
      smooth: 0.4,
      lineStyle: { width: 3, color: WEB3_COLORS[0] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: WEB3_COLORS[0] + '33' },
            { offset: 1, color: WEB3_COLORS[0] + '00' },
          ],
        },
      },
      emphasis: {
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#fff', borderColor: WEB3_COLORS[0], borderWidth: 2, shadowColor: WEB3_COLORS[0], shadowBlur: 8 },
      },
    }],
  }
})

// 热力图配置
const heatmapChartOption = computed(() => {
  if (!hasResult.value) return {}
  const data = tableData.value.slice(0, 20)
  const firstKey = tableColumns.value[0]?.key || ''
  const secondKey = tableColumns.value[1]?.key || ''
  const maxVal = Math.max(...data.map(d => Number(d[secondKey] ?? 0)))
  return {
    backgroundColor: 'transparent',
    tooltip: { position: 'top', ...WEB3_TOOLTIP },
    grid: { ...WEB3_GRID, right: '10%' },
    xAxis: { ...WEB3_XAXIS, type: 'category', data: data.map((_, i) => `X${i + 1}`), splitArea: { show: true } },
    yAxis: { ...WEB3_YAXIS, type: 'category', data: data.map(d => String(d[firstKey] ?? '')), splitArea: { show: true } },
    visualMap: { min: 0, max: maxVal || 100, calculable: true, orient: 'vertical', right: 0, top: 'center', textStyle: { color: '#4b5563' } },
    series: [{
      data: data.map((d, i) => [i, 0, Number(d[secondKey] ?? 0)]),
      label: { show: true },
      itemStyle: { borderColor: '#ffffff', borderWidth: 1 },
    }],
  }
})

// ==================== 方法 ====================

/**
 * 品类切换
 */
function handleCategoryChange(category: ProductType) {
  currentCategory.value = category
  idcStore.setProductType(category)
  // 清除已选字段中不适用的字段
  config.value.rowFields = config.value.rowFields.filter(f => {
    const field = availableFields.value.find(af => af.value === f.value)
    return !!field
  })
  config.value.colFields = config.value.colFields.filter(f => {
    const field = availableFields.value.find(af => af.value === f.value)
    return !!field
  })
}

/**
 * 字段是否已使用
 */
function isFieldUsed(value: PivotDimension): boolean {
  return (
    config.value.rowFields.some(f => f.value === value) ||
    config.value.colFields.some(f => f.value === value)
  )
}

/**
 * 移除值字段
 */
function removeValueField(aggregation: AggregationType) {
  config.value.valueFields = config.value.valueFields.filter(f => f.aggregation !== aggregation)
}

/**
 * 移除行字段
 */
function removeRowField(value: PivotDimension) {
  config.value.rowFields = config.value.rowFields.filter(f => f.value !== value)
}

/**
 * 移除列字段
 */
function removeColField(value: PivotDimension) {
  config.value.colFields = config.value.colFields.filter(f => f.value !== value)
}

/**
 * 字段是否禁用
 */
function isFieldDisabled(field: FieldDef): boolean {
  if (currentCategory.value === 'laser') {
    return ['Ink Tank/ Ink Cartridge', 'Business Inkjet Detail'].includes(field.value)
  }
  if (currentCategory.value === 'inkjet') {
    return field.value === 'Production Classification'
  }
  return false
}

/**
 * 获取统计量标签
 */
function getAggregationLabel(aggregation: AggregationType): string {
  const agg = aggregationDefs.value.find(a => a.id === aggregation)
  return agg?.name || aggregation
}

/**
 * 是否已选择统计量
 */
function isAggregationSelected(aggregation: AggregationType): boolean {
  return config.value.valueFields.some(f => f.aggregation === aggregation)
}

/**
 * 添加统计量
 */
function handleAddAggregation(aggregation: AggregationType | null) {
  if (!aggregation) return

  if (isAggregationSelected(aggregation)) {
    message.warning('该统计量已添加')
    selectedAggregation.value = null
    return
  }

  if (config.value.valueFields.length >= 5) {
    message.warning('值字段最多5个')
    selectedAggregation.value = null
    return
  }

  const aggDef = aggregationDefs.value.find(a => a.id === aggregation)
  if (aggDef) {
    config.value.valueFields.push({
      aggregation,
      sourceField: aggDef.sourceFields[0] || 'units',
      label: aggDef.name,
      format: (aggDef.format || 'number') as 'number' | 'percent' | 'currency' | 'ratio' | 'ratio_display',
      decimalPlaces: aggDef.decimalPlaces || 0,
    })
  }

  selectedAggregation.value = null
}

/**
 * 切换统计量选择
 */
function toggleAggregation(aggregation: AggregationType) {
  if (isAggregationSelected(aggregation)) {
    removeValueField(aggregation)
  } else {
    if (config.value.valueFields.length >= 5) {
      message.warning('值字段最多5个')
      return
    }
    const aggDef = aggregationDefs.value.find(a => a.id === aggregation)
    if (aggDef) {
      config.value.valueFields.push({
        aggregation,
        sourceField: aggDef.sourceFields[0] || 'units',
        label: aggDef.name,
        format: (aggDef.format || 'number') as 'number' | 'percent' | 'currency' | 'ratio' | 'ratio_display',
        decimalPlaces: aggDef.decimalPlaces || 0,
      })
    }
  }
}

/**
 * 重置配置
 */
function handleResetConfig() {
  config.value.rowFields = []
  config.value.colFields = []
  config.value.valueFields = []
  filterConditions.value = []
  activeFilterPresets.value = []
  queryResult.value = []
  activeTemplateId.value = null
}

/**
 * 获取模板角标类
 */
function getTemplateBadgeClass(template: AdvancedTemplateItem): string {
  if (template.row_fields?.includes('Production Classification')) return 'badge-laser'
  if (template.row_fields?.includes('Ink Tank/ Ink Cartridge')) return 'badge-inkjet'
  return 'badge-all'
}

/**
 * 获取模板角标文本
 */
function getTemplateBadgeText(template: AdvancedTemplateItem): string {
  const cls = getTemplateBadgeClass(template)
  if (cls === 'badge-laser') return '激光'
  if (cls === 'badge-inkjet') return '喷墨'
  return '全品类'
}

/**
 * 获取模板数量
 */
function getTemplateCountByCategory(category: string): number {
  if (category === 'all') return systemTemplates.value.length
  return systemTemplates.value.filter(t => t.category === category).length
}

/**
 * 应用模板
 */
function handleApplyTemplate(template: AdvancedTemplateItem) {
  activeTemplateId.value = template.id

  // 设置品类
  const badgeClass = getTemplateBadgeClass(template)
  if (badgeClass === 'badge-laser') {
    handleCategoryChange('laser')
  } else if (badgeClass === 'badge-inkjet') {
    handleCategoryChange('inkjet')
  } else {
    handleCategoryChange('all')
  }

  // 设置行维度
  config.value.rowFields = template.row_fields.map(f => ({
    value: f,
    label: f as string,
    icon: undefined,
    category: undefined,
  }))

  // 设置列维度
  config.value.colFields = template.col_field ? [{
    value: template.col_field,
    label: template.col_field as string,
    icon: undefined,
    category: undefined,
  }] : []

  // 设置值字段
  config.value.valueFields = [...template.value_configs]

  // 关闭模板库
  showTemplateLibrary.value = false

  // 自动执行查询
  handleExecuteQuery()

  message.success(`已加载模板: ${template.name}`)
}

/**
 * 预览模板
 */
function handlePreviewTemplate(template: AdvancedTemplateItem) {
  handleApplyTemplate(template)
}

/**
 * 执行查询
 */
async function handleExecuteQuery() {
  if (config.value.rowFields.length === 0) {
    message.warning('请至少选择一个行维度')
    return
  }

  if (config.value.valueFields.length === 0) {
    message.warning('请至少选择一个统计量')
    return
  }

  queryLoading.value = true

  try {
    const res = await idcApi.queryAdvancedPivot({
      rowFields: config.value.rowFields.map(f => f.value),
      colField: config.value.colFields[0]?.value,
      valueFields: config.value.valueFields,
      filters: filters.value,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })

    if (res.success && res.data) {
      queryResult.value = res.data.rows
      // 刷新透视表数据
      nextTick(() => refreshPivotTable())
    }
  } catch (e) {
    message.error('查询失败')
  } finally {
    queryLoading.value = false
  }
}

/**
 * 重置所有配置
 */
function handleResetAll() {
  handleResetConfig()
  handleCategoryChange('all')
}

/**
 * 显示筛选
 */
function handleShowFilters() {
  showFilterDrawer.value = true
}

/**
 * 筛选确认
 */
function handleFilterConfirm() {
  handleExecuteQuery()
}

/**
 * 保存为模板
 */
function handleSaveAsTemplate() {
  if (config.value.rowFields.length === 0) {
    message.warning('请先配置分析维度')
    return
  }
  templateForm.name = ''
  templateForm.description = ''
  templateForm.category = ''
  templateForm.shareStatus = 'private'
  showSaveTemplateModal.value = true
}

/**
 * 确认保存模板
 */
async function handleConfirmSaveTemplate() {
  if (!templateForm.name) {
    message.warning('请输入模板名称')
    return
  }

  try {
    await idcApi.saveTemplate({
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category as TemplateCategory,
      row_fields: config.value.rowFields.map(f => f.value),
      col_field: config.value.colFields[0]?.value,
      value_configs: config.value.valueFields,
      share_status: templateForm.shareStatus,
    })
    message.success('模板保存成功')
    showSaveTemplateModal.value = false
  } catch (e) {
    message.error('保存失败')
  }
}

/**
 * 导出数据
 */
function handleExport(format: 'csv' | 'excel') {
  if (!hasResult.value) {
    message.warning('暂无数据可导出')
    return
  }

  const data = queryResult.value as Record<string, unknown>[]
  if (data.length === 0) {
    message.warning('暂无数据可导出')
    return
  }

  if (format === 'csv') {
    // CSV 导出：透视模式下用展平后的数据，非透视模式用原始数据
    const exportData = pivotViewEnabled.value
      ? (pivotFlatDataForExport.value as Record<string, unknown>[])
      : data
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `IDC_Analysis_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    message.success('导出成功')
  } else {
    // Excel 导出
    if (pivotViewEnabled.value && pivotTableData.value.length > 0) {
      // 透视表多级表头导出
      exportPivotExcel(pivotTableData.value, pivotTableColumns.value, pivotFlatDataForExport.value as Record<string, unknown>[])
    } else {
      // 普通扁平表格导出
      const headers = Object.keys(data[0])
      const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>IDC_Analysis</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th style="background:#4472C4;color:white;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `IDC_Analysis_${Date.now()}.xls`
      link.click()
      URL.revokeObjectURL(url)
    }
    message.success('导出成功')
  }
}

/**
 * 分享
 */
function handleShare() {
  message.info('分享功能开发中')
}

// ==================== 高级功能方法 ====================

/**
 * 展开/折叠行字段
 */
function toggleRowFieldExpand(fieldValue: PivotDimension) {
  const idx = expandedRowFields.value.indexOf(fieldValue)
  if (idx > -1) {
    expandedRowFields.value.splice(idx, 1)
  } else {
    expandedRowFields.value.push(fieldValue)
  }
}

/**
 * 字段项拖拽开始（内部排序）
 */
function handleFieldItemDragStart(event: DragEvent, type: 'row' | 'col', index: number) {
  draggingFieldItem.value = `${type}-${index}`
  draggingFieldType.value = type
  draggingFieldIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

/**
 * 字段项拖拽结束
 */
function handleFieldItemDragEnd() {
  draggingFieldItem.value = null
  draggingFieldType.value = null
  draggingFieldIndex.value = -1
}

/**
 * 字段项拖拽悬停
 */
function handleFieldItemDragOver(event: DragEvent, type: 'row' | 'col', index: number) {
  if (draggingFieldType.value !== type) return
  event.preventDefault()
}

/**
 * 字段项拖放（内部排序）
 */
function handleFieldItemDrop(event: DragEvent, type: 'row' | 'col', targetIndex: number) {
  if (draggingFieldType.value !== type || draggingFieldIndex.value === -1) return

  const fields = type === 'row' ? config.value.rowFields : config.value.colFields
  const [movedItem] = fields.splice(draggingFieldIndex.value, 1)
  fields.splice(targetIndex, 0, movedItem)

  handleFieldItemDragEnd()
}

/**
 * 右键菜单
 */
function handleContextMenu(event: MouseEvent, type: 'row' | 'col', index: number) {
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuFieldType.value = type
  contextMenuFieldIndex.value = index
  showContextMenu.value = true
}

// 点击其他地方关闭右键菜单
document.addEventListener('click', () => {
  showContextMenu.value = false
})

/**
 * 右键菜单操作
 */
function handleContextAction(action: 'sort' | 'filter' | 'delete') {
  if (!contextMenuFieldType.value) return

  const type = contextMenuFieldType.value
  const index = contextMenuFieldIndex.value

  if (action === 'delete') {
    if (type === 'row') {
      const field = config.value.rowFields[index]
      if (field) removeRowField(field.value)
    } else {
      const field = config.value.colFields[index]
      if (field) removeColField(field.value)
    }
  } else if (action === 'filter') {
    const field = type === 'row' ? config.value.rowFields[index] : config.value.colFields[index]
    if (field) {
      handleFilterField({ value: field.value, label: field.label, type: 'enum' })
    }
  } else if (action === 'sort') {
    handleSortField(type, index)
  }

  showContextMenu.value = false
}

/**
 * 设置字段排序
 */
function handleSortField(type: 'row' | 'col', index: number) {
  message.info(`设置 ${type === 'row' ? '行' : '列'}维度排序`)
  // TODO: 打开排序设置弹窗
}

/**
 * 处理字段筛选
 */
function handleFilterField(field: { value: string; label: string; type?: string }) {
  const fieldDef = filterableFields.find(f => f.value === field.value)
  editingConditionField.value = {
    value: field.value,
    label: field.label,
    type: (fieldDef?.type || 'text') as 'number' | 'text' | 'enum' | 'boolean',
  }
  editingCondition.value = null
  showConditionEditor.value = true
  showFilterSelector.value = false
}

/**
 * 条件确认
 */
function handleConditionConfirm(condition: {
  field: string
  fieldLabel: string
  operator: string
  value: string | number | string[]
}) {
  const newCondition: FilterCondition = {
    id: `cond-${Date.now()}`,
    ...condition,
  }

  // 检查是否已存在相同字段的条件
  const existingIdx = filterConditions.value.findIndex(c => c.field === condition.field)
  if (existingIdx > -1) {
    filterConditions.value.splice(existingIdx, 1, newCondition)
  } else {
    filterConditions.value.push(newCondition)
  }

  message.success('筛选条件已添加')
}

/**
 * 编辑筛选条件
 */
function editFilterCondition(cond: FilterCondition) {
  const fieldDef = filterableFields.find(f => f.value === cond.field)
  editingConditionField.value = {
    value: cond.field,
    label: cond.fieldLabel,
    type: (fieldDef?.type || 'text') as 'number' | 'text' | 'enum' | 'boolean',
  }
  editingCondition.value = cond
  showConditionEditor.value = true
}

/**
 * 移除筛选条件
 */
function removeFilterCondition(id: string) {
  filterConditions.value = filterConditions.value.filter(c => c.id !== id)
}

/**
 * 获取操作符标签
 */
function getOperatorLabel(operator: string): string {
  const labels: Record<string, string> = {
    '=': '等于',
    '!=': '不等于',
    '>': '大于',
    '<': '小于',
    '>=': '大于等于',
    '<=': '小于等于',
    'between': '区间',
    'contains': '包含',
    'not_contains': '不包含',
    'in': '在列表中',
    'not_in': '不在列表中',
  }
  return labels[operator] || operator
}

/**
 * 获取条件值文本
 */
function getConditionValueText(cond: FilterCondition): string {
  if (Array.isArray(cond.value)) {
    return cond.value.join(', ')
  }
  return String(cond.value)
}

/**
 * 预设筛选模板
 */
function isPresetActive(presetId: string): boolean {
  return activeFilterPresets.value.includes(presetId)
}

function toggleFilterPreset(preset: typeof filterPresets[0]) {
  const idx = activeFilterPresets.value.indexOf(preset.id)
  if (idx > -1) {
    activeFilterPresets.value.splice(idx, 1)
    // 移除该预设添加的条件
    preset.conditions.forEach(cond => {
      filterConditions.value = filterConditions.value.filter(c => c.field !== cond.field)
    })
  } else {
    activeFilterPresets.value.push(preset.id)
    // 添加预设条件
    preset.conditions.forEach(cond => {
      const fieldDef = filterableFields.find(f => f.value === cond.field)
      filterConditions.value.push({
        id: `preset-${preset.id}-${cond.field}`,
        field: cond.field,
        fieldLabel: fieldDef?.label || cond.field,
        operator: cond.operator,
        value: cond.value,
      })
    })
  }
}

/**
 * 打开值字段配置
 */
function openValueConfig(field: ValueFieldConfig) {
  editingValueConfig.value = {
    aggregation: field.aggregation,
    aggregationLabel: field.label,
    format: field.format,
    decimalPlaces: field.decimalPlaces,
  }
  showValueConfig.value = true
}

/**
 * 值字段配置确认
 */
function handleValueConfigConfirm(newConfig: {
  aggregation: string
  aggregationLabel: string
  format: string
  decimalPlaces: number
}) {
  if (!editingValueConfig.value) return

  const idx = config.value.valueFields.findIndex(f => f.aggregation === editingValueConfig.value?.aggregation)
  if (idx > -1) {
    config.value.valueFields[idx] = {
      ...config.value.valueFields[idx],
      aggregation: newConfig.aggregation as AggregationType,
      label: newConfig.aggregationLabel,
      format: newConfig.format as any,
      decimalPlaces: newConfig.decimalPlaces,
    }
  }

  message.success('统计量配置已更新')
}

/**
 * 获取格式标签
 */
function getFormatLabel(format?: string): string {
  if (!format) return ''
  const labels: Record<string, string> = {
    thousand: ',K',
    million: 'M',
    percent: '%',
    currency: '$',
  }
  return labels[format] || ''
}

// 条件拖拽排序
function handleConditionDragStart(event: DragEvent, index: number) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function handleConditionDragEnd() {
  // 清理
}

function handleConditionDragOver(event: DragEvent, index: number) {
  event.preventDefault()
}

function handleConditionDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault()
  const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') || '-1')
  if (sourceIndex === -1 || sourceIndex === targetIndex) return

  const [movedItem] = filterConditions.value.splice(sourceIndex, 1)
  filterConditions.value.splice(targetIndex, 0, movedItem)
}

// ==================== 生命周期 ====================

/**
 * 加载系统模板
 */
async function loadSystemTemplates() {
  templatesLoading.value = true
  try {
    const res = await idcApi.getAdvancedTemplates()
    if (res.success && res.data) {
      systemTemplates.value = res.data
    }
  } catch (e) {
    console.error('Failed to load templates:', e)
  } finally {
    templatesLoading.value = false
  }
}

/**
 * 加载聚合定义
 */
async function loadAggregationDefinitions() {
  // 内置聚合定义（暂不依赖 API）
  aggregationDefs.value = [
    { id: 'sum_units', name: '销量求和', sourceFields: ['units'], format: 'number', decimalPlaces: 0 },
    { id: 'sum_value', name: '销售额', sourceFields: ['value'], format: 'number', decimalPlaces: 0 },
    { id: 'asp', name: 'ASP', sourceFields: ['asp'], format: 'currency', decimalPlaces: 2 },
    { id: 'avg_value', name: '平均值', sourceFields: ['value'], format: 'number', decimalPlaces: 2 },
    { id: 'min_value', name: '最小值', sourceFields: ['value'], format: 'number', decimalPlaces: 2 },
    { id: 'max_value', name: '最大值', sourceFields: ['value'], format: 'number', decimalPlaces: 2 },
    { id: 'avg_price', name: '平均价', sourceFields: ['asp'], format: 'number', decimalPlaces: 2 },
    { id: 'market_share', name: '市场份额', sourceFields: ['share'], format: 'percent', decimalPlaces: 2 },
    { id: 'revenue_share', name: '销售额占比', sourceFields: ['value'], format: 'percent', decimalPlaces: 2 },
    { id: 'units_share', name: '销量占比', sourceFields: ['units'], format: 'percent', decimalPlaces: 2 },
    { id: 'yoy_growth', name: 'YoY 增长率', sourceFields: ['units'], format: 'percent', decimalPlaces: 2 },
    { id: 'mom_growth', name: 'MoM 增长率', sourceFields: ['units'], format: 'percent', decimalPlaces: 2 },
    { id: 'a4_a3_ratio', name: 'A4/A3 Ratio', sourceFields: ['units'], format: 'ratio_display', decimalPlaces: 0 },
    { id: 'color_mono_mix', name: 'Color/Mono Mix', sourceFields: ['units'], format: 'ratio_display', decimalPlaces: 0 },
    { id: 'dev_indicator', name: '偏差监控', sourceFields: ['units'], format: 'ratio_display', decimalPlaces: 0 },
    { id: 'cagr', name: 'CAGR', sourceFields: ['value'], format: 'percent', decimalPlaces: 2 },
    { id: 'concentration', name: '市场集中度', sourceFields: ['share'], format: 'percent', decimalPlaces: 2 },
    { id: 'top3_share', name: 'Top3 份额', sourceFields: ['share'], format: 'percent', decimalPlaces: 2 },
    { id: 'hh_index', name: 'HHI 指数', sourceFields: ['share'], format: 'number', decimalPlaces: 0 },
  ]
}

onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadSystemTemplates()
  await loadAggregationDefinitions()
})

// 透视开关切换时刷新透视表
watch(() => pivotViewEnabled.value, (enabled) => {
  if (enabled && hasResult.value) {
    refreshPivotTable()
  }
})

// 矩阵行动态重绘：行维度/列维度/统计量任一变化 → 实时重绘透视表
watch(
  () => [config.value.rowFields.map(f => f.value), config.value.colFields.map(f => f.value), config.value.valueFields.map(f => f.aggregation)],
  () => {
    if (hasResult.value) {
      nextTick(() => refreshPivotTable())
    }
  },
  { deep: true }
)

// 偏差监控缓存：当查询结果变化时重新计算
watch(() => queryResult.value, () => {
  if (!hasResult.value) return
  const rowFieldKeys = config.value.rowFields.map(f => f.value)
  const valueFieldKeys = config.value.valueFields.map(f => f.aggregation)
  computeDeviationCache(queryResult.value, rowFieldKeys, valueFieldKeys)
}, { deep: true })
</script>

<style scoped>
/* ==================== 页面头部 (IDC统一风格) ==================== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  overflow: hidden;
  margin: 0;
}

.header-left { display: flex; align-items: center; gap: 16px; }

.page-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.page-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 4px 0 0;
}

.header-right { display: flex; gap: 12px; align-items: center; }

.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: var(--dt-radius-md);
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}
.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.filter-badge {
  margin-left: 6px;
}

/* ==================== 品类选择卡片 ==================== */
.category-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 24px;
  background: #ffffff;
  border-radius: var(--dt-radius-xl);
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.category-card:hover {
  border-color: rgba(37, 99, 235, 0.2);
  box-shadow:
    0 20px 25px -5px rgba(37, 99, 235, 0.06),
    0 8px 10px -6px rgba(37, 99, 235, 0.04);
}

.category-section,
.template-section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  white-space: nowrap;
}

.label-icon {
  color: #94A3B8;
}

.divider {
  width: 1px;
  height: 36px;
  background: linear-gradient(180deg, transparent, #E2E8F0, transparent);
}

.category-tabs {
  display: flex;
  gap: 10px;
}

.category-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: var(--dt-radius-lg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.category-tab:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  transform: translateY(-2px);
}
.category-tab.active {
  background: #ffffff;
  border-color: var(--active-color, #2563eb);
  box-shadow:
    0 4px 12px rgba(37, 99, 235, 0.15),
    0 0 0 1px rgba(37, 99, 235, 0.1);
}

.cat-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--dt-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cat-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  transition: color 0.2s;
}
.category-tab.active .cat-label {
  color: #0F172A;
}

.active-indicator {
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 3px;
  background: var(--active-color, #2563eb);
  border-radius: 3px 3px 0 0;
  box-shadow: 0 -2px 8px rgba(37, 99, 235, 0.2);
}

.template-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  max-width: 500px;
  padding: 4px 0;
}

.template-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: var(--dt-radius-2xl);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.template-chip:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0.04));
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}
.template-chip.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.08));
  border-color: #2563eb;
}

.tpl-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: var(--dt-radius-sm);
  font-weight: 600;
}
.tpl-badge.badge-all { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
.tpl-badge.badge-laser { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.tpl-badge.badge-inkjet { background: rgba(6, 182, 212, 0.1); color: #0891B2; }

.tpl-name {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.more-templates-btn {
  margin-left: 8px;
  font-weight: 600;
}

/* ==================== 主内容区域 ==================== */
.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 配置和结果容器 - 垂直布局 */
.config-result-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 配置区域 */
.config-section {
  background: #ffffff;
  border-radius: var(--dt-radius-xl);
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
}

/* ==================== 字段池面板 ==================== */
.field-pool-sidebar {
  position: relative;
  width: 240px;
  background: var(--dt-color-bg-surface);
  border-right: 1px solid var(--dt-color-border);
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: var(--dt-space-3) var(--dt-space-4);
  background: var(--dt-color-bg-muted);
  border-bottom: 1px solid var(--dt-color-border);
  cursor: pointer;
  transition: var(--dt-transition-colors);
}
.panel-header:hover {
  background: var(--dt-gray-100);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
  flex: 1;
}

.collapse-icon {
  transition: transform var(--dt-duration-slow) var(--dt-ease-smooth);
  color: var(--dt-gray-400);
}
.collapse-icon.rotated {
  transform: rotate(180deg);
}

.field-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--dt-space-3);
  overflow: visible;
}

.field-search {
  margin-bottom: var(--dt-space-3);
}

/* 扁平字段列表 */
.flat-field-list {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-1);
  position: relative;
}

/* 字段项 */
.field-item {
  height: var(--dt-dd-height);
  padding: 0 var(--dt-space-3) 0 var(--dt-space-4);
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  position: relative;
  cursor: pointer;
  border-radius: var(--dt-radius-sm);
  transition: background var(--dt-duration-fast) var(--dt-ease-smooth);
}
.field-item:hover {
  background-color: var(--dt-sidebar-item-bg-hover);
}
.field-item.is-selected {
  background-color: var(--dt-dd-bg-selected);
  color: var(--dt-dd-text-selected);
}
.field-item.is-selected::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background-color: var(--dt-dd-border-selected);
  border-radius: 0 2px 2px 0;
}
.field-item.is-used {
  opacity: 0.5;
  cursor: not-allowed;
}
.field-item.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.field-item.is-dragging {
  opacity: 0.5;
}

.field-label {
  font-size: var(--dt-dd-font-size);
  color: var(--dt-dd-text-default);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-item.is-selected .field-label {
  color: var(--dt-dd-text-selected);
}

.field-item-tag {
  font-size: 10px;
  font-weight: var(--dt-weight-extrabold);
  padding: 2px 4px;
  border-radius: var(--dt-radius-xs);
  background: var(--dt-color-primary-100);
  color: var(--dt-color-primary);
  flex-shrink: 0;
}

.field-arrow {
  color: var(--dt-gray-400);
  flex-shrink: 0;
  transition: color var(--dt-duration-fast);
}
.field-item:hover .field-arrow {
  color: var(--dt-dd-icon-default);
}
.field-item.is-selected .field-arrow {
  color: var(--dt-dd-icon-selected);
}

.field-info {
  color: var(--dt-gray-400);
  opacity: 0;
  transition: opacity var(--dt-duration-fast);
}
.field-item:hover .field-info {
  opacity: 1;
}

/* ==================== 字段值浮出面板 ==================== */
.flyout {
  position: fixed;
  z-index: 1000;
  width: var(--dt-flyout-width);
  max-height: var(--dt-flyout-max-height-vh);
  background: var(--dt-flyout-bg);
  border: 1px solid var(--dt-flyout-border);
  border-radius: var(--dt-flyout-radius);
  box-shadow: var(--dt-flyout-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 过渡动画（height/max-height 变化时平滑） */
  transition: top 80ms linear, height 80ms linear;
}

.flyout-header {
  flex-shrink: 0;
  height: 44px;
  padding: 0 var(--dt-flyout-header-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dt-flyout-header-bg);
  border-bottom: 1px solid var(--dt-color-border);
}
.flyout-header-title {
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.flyout-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: var(--dt-radius-sm);
  cursor: pointer;
  color: var(--dt-color-text-secondary);
  transition: background var(--dt-duration-fast);
  flex-shrink: 0;
}
.flyout-close:hover {
  background: var(--dt-color-bg-hover);
  color: var(--dt-color-text-primary);
}

.flyout-search {
  flex-shrink: 0;
  height: 40px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--dt-color-border);
}
.flyout-search-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--dt-color-border);
  border-radius: var(--dt-radius-sm);
  font-size: var(--dt-text-sm);
  background: var(--dt-color-bg-surface);
  color: var(--dt-color-text-primary);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dt-duration-fast);
}
.flyout-search-input:focus {
  border-color: var(--dt-color-primary);
}
.flyout-search-input::placeholder {
  color: var(--dt-color-text-muted);
}

.flyout-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.flyout-item {
  height: 34px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: var(--dt-text-sm);
  color: var(--dt-color-text-primary);
  transition: background var(--dt-duration-fast);
}
.flyout-item:hover {
  background: var(--dt-color-bg-hover);
}
.flyout-item.is-checked {
  color: var(--dt-color-primary);
  font-weight: var(--dt-weight-medium);
}
.flyout-check {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--dt-color-border);
  border-radius: var(--dt-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--dt-duration-fast), border-color var(--dt-duration-fast);
}
.flyout-item.is-checked .flyout-check {
  background: var(--dt-color-primary);
  border-color: var(--dt-color-primary);
}

.flyout-footer {
  flex-shrink: 0;
  height: 44px;
  padding: 0 var(--dt-flyout-footer-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dt-flyout-footer-bg);
  border-top: 1px solid var(--dt-color-border);
  gap: 8px;
}
.flyout-footer-info {
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-secondary);
  flex: 1;
}
.flyout-footer-actions {
  display: flex;
  gap: 6px;
}
.flyout-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: var(--dt-radius-sm);
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  transition: all var(--dt-duration-fast);
}
.flyout-btn--ghost {
  background: none;
  border: 1px solid var(--dt-color-border);
  color: var(--dt-color-text-secondary);
}
.flyout-btn--ghost:hover {
  border-color: var(--dt-color-text-secondary);
  color: var(--dt-color-text-primary);
}
.flyout-btn--primary {
  background: var(--dt-color-primary);
  border: 1px solid var(--dt-color-primary);
  color: #fff;
}
.flyout-btn--primary:hover {
  background: var(--dt-color-primary-hover, #1d4ed8);
}

/* Flyout 动画 */
.flyout-enter-active,
.flyout-leave-active {
  transition: opacity var(--dt-duration-fast) var(--dt-ease-smooth),
              transform var(--dt-duration-fast) var(--dt-ease-smooth);
}
.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Tooltip */
.field-tooltip {
  max-width: 200px;
}
.tooltip-title {
  font-weight: var(--dt-weight-semibold);
  margin-bottom: var(--dt-space-1);
  color: var(--dt-color-text-primary);
}
.tooltip-field {
  font-size: var(--dt-text-2xs);
  color: var(--dt-color-text-secondary);
}

/* ==================== 配置画布面板 ==================== */
.config-zones {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.config-zones-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.config-zones-row .row-zone,
.config-zones-row .col-zone-fixed {
  flex: 1;
  width: 50%;
}

.config-zone {
  background: linear-gradient(135deg, #FAFBFC, #F8FAFC);
  border: 2px dashed #E2E8F0;
  border-radius: var(--dt-radius-lg);
  padding: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* 列维度固定高度，不跟随行维度 */
.col-zone-fixed {
  flex-shrink: 0;
  height: auto;
}

.col-zone-fixed .zone-header {
  flex-shrink: 0;
}

.col-zone-fixed .zone-content {
  flex: 1;
  min-height: 0;
}

.col-zone-fixed .zone-placeholder {
  min-height: 80px;
  height: auto;
  padding: 16px;
}

.col-zone-fixed .zone-fields {
  min-height: 0;
  max-height: none;
  overflow-y: visible;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #F1F5F9;
  flex-shrink: 0;
}

.config-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}

.config-actions {
  display: flex;
  gap: 10px;
}

.config-zone.drag-over {
  border-color: #2563eb;
  border-style: solid;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.06));
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.15);
}

.config-zone.has-content {
  border-style: solid;
  border-color: #E2E8F0;
  background: #ffffff;
}

.zone-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.zone-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
}

.zone-hint {
  font-size: 12px;
  color: #94A3B8;
  margin-left: auto;
}

.zone-content {
  flex: 1;
  min-height: 80px;
}

.zone-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100px;
  color: #94A3B8;
  font-size: 13px;
  border: 2px dashed #E2E8F0;
  border-radius: var(--dt-radius-md);
  background: #FAFBFC;
  transition: all 0.2s;
}

.config-zone.drag-over .zone-placeholder {
  border-color: #2563eb;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.zone-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zone-field-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: var(--dt-radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: grab;
}
.zone-field-item:hover {
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
  transform: translateY(-2px);
}
.zone-field-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.field-indent {
  width: 24px;
}

.field-toggle {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border: none;
  border-radius: var(--dt-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  color: #64748B;
}
.field-toggle:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}
.field-toggle.expanded {
  transform: rotate(90deg);
  background: rgba(37, 99, 235, 0.15);
  color: #2563eb;
}

.field-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}
.zone-field-item:hover .field-actions {
  opacity: 1;
}

.field-action-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--dt-radius-sm);
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s;
}
.field-action-btn:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.field-level {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #004ac6;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--dt-radius-xs);
}

.field-name {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  flex: 1;
}

.field-source {
  font-size: 11px;
  color: #64748B;
  background: #F1F5F9;
  padding: 3px 8px;
  border-radius: var(--dt-radius-sm);
}

.field-format {
  font-size: 11px;
  color: #D97706;
  padding: 3px 8px;
  background: #FEF3C7;
  border-radius: var(--dt-radius-sm);
  font-weight: 600;
}

.field-icon {
  font-size: 16px;
}

.field-remove {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  border-radius: var(--dt-radius-sm);
  transition: all 0.2s;
}
.field-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.value-zone {
  flex-shrink: 0;
}

.value-fields {
  margin-top: 12px;
}

.value-field-item {
  border-left: 3px solid var(--item-color, #4F46E5);
}

.aggregation-selector {
  margin-bottom: 12px;
}

.quick-aggregations {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: var(--dt-radius-sm);
  border: 1px dashed #e2e8f0;
}

.quick-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-chips :deep(.n-check-tag) {
  padding: 4px 12px;
  border-radius: var(--dt-radius-xl);
  font-size: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.quick-chips :deep(.n-check-tag:hover) {
  background: #e5e7eb;
}

.quick-chips :deep(.n-check-tag--checked) {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* ==================== 筛选区域 ==================== */
.filter-zone {
  flex-shrink: 0;
}

.filter-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-presets .n-tag {
  cursor: pointer;
}

.filter-conditions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-condition-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: var(--dt-radius-md);
  transition: all 0.2s;
  cursor: grab;
}

.filter-condition-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.condition-drag-handle {
  color: #9ca3af;
  cursor: grab;
}

.condition-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.condition-field {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.condition-operator {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: var(--dt-radius-xs);
}

.condition-value {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
}

.condition-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.filter-condition-item:hover .condition-actions {
  opacity: 1;
}

.filter-logic {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.logic-label {
  font-size: 12px;
  color: #6b7280;
}

/* ==================== 右键菜单 ==================== */
.context-menu {
  min-width: 160px;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: #f3f4f6;
}

.context-menu-item.danger {
  color: #ef4444;
}

.context-menu-item.danger:hover {
  background: #fef2f2;
}

.context-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

/* ==================== 字段选择器 ==================== */
.filter-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-list {
  max-height: 400px;
  overflow-y: auto;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--dt-radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.selector-item:hover {
  background: #f3f4f6;
}

.selector-icon {
  font-size: 16px;
}

.selector-label {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.selector-type {
  font-size: 11px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: var(--dt-radius-xs);
}

/* ==================== 结果预览面板 ==================== */
.result-preview-panel {
  background: white;
  border-radius: var(--dt-radius-lg);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-height: 400px;
  flex: 1;
}

.result-preview-panel .panel-header {
  padding: 12px 16px;
}

.view-switcher {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.view-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--dt-radius-sm);
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-btn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.result-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.result-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex: 1;
  color: #6b7280;
}

.loading-spinner {
  width: 48px;
  height: 48px;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 40px;
}

.empty-illustration {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
}

.result-empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

.result-empty p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px;
}

.empty-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: var(--dt-radius-lg);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.tip-item svg {
  color: var(--dt-color-primary);
}

.result-data {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.result-summary {
  display: flex;
  gap: var(--dt-space-4);
  padding: var(--dt-space-3) var(--dt-space-4);
  background: var(--dt-gray-50);
  border-bottom: 1px solid var(--dt-color-border);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
}

.summary-label {
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-secondary);
}

.summary-value {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
}

.result-table {
  flex: 1;
  overflow: auto;
}

/* 透视表样式 */
.pivot-table :deep(.n-data-table-th) {
  background: #f3f4f6 !important;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
}

.pivot-table :deep(.n-data-table-thead .n-data-table-th) {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
}

.pivot-table :deep(.n-data-table-tbody .n-data-table-th) {
  background: #fff !important;
  font-weight: normal;
  color: #111827;
}

.pivot-table :deep(td) {
  text-align: right;
}

.result-chart {
  flex: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* ==================== 模板库 ==================== */
.template-library {
  padding: 20px;
}

.library-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.library-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: var(--dt-radius-2xl);
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  transition: all 0.2s;
}

.library-tab:hover {
  background: #e5e7eb;
}

.library-tab.active {
  background: #3b82f6;
  color: white;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.template-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: var(--dt-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.template-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.template-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tpl-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--dt-radius-xs);
  font-weight: 600;
}

.tpl-category {
  font-size: 11px;
  color: #6b7280;
  margin-left: auto;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px;
}

.card-desc {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 12px;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* ==================== 过渡动画 ==================== */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

.field-list-enter-active,
.field-list-leave-active {
  transition: all 0.2s ease;
}

.field-list-enter-from,
.field-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 1400px) {
  .field-pool-panel {
    width: 220px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .field-pool-panel {
    width: 100%;
    max-height: 200px;
  }

  .config-result-container {
    width: 100%;
  }

  .result-preview-panel {
    min-height: 400px;
  }
}

/* 配置区头部 */
.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px;
}

.config-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--dt-color-text-primary);
  margin: 0;
}

.config-title svg {
  color: var(--fp-tag-row-text);
}

.config-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 重置按钮 */
.btn-reset {
  height: 32px;
  padding: 0 12px;
  border: 1.5px solid var(--fp-border) !important;
  border-radius: 6px;
  background: #fff;
  color: var(--fp-text-secondary);
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 120ms ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-reset:hover {
  border-color: var(--fp-text-muted) !important;
  color: var(--fp-text-main);
  background: var(--fp-bg-hover);
}

/* 执行分析按钮 */
.btn-execute {
  height: 32px;
  padding: 0 14px;
  border: none !important;
  border-radius: 6px;
  background: var(--fp-tag-row-text) !important;
  color: #fff !important;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 120ms ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
}

.btn-execute:hover {
  background: #1D4ED8 !important;
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.35);
}

.btn-execute svg {
  color: #fff !important;
}
</style>
