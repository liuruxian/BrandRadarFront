// IDC 市场探索视图 - 严格按需求文档实现
// 更新时间: 2026-04-10
// 功能: 多维透视分析、拖拽配置、26个预设模板、30个统计量、激光/喷墨双品类适配
<template>
  <div class="idc-explore-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-title">
          <h1>市场探索</h1>
          <p class="page-desc">拖拽字段、组合维度、自由透视分析</p>
        </div>
      </div>
      <div class="header-right">
        <n-button @click="handleShowFilters" class="header-btn">
          <template #icon>
            <IconFilter />
          </template>
          筛选条件
          <n-badge v-if="activeFiltersCount > 0" :value="activeFiltersCount" type="info" class="filter-badge" />
        </n-button>
        <n-button @click="handleResetAll" class="header-btn">
          <template #icon>
            <IconRefresh />
          </template>
          重置
        </n-button>
      </div>
    </div>

    <!-- 品类选择卡片 -->
    <div class="category-card">
      <div class="category-section">
        <div class="section-label">
          <IconTarget class="label-icon" />
          <span>分析品类</span>
        </div>
        <div class="category-tabs">
          <button
            v-for="cat in categoryOptions"
            :key="cat.value"
            class="category-tab"
            :class="{ active: currentCategory === cat.value }"
            :style="currentCategory === cat.value ? { '--active-color': cat.color } : {}"
            @click="handleCategoryChange(cat.value)"
          >
            <span class="cat-icon" :style="{ background: cat.color }">{{ cat.icon }}</span>
            <span class="cat-label">{{ cat.label }}</span>
            <span v-if="currentCategory === cat.value" class="active-indicator" />
          </button>
        </div>
      </div>

      <div class="divider" />

      <!-- 快速模板 -->
      <div class="template-section">
        <div class="section-label">
          <IconTemplate class="label-icon" />
          <span>快速模板</span>
        </div>
        <div class="template-scroll">
          <button
            v-for="tpl in filteredQuickTemplates"
            :key="tpl.id"
            class="template-chip"
            :class="{ active: activeTemplateId === tpl.id }"
            @click="handleApplyTemplate(tpl)"
          >
            <span class="tpl-badge" :class="getTemplateBadgeClass(tpl)">{{ getTemplateBadgeText(tpl) }}</span>
            <span class="tpl-name">{{ tpl.name }}</span>
          </button>
        </div>
        <n-button text type="primary" size="small" class="more-templates-btn" @click="showTemplateLibrary = true">
          <template #icon>
            <IconChevronRight />
          </template>
          更多模板
        </n-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧：字段池 -->
      <div class="field-pool-panel" :class="{ collapsed: fieldPoolCollapsed }">
        <div class="panel-header" @click="fieldPoolCollapsed = !fieldPoolCollapsed">
          <span class="panel-title">
            <IconDatabase />
            字段池
          </span>
          <n-badge :value="availableFields.length" type="info" />
          <IconChevronLeft class="collapse-icon" :class="{ rotated: fieldPoolCollapsed }" />
        </div>

        <div v-if="!fieldPoolCollapsed" class="field-list">
          <!-- 搜索框 -->
          <div class="field-search">
            <n-input
              v-model:value="fieldSearchKeyword"
              placeholder="搜索字段..."
              clearable
              size="small"
            >
              <template #prefix>
                <IconSearch />
              </template>
            </n-input>
          </div>

          <!-- 字段分类 -->
          <div v-for="group in filteredFieldGroups" :key="group.name" class="field-group">
            <div class="group-header" @click="toggleGroup(group.name)">
              <span class="group-icon">{{ group.icon }}</span>
              <span class="group-name">{{ group.name }}</span>
              <span class="group-count">{{ group.fields.length }}</span>
              <IconChevronDown class="group-arrow" :class="{ expanded: expandedGroups.includes(group.name) }" />
            </div>
            <Transition name="slide">
              <div v-if="expandedGroups.includes(group.name)" class="group-fields">
                <div
                  v-for="field in group.fields"
                  :key="field.value"
                  class="field-item"
                  :class="{
                    'is-dragging': draggingField === field.value,
                    'is-used': isFieldUsed(field.value),
                    'is-disabled': isFieldDisabled(field)
                  }"
                  :draggable="!isFieldDisabled(field)"
                  @dragstart="handleFieldDragStart($event, field)"
                  @dragend="handleFieldDragEnd"
                  @click="handleFieldClick(field)"
                >
                  <IconDrag class="drag-handle" />
                  <span class="field-label">{{ field.label }}</span>
                  <n-tooltip trigger="hover" placement="right">
                    <template #trigger>
                      <IconInfo class="field-info" />
                    </template>
                    <div class="field-tooltip">
                      <div class="tooltip-title">{{ field.label }}</div>
                      <div class="tooltip-field">{{ field.value }}</div>
                    </div>
                  </n-tooltip>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 中央：配置画布 -->
      <div class="config-canvas-panel">
        <!-- 配置区域标题 -->
        <div class="config-header">
          <h3 class="config-title">
            <IconSettings />
            透视配置
          </h3>
          <div class="config-actions">
            <n-button size="small" @click="handleResetConfig">
              <template #icon>
                <IconRefresh />
              </template>
              重置
            </n-button>
            <n-button type="primary" size="large" :loading="queryLoading" @click="handleExecuteQuery">
              <template #icon>
                <IconPlay />
              </template>
              执行分析
            </n-button>
          </div>
        </div>

        <!-- 配置区域 -->
        <div class="config-zones">
          <!-- 维度区域行 -->
          <div class="config-zones-row">
            <!-- 行维度区域 -->
            <div
              class="config-zone row-zone"
              :class="{ 'drag-over': dragTarget === 'row', 'has-content': config.rowFields.length > 0 }"
              @dragover.prevent="handleDragOver('row')"
              @dragleave="handleDragLeave"
              @drop="handleDrop('row')"
            >
              <div class="zone-header">
                <span class="zone-title">
                  <IconRows />
                  行维度
                </span>
                <span class="zone-hint">最多3个</span>
              </div>
              <div class="zone-content">
                <div v-if="config.rowFields.length === 0" class="zone-placeholder">
                  <IconPlus />
                  <span>拖拽字段到此处</span>
                </div>
                <div class="zone-fields">
                  <div
                    v-for="(field, idx) in config.rowFields"
                    :key="field.value"
                    class="zone-field-item"
                    :class="{ 'dragging': draggingFieldItem === `row-${field.value}` }"
                    draggable="true"
                    @dragstart="handleFieldItemDragStart($event, 'row', idx)"
                    @dragend="handleFieldItemDragEnd"
                    @dragover.prevent="handleFieldItemDragOver($event, 'row', idx)"
                    @drop="handleFieldItemDrop($event, 'row', idx)"
                    @contextmenu.prevent="handleContextMenu($event, 'row', idx)"
                  >
                    <!-- 展开/折叠图标 -->
                    <button
                      class="field-toggle"
                      :class="{ expanded: expandedRowFields.includes(field.value) }"
                      @click.stop="toggleRowFieldExpand(field.value)"
                      v-if="idx < config.rowFields.length - 1"
                    >
                      <IconChevronRight />
                    </button>
                    <span class="field-indent" v-else />

                    <!-- 层级标识 -->
                    <span class="field-level">{{ idx + 1 }}</span>

                    <!-- 字段信息 -->
                    <span class="field-name">{{ field.label }}</span>
                    <span class="field-source">{{ field.value }}</span>

                    <!-- 操作按钮 -->
                    <div class="field-actions">
                      <button class="field-action-btn" @click.stop="handleSortField('row', idx)" title="排序">
                        <IconSort />
                      </button>
                      <button class="field-action-btn" @click.stop="handleFilterField(field)" title="设为筛选">
                        <IconFilter />
                      </button>
                      <button class="field-action-btn" @click.stop="removeRowField(field.value)" title="删除">
                        <IconClose />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 列维度区域 -->
            <div
              class="config-zone col-zone"
              :class="{ 'drag-over': dragTarget === 'col', 'has-content': config.colFields.length > 0 }"
              @dragover.prevent="handleDragOver('col')"
              @dragleave="handleDragLeave"
              @drop="handleDrop('col')"
            >
              <div class="zone-header">
                <span class="zone-title">
                  <IconColumns />
                  列维度
                </span>
                <span class="zone-hint">可选 (最多2个)</span>
              </div>
              <div class="zone-content">
                <div v-if="config.colFields.length === 0" class="zone-placeholder">
                  <IconPlus />
                  <span>拖拽字段到此处</span>
                </div>
                <div class="zone-fields">
                  <div
                    v-for="(field, idx) in config.colFields"
                    :key="field.value"
                    class="zone-field-item"
                    :class="{ 'dragging': draggingFieldItem === `col-${field.value}` }"
                    draggable="true"
                    @dragstart="handleFieldItemDragStart($event, 'col', idx)"
                    @dragend="handleFieldItemDragEnd"
                    @dragover.prevent="handleFieldItemDragOver($event, 'col', idx)"
                    @drop="handleFieldItemDrop($event, 'col', idx)"
                    @contextmenu.prevent="handleContextMenu($event, 'col', idx)"
                  >
                    <span class="field-indent" />

                    <span class="field-level">{{ idx + 1 }}</span>
                    <span class="field-name">{{ field.label }}</span>
                    <span class="field-source">{{ field.value }}</span>

                    <div class="field-actions">
                      <button class="field-action-btn" @click.stop="handleSortField('col', idx)" title="排序">
                        <IconSort />
                      </button>
                      <button class="field-action-btn" @click.stop="handleFilterField(field)" title="设为筛选">
                        <IconFilter />
                      </button>
                      <button class="field-action-btn" @click.stop="removeColField(field.value)" title="删除">
                        <IconClose />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 筛选区域 -->
          <div
            class="config-zone filter-zone"
            :class="{ 'drag-over': dragTarget === 'filter', 'has-content': filterConditions.length > 0 }"
            @dragover.prevent="handleDragOver('filter')"
            @dragleave="handleDragLeave"
            @drop="handleDrop('filter')"
          >
            <div class="zone-header">
              <span class="zone-title">
                <IconFilterSmall />
                筛选条件
              </span>
              <n-button size="tiny" @click="showFilterSelector = true">
                <template #icon>
                  <IconPlus />
                </template>
                添加条件
              </n-button>
            </div>
            <div class="zone-content">
              <!-- 预设模板快捷按钮 -->
              <div class="filter-presets">
                <n-tag
                  v-for="preset in filterPresets"
                  :key="preset.id"
                  :checkable="true"
                  :checked="isPresetActive(preset.id)"
                  @click="toggleFilterPreset(preset)"
                  size="small"
                >
                  {{ preset.name }}
                </n-tag>
              </div>

              <!-- 条件列表 -->
              <div v-if="filterConditions.length === 0" class="zone-placeholder">
                <IconFilterSmall />
                <span>拖拽字段或点击添加</span>
              </div>
              <div class="filter-conditions">
                <div
                  v-for="(cond, idx) in filterConditions"
                  :key="cond.id"
                  class="filter-condition-item"
                  draggable="true"
                  @dragstart="handleConditionDragStart($event, idx)"
                  @dragend="handleConditionDragEnd"
                  @dragover.prevent="handleConditionDragOver($event, idx)"
                  @drop="handleConditionDrop($event, idx)"
                >
                  <div class="condition-drag-handle">
                    <IconDrag />
                  </div>
                  <div class="condition-content">
                    <span class="condition-field">{{ cond.fieldLabel }}</span>
                    <span class="condition-operator">{{ getOperatorLabel(cond.operator) }}</span>
                    <span class="condition-value">{{ getConditionValueText(cond) }}</span>
                  </div>
                  <div class="condition-actions">
                    <button class="field-action-btn" @click="editFilterCondition(cond)" title="编辑">
                      <IconEdit />
                    </button>
                    <button class="field-action-btn" @click="removeFilterCondition(cond.id)" title="删除">
                      <IconClose />
                    </button>
                  </div>
                </div>
              </div>

              <!-- 逻辑关系 -->
              <div v-if="filterConditions.length > 1" class="filter-logic">
                <span class="logic-label">条件组合:</span>
                <n-radio-group v-model:value="filterLogic" size="small">
                  <n-radio-button value="AND">AND</n-radio-button>
                  <n-radio-button value="OR">OR</n-radio-button>
                </n-radio-group>
              </div>
            </div>
          </div>

          <!-- 值字段区域 -->
          <div
            class="config-zone value-zone"
            :class="{ 'drag-over': dragTarget === 'value', 'has-content': config.valueFields.length > 0 }"
            @dragover.prevent="handleDragOver('value')"
            @dragleave="handleDragLeave"
            @drop="handleDrop('value')"
          >
            <div class="zone-header">
              <span class="zone-title">
                <IconChart />
                统计量
              </span>
              <span class="zone-hint">选择度量指标</span>
            </div>
            <div class="zone-content">
              <!-- 快捷统计量 -->
              <div class="quick-aggregations">
                <span class="quick-label">快捷选择:</span>
                <div class="quick-chips">
                  <n-tag
                    v-for="agg in quickAggregations"
                    :key="agg.value"
                    :checkable="true"
                    :checked="isAggregationSelected(agg.value)"
                    @click="toggleAggregation(agg.value)"
                  >
                    {{ agg.label }}
                  </n-tag>
                </div>
              </div>

              <!-- 统计量选择器 -->
              <div class="aggregation-selector">
                <n-select
                  v-model:value="selectedAggregation"
                  :options="aggregationOptions"
                  placeholder="选择统计量"
                  filterable
                  clearable
                  @update:value="handleAddAggregation"
                />
              </div>

              <!-- 已选统计量 -->
              <div v-if="config.valueFields.length > 0" class="zone-fields value-fields">
                <TransitionGroup name="field-list" tag="div">
                  <div
                    v-for="(field, idx) in config.valueFields"
                    :key="field.aggregation"
                    class="zone-field-item value-field-item"
                    :style="{ '--item-color': valueColors[idx % valueColors.length] }"
                  >
                    <span class="field-icon">📈</span>
                    <span class="field-name">{{ getAggregationLabel(field.aggregation) }}</span>
                    <span class="field-format">{{ getFormatLabel(field.format) }}</span>
                    <!-- 设置按钮 -->
                    <button class="field-action-btn" @click.stop="openValueConfig(field)" title="配置">
                      <IconSettings />
                    </button>
                    <button class="field-action-btn" @click.stop="removeValueField(field.aggregation)" title="删除">
                      <IconClose />
                    </button>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="save-section">
          <n-button @click="handleSaveAsTemplate" :disabled="config.rowFields.length === 0">
            <template #icon>
              <IconSave />
            </template>
            保存为模板
          </n-button>
        </div>
      </div>

      <!-- 右侧：结果预览 -->
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
            </div>

            <!-- 表格视图 -->
            <div v-if="currentView === 'table'" class="result-table">
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
import { ref, computed, reactive, h, onMounted, watch } from 'vue'
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
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcMockApi as idcApi } from '@/api/idcMockApi'
import {
  mockAdvancedTemplates,
  aggregationDefinitions,
  getValueFieldOptions,
  getDefaultValueConfigs,
} from '@/api/idcMockData'
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
const IconSave = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
  h('polyline', { points: '17 21 17 13 7 13 7 21' }),
  h('polyline', { points: '7 3 7 8 15 8' })
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

const message = useMessage()
const idcStore = useIDCStore()
const { filters } = storeToRefs(idcStore)

// ==================== 状态 ====================

// 品类选择
const currentCategory = ref<ProductType>('all')
const categoryOptions = [
  { value: 'all' as ProductType, label: '全品类', icon: '📊', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { value: 'laser' as ProductType, label: '激光打印机', icon: '🔵', color: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' },
  { value: 'inkjet' as ProductType, label: '喷墨打印机', icon: '🔴', color: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)' },
]

// 拖拽状态
const draggingField = ref<string | null>(null)
const dragTarget = ref<string | null>(null)

// 字段内部拖拽排序状态
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
const expandedGroups = ref(['时间维度', '地理维度', '厂商维度'])

// 配置状态
interface FieldDef {
  value: PivotDimension
  label: string
  icon?: string
  category?: 'laser' | 'inkjet'
}

const config = reactive({
  rowFields: [] as FieldDef[],
  colFields: [] as FieldDef[],
  valueFields: [] as ValueFieldConfig[],
})

// 已选统计量
const selectedAggregation = ref<AggregationType | null>(null)

// 值字段颜色
const valueColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

// 面板状态
const fieldPoolCollapsed = ref(false)
const showFilterDrawer = ref(false)
const showTemplateLibrary = ref(false)
const showSaveTemplateModal = ref(false)

// 模板
const activeTemplateId = ref<string | null>(null)
const selectedTemplateCategory = ref<TemplateCategoryValue>('all')
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

// 字段分组
interface FieldGroupItem {
  value: PivotDimension
  label: string
  category?: 'laser' | 'inkjet'
}
interface FieldGroup {
  name: string
  icon: string
  fields: FieldGroupItem[]
}

const fieldGroups = computed((): FieldGroup[] => {
  const groups: FieldGroup[] = [
    {
      name: '时间维度',
      icon: '📅',
      fields: [
        { value: 'Year' as PivotDimension, label: 'Year (年份)' },
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

  // 根据品类过滤字段
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

// 过滤后的字段分组
const filteredFieldGroups = computed(() => {
  if (!fieldSearchKeyword.value.trim()) {
    return fieldGroups.value
  }
  const keyword = fieldSearchKeyword.value.toLowerCase()
  return fieldGroups.value
    .map(g => ({
      ...g,
      fields: g.fields.filter(f =>
        f.label.toLowerCase().includes(keyword) ||
        f.value.toLowerCase().includes(keyword)
      ),
    }))
    .filter(g => g.fields.length > 0)
})

// 可用字段
const availableFields = computed(() => {
  return fieldGroups.value.flatMap(g => g.fields)
})

// 统计量选项
const aggregationOptions = computed(() => {
  return getValueFieldOptions().map(a => ({
    value: a.value,
    label: `${a.label} (${a.groupLabel})`,
    group: a.group,
  }))
})

// 筛选预设
const filterPresets = [
  {
    id: 'high_end',
    name: '仅高端机型',
    category: currentCategory.value,
    conditions: [
      { field: 'Production Classification', operator: '!=', value: 'N/A' } as any,
      { field: 'Business Inkjet Detail', operator: 'in', value: ['02', '03'] } as any,
    ],
  },
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

// 快捷统计量
const quickAggregations = computed(() => {
  return [
    { value: 'sum_units' as AggregationType, label: '销量求和' },
    { value: 'sum_value' as AggregationType, label: '销售额' },
    { value: 'asp' as AggregationType, label: 'ASP' },
    { value: 'market_share' as AggregationType, label: '市场份额' },
  ]
})

// 过滤的快速模板
const filteredQuickTemplates = computed(() => {
  return mockAdvancedTemplates.slice(0, 6)
})

// 过滤的模板库
const filteredTemplates = computed(() => {
  if (selectedTemplateCategory.value === 'all') {
    return mockAdvancedTemplates
  }
  return mockAdvancedTemplates.filter(t => t.category === (selectedTemplateCategory.value as TemplateCategory))
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

// 柱状图配置
const barChartOption = computed(() => {
  if (!hasResult.value) return {}
  const data = tableData.value.slice(0, 10)
  const firstKey = tableColumns.value[0]?.key || ''
  const secondKey = tableColumns.value[1]?.key || ''
  const categories = data.map(d => String(d[firstKey] ?? ''))
  const seriesData = data.map(d => Number(d[secondKey] ?? 0))

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: seriesData,
      itemStyle: { color: '#3B82F6' },
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
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: data.map((d, i) => ({
        name: String(d[firstKey] ?? `Item ${i}`),
        value: Number(d[secondKey] ?? 0),
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
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => String(d[firstKey] ?? '')),
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: data.map(d => Number(d[secondKey] ?? 0)),
      smooth: true,
      areaStyle: { opacity: 0.3 },
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
    tooltip: { position: 'top' },
    grid: { left: '3%', right: '10%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.map((_, i) => `X${i + 1}`), splitArea: { show: true } },
    yAxis: { type: 'category', data: data.map(d => String(d[firstKey] ?? '')), splitArea: { show: true } },
    visualMap: { min: 0, max: maxVal || 100, calculable: true, orient: 'vertical', right: 0, top: 'center' },
    series: [{
      type: 'heatmap',
      data: data.map((d, i) => [i, 0, Number(d[secondKey] ?? 0)]),
      label: { show: true },
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
  config.rowFields = config.rowFields.filter(f => {
    const field = availableFields.value.find(af => af.value === f.value)
    return !!field
  })
  config.colFields = config.colFields.filter(f => {
    const field = availableFields.value.find(af => af.value === f.value)
    return !!field
  })
}

/**
 * 切换分组展开状态
 */
function toggleGroup(name: string) {
  const idx = expandedGroups.value.indexOf(name)
  if (idx > -1) {
    expandedGroups.value.splice(idx, 1)
  } else {
    expandedGroups.value.push(name)
  }
}

/**
 * 字段拖拽开始
 */
function handleFieldDragStart(event: DragEvent, field: FieldDef) {
  draggingField.value = field.value
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', JSON.stringify(field))
  }
}

/**
 * 字段拖拽结束
 */
function handleFieldDragEnd() {
  draggingField.value = null
  dragTarget.value = null
}

/**
 * 拖拽悬停
 */
function handleDragOver(target: 'row' | 'col' | 'value' | 'filter') {
  dragTarget.value = target
}

/**
 * 拖拽离开
 */
function handleDragLeave() {
  dragTarget.value = null
}

/**
 * 拖放
 */
function handleDrop(target: 'row' | 'col' | 'value' | 'filter') {
  if (!draggingField.value) return

  const field = availableFields.value.find(f => f.value === draggingField.value)
  if (!field) return

  // 检查是否已使用
  if (isFieldUsed(field.value)) {
    message.warning('该字段已被使用')
    draggingField.value = null
    dragTarget.value = null
    return
  }

  if (target === 'row') {
    if (config.rowFields.length >= 3) {
      message.warning('行维度最多3个')
    } else {
      config.rowFields.push(field)
    }
  } else if (target === 'col') {
    if (config.colFields.length >= 2) {
      message.warning('列维度最多2个')
    } else {
      config.colFields.push(field)
    }
  } else if (target === 'value') {
    message.info('请从统计量选择器中添加值字段')
  } else if (target === 'filter') {
    // 拖拽到筛选区 - 打开条件编辑器
    handleFilterField(field)
  }

  draggingField.value = null
  dragTarget.value = null
}

/**
 * 点击字段（快捷添加）
 */
function handleFieldClick(field: FieldDef) {
  if (isFieldUsed(field.value)) return
  if (isFieldDisabled(field)) return

  if (config.rowFields.length < 3) {
    config.rowFields.push(field)
  } else if (config.colFields.length < 2) {
    config.colFields.push(field)
  }
}

/**
 * 移除行字段
 */
function removeRowField(value: PivotDimension) {
  config.rowFields = config.rowFields.filter(f => f.value !== value)
}

/**
 * 移除列字段
 */
function removeColField(value: PivotDimension) {
  config.colFields = config.colFields.filter(f => f.value !== value)
}

/**
 * 移除值字段
 */
function removeValueField(aggregation: AggregationType) {
  config.valueFields = config.valueFields.filter(f => f.aggregation !== aggregation)
}

/**
 * 字段是否已使用
 */
function isFieldUsed(value: PivotDimension): boolean {
  return (
    config.rowFields.some(f => f.value === value) ||
    config.colFields.some(f => f.value === value)
  )
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
  const agg = aggregationDefinitions.find(a => a.id === aggregation)
  return agg?.name || aggregation
}

/**
 * 是否已选择统计量
 */
function isAggregationSelected(aggregation: AggregationType): boolean {
  return config.valueFields.some(f => f.aggregation === aggregation)
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

  if (config.valueFields.length >= 5) {
    message.warning('值字段最多5个')
    selectedAggregation.value = null
    return
  }

  const aggDef = aggregationDefinitions.find(a => a.id === aggregation)
  if (aggDef) {
    config.valueFields.push({
      aggregation,
      sourceField: aggDef.sourceFields[0] || 'units',
      label: aggDef.name,
      format: aggDef.format || 'number',
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
    if (config.valueFields.length >= 5) {
      message.warning('值字段最多5个')
      return
    }
    const aggDef = aggregationDefinitions.find(a => a.id === aggregation)
    if (aggDef) {
      config.valueFields.push({
        aggregation,
        sourceField: aggDef.sourceFields[0] || 'units',
        label: aggDef.name,
        format: aggDef.format || 'number',
        decimalPlaces: aggDef.decimalPlaces || 0,
      })
    }
  }
}

/**
 * 重置配置
 */
function handleResetConfig() {
  config.rowFields = []
  config.colFields = []
  config.valueFields = []
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
  if (category === 'all') return mockAdvancedTemplates.length
  return mockAdvancedTemplates.filter(t => t.category === category).length
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
  config.rowFields = template.row_fields.map(f => ({
    value: f,
    label: f,
  }))

  // 设置列维度
  config.colFields = template.col_field ? [{
    value: template.col_field,
    label: template.col_field,
  }] : []

  // 设置值字段
  config.valueFields = [...template.value_configs]

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
  if (config.rowFields.length === 0) {
    message.warning('请至少选择一个行维度')
    return
  }

  if (config.valueFields.length === 0) {
    message.warning('请至少选择一个统计量')
    return
  }

  queryLoading.value = true

  try {
    const res = await idcApi.queryAdvancedPivot({
      row_fields: config.rowFields.map(f => f.value),
      col_field: config.colFields[0]?.value,
      value_fields: config.valueFields,
      filters: filters.value,
      page: pagination.page,
      page_size: pagination.pageSize,
    })

    if (res.success && res.data) {
      queryResult.value = res.data.rows
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
  if (config.rowFields.length === 0) {
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
      row_fields: config.rowFields.map(f => f.value),
      col_field: config.colFields[0]?.value,
      value_configs: config.valueFields,
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

  if (format === 'csv') {
    idcApi.exportToCSV(queryResult.value as Record<string, unknown>[], 'IDC_Analysis')
  } else {
    idcApi.exportToExcel(queryResult.value as Record<string, unknown>[], 'IDC_Analysis')
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

  const fields = type === 'row' ? config.rowFields : config.colFields
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
      const field = config.rowFields[index]
      if (field) removeRowField(field.value)
    } else {
      const field = config.colFields[index]
      if (field) removeColField(field.value)
    }
  } else if (action === 'filter') {
    const field = type === 'row' ? config.rowFields[index] : config.colFields[index]
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

  const idx = config.valueFields.findIndex(f => f.aggregation === editingValueConfig.value?.aggregation)
  if (idx > -1) {
    config.valueFields[idx] = {
      ...config.valueFields[idx],
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

onMounted(async () => {
  await idcStore.loadFilterOptions()
})
</script>

<style scoped>
/* ==================== 基础布局 ==================== */
.idc-explore-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  min-height: 100%;
  background: transparent;
}

/* ==================== 页面头部 (IDC统一风格) ==================== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
  overflow: hidden;
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
  border-radius: 8px;
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
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.category-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow:
    0 20px 25px -5px rgba(102, 126, 234, 0.06),
    0 8px 10px -6px rgba(118, 75, 162, 0.04);
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
  border-radius: 12px;
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
  border-color: var(--active-color, #667EEA);
  box-shadow:
    0 4px 12px rgba(102, 126, 234, 0.15),
    0 0 0 1px rgba(102, 126, 234, 0.1);
}

.cat-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
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
  background: var(--active-color, #667EEA);
  border-radius: 3px 3px 0 0;
  box-shadow: 0 -2px 8px rgba(102, 126, 234, 0.3);
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
  border-radius: 24px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.template-chip:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04));
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}
.template-chip.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.08));
  border-color: #667EEA;
}

.tpl-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.tpl-badge.badge-all { background: rgba(102, 126, 234, 0.1); color: #667EEA; }
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
  display: grid;
  grid-template-columns: 260px 1fr 440px;
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ==================== 字段池面板 ==================== */
.field-pool-panel {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
}
.field-pool-panel:hover {
  border-color: rgba(102, 126, 234, 0.15);
  box-shadow:
    0 10px 15px -3px rgba(102, 126, 234, 0.04),
    0 4px 6px -4px rgba(118, 75, 162, 0.02);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
  border-bottom: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
}
.panel-header:hover {
  background: linear-gradient(135deg, #F1F5F9, #E2E8F0);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
  flex: 1;
}

.collapse-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #94A3B8;
}
.collapse-icon.rotated {
  transform: rotate(180deg);
}

.field-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.field-search {
  margin-bottom: 14px;
}

.field-group {
  margin-bottom: 14px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #F1F5F9, #E2E8F0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.group-header:hover {
  background: linear-gradient(135deg, #E2E8F0, #CBD5E1);
}

.group-icon {
  font-size: 14px;
}

.group-name {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex: 1;
}

.group-count {
  font-size: 11px;
  color: #94A3B8;
  background: #ffffff;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.group-arrow {
  transition: transform 0.2s;
  color: #94A3B8;
}
.group-arrow.expanded {
  transform: rotate(180deg);
}

.group-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #FAFBFC;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.field-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04));
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}
.field-item:active {
  cursor: grabbing;
  transform: scale(0.98);
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
  transform: scale(0.95);
}

.drag-handle {
  color: #CBD5E1;
  transition: color 0.2s;
}
.field-item:hover .drag-handle {
  color: #667EEA;
}

.field-label {
  font-size: 13px;
  color: #374151;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.field-info {
  color: #94A3B8;
  opacity: 0;
  transition: opacity 0.2s;
}
.field-item:hover .field-info {
  opacity: 1;
}

.field-tooltip {
  max-width: 200px;
}
.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #0F172A;
}
.tooltip-field {
  font-size: 11px;
  color: #64748B;
}

/* ==================== 配置画布面板 ==================== */
.config-canvas-panel {
  background: #ffffff;
  border-radius: 16px;
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

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #F1F5F9;
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

.config-zones {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.config-zones-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.config-zone {
  background: linear-gradient(135deg, #FAFBFC, #F8FAFC);
  border: 2px dashed #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.config-zone.drag-over {
  border-color: #667EEA;
  border-style: solid;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.06));
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.15);
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
  border-radius: 10px;
  background: #FAFBFC;
  transition: all 0.2s;
}

.config-zone.drag-over .zone-placeholder {
  border-color: #667EEA;
  color: #667EEA;
  background: rgba(102, 126, 234, 0.05);
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
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: grab;
}
.zone-field-item:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
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
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748B;
}
.field-toggle:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667EEA;
}
.field-toggle.expanded {
  transform: rotate(90deg);
  background: rgba(102, 126, 234, 0.15);
  color: #667EEA;
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
  border-radius: 6px;
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s;
}
.field-action-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667EEA;
}

.field-level {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667EEA, #764BA2);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
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
  border-radius: 6px;
}

.field-format {
  font-size: 11px;
  color: #D97706;
  padding: 3px 8px;
  background: #FEF3C7;
  border-radius: 6px;
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
  border-radius: 6px;
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
  border-radius: 6px;
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
  border-radius: 16px;
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
  border-radius: 8px;
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
  border-radius: 4px;
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
  border-radius: 8px;
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
  border-radius: 4px;
}

.save-section {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

/* ==================== 结果预览面板 ==================== */
.result-preview-panel {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  border-radius: 6px;
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
  border-radius: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.tip-item svg {
  color: #3b82f6;
}

.result-data {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.result-summary {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.result-table {
  flex: 1;
  overflow: auto;
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
  border-radius: 20px;
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
  border-radius: 12px;
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
  border-radius: 4px;
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
  .main-content {
    grid-template-columns: 220px 1fr 380px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .field-pool-panel {
    max-height: 200px;
  }

  .result-preview-panel {
    max-height: 400px;
  }
}
</style>
