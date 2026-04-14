<template>
  <n-drawer
    v-model:show="showDrawer"
    :width="480"
    placement="right"
    :mask-closable="true"
    @update:show="(val) => emit('update:visible', val)"
  >
    <n-drawer-content :title="title" closable>
      <template #header>
        <div class="filter-drawer-header">
          <span class="filter-title">{{ title }}</span>
          <div class="header-actions">
            <n-button
              v-if="hasActiveFilters"
              text
              type="warning"
              size="small"
              @click="handleReset"
            >
              重置
            </n-button>
          </div>
        </div>
      </template>

      <n-form
        class="filter-sections"
        :model="localFilters"
        label-placement="top"
        :show-feedback="false"
      >
        <!-- 时间筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">
            <span>时间筛选</span>
          </div>
          <div class="filter-group">
            <n-form-item label="年份" path="years">
              <n-select
                v-model:value="localFilters.years"
                multiple
                :options="yearOptions"
                placeholder="选择年份"
                clearable
                @update:value="(val) => handleFilterChange('years', val)"
              />
            </n-form-item>
            <n-form-item label="半年度" path="halfYears">
              <n-select
                v-model:value="localFilters.half_years"
                multiple
                :options="halfYearOptions"
                placeholder="选择半年度"
                clearable
                @update:value="(val) => handleFilterChange('half_years', val)"
              />
            </n-form-item>
          </div>
        </div>

        <!-- 地理筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">
            <span>地理筛选</span>
          </div>
          <div class="filter-group">
            <n-form-item label="全球区域" path="globalRegions">
              <n-select
                v-model:value="localFilters.global_regions"
                multiple
                :options="globalRegionOptions"
                placeholder="选择全球区域"
                clearable
                @update:value="(val) => handleCascadeFilter('global_regions', val)"
              />
            </n-form-item>
            <n-form-item label="区域" path="regions">
              <n-select
                v-model:value="localFilters.regions"
                multiple
                :options="regionOptions"
                placeholder="选择区域"
                clearable
                :disabled="!localFilters.global_regions?.length"
                @update:value="(val) => handleCascadeFilter('regions', val)"
              />
            </n-form-item>
            <n-form-item label="国家" path="countries">
              <n-select
                v-model:value="localFilters.countries"
                multiple
                :options="countryOptions"
                placeholder="选择国家"
                clearable
                filterable
                :disabled="!localFilters.regions?.length"
                @update:value="(val) => handleFilterChange('countries', val)"
              />
            </n-form-item>
          </div>
        </div>

        <!-- 厂商筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">
            <span>厂商筛选</span>
          </div>
          <div class="filter-group">
            <n-form-item label="公司" path="companies">
              <n-select
                v-model:value="localFilters.companies"
                multiple
                :options="companyOptions"
                placeholder="选择公司"
                clearable
                filterable
                @update:value="(val) => handleFilterChange('companies', val)"
              />
            </n-form-item>
            <n-form-item label="品牌" path="brands">
              <n-select
                v-model:value="localFilters.brands"
                multiple
                :options="brandOptions"
                placeholder="选择品牌"
                clearable
                filterable
                @update:value="(val) => handleFilterChange('brands', val)"
              />
            </n-form-item>
            <n-form-item label="OEM 制造商" path="oems">
              <n-select
                v-model:value="localFilters.oems"
                multiple
                :options="oemOptions"
                placeholder="选择 OEM"
                clearable
                filterable
                @update:value="(val) => handleFilterChange('oems', val)"
              />
            </n-form-item>
          </div>
        </div>

        <!-- 产品筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">
            <span>产品筛选</span>
          </div>

          <!-- 产品类型 Tab（品类快速切换） -->
          <div class="filter-group product-type-tabs">
            <n-tabs
              v-model:value="localProductType"
              type="segment"
              size="small"
              @update:value="handleProductTypeChange"
            >
              <n-tab name="all">全品类</n-tab>
              <n-tab name="laser">激光打印机</n-tab>
              <n-tab name="inkjet">喷墨打印机</n-tab>
            </n-tabs>
          </div>

          <!-- 品类专属筛选（全品类时隐藏） -->
          <div v-if="localProductType === 'laser'" class="filter-group laser-specific">
            <n-form-item label="激光产品细分" path="laser_product_details">
              <n-checkbox-group
                v-model:value="localFilters.laser_product_details"
                @update:value="(val) => handleFilterChange('laser_product_details', val)"
              >
                <n-space vertical>
                  <n-checkbox value="Color Laser">彩色激光 (Color Laser)</n-checkbox>
                  <n-checkbox value="Mono Laser">黑白激光 (Mono Laser)</n-checkbox>
                </n-space>
              </n-checkbox-group>
            </n-form-item>
            <n-form-item label="硒鼓容量" path="toner_capacity_ranges">
              <n-select
                v-model:value="localFilters.toner_capacity_ranges"
                multiple
                :options="tonerCapacityOptions"
                placeholder="选择硒鼓容量"
                clearable
                @update:value="(val) => handleFilterChange('toner_capacity_ranges', val)"
              />
            </n-form-item>
            <n-form-item label="生产级别" path="productionClassifications">
              <n-select
                v-model:value="localFilters.production_classifications"
                multiple
                :options="productionOptions"
                placeholder="选择生产级别"
                clearable
                @update:value="(val) => handleFilterChange('production_classifications', val)"
              />
            </n-form-item>
          </div>

          <div v-if="localProductType === 'inkjet'" class="filter-group inkjet-specific">
            <n-form-item label="喷墨产品细分" path="inkjet_product_details">
              <n-checkbox-group
                v-model:value="localFilters.inkjet_product_details"
                @update:value="(val) => handleFilterChange('inkjet_product_details', val)"
              >
                <n-space vertical>
                  <n-checkbox value="Color Inkjet">彩色喷墨 (Color Inkjet)</n-checkbox>
                  <n-checkbox value="Mono Inkjet">黑白喷墨 (Mono Inkjet)</n-checkbox>
                </n-space>
              </n-checkbox-group>
            </n-form-item>
            <n-form-item label="耗材类型" path="inkTypes">
              <n-select
                v-model:value="localFilters.ink_types"
                multiple
                :options="inkTypeOptions"
                placeholder="选择墨仓类型"
                clearable
                @update:value="(val) => handleFilterChange('ink_types', val)"
              />
            </n-form-item>
            <n-form-item label="商用喷墨级别" path="businessInkjetDetail">
              <n-select
                v-model:value="localFilters.business_inkjet_detail"
                multiple
                :options="businessInkjetDetailOptions"
                placeholder="选择商用喷墨级别"
                clearable
                @update:value="(val) => handleFilterChange('business_inkjet_detail', val)"
              />
            </n-form-item>
          </div>

          <!-- 通用产品筛选 -->
          <div class="filter-group">
            <n-form-item label="产品类别" path="productCategories">
              <n-select
                v-model:value="localFilters.product_categories"
                multiple
                :options="productCategoryOptions"
                placeholder="选择产品类别"
                clearable
                @update:value="(val) => handleFilterChange('product_categories', val)"
              />
            </n-form-item>
            <n-form-item label="产品类型" path="products">
              <n-select
                v-model:value="localFilters.products"
                multiple
                :options="productOptions"
                placeholder="选择产品类型"
                clearable
                filterable
                @update:value="(val) => handleFilterChange('products', val)"
              />
            </n-form-item>
            <n-form-item label="幅面格式" path="formats">
              <n-select
                v-model:value="localFilters.formats"
                multiple
                :options="formatOptions"
                placeholder="选择幅面格式"
                clearable
                @update:value="(val) => handleFilterChange('formats', val)"
              />
            </n-form-item>
            <n-form-item label="速度段 A4" path="speedRangesA4">
              <n-select
                v-model:value="localFilters.speed_ranges_a4"
                multiple
                :options="speedRangeA4Options"
                placeholder="选择速度段 (A4)"
                clearable
                @update:value="(val) => handleFilterChange('speed_ranges_a4', val)"
              />
            </n-form-item>
          </div>

          <!-- 高端机型快捷筛选 -->
          <div class="filter-group high-end-filter">
            <n-checkbox
              v-model:checked="localFilters.high_end_only"
              @update:checked="(val) => handleFilterChange('high_end_only', val)"
            >
              只看高端机型（Production Classification 非空 或 Business Inkjet Detail = '03: High-end'）
            </n-checkbox>
          </div>
        </div>

        <!-- 渠道筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">
            <span>渠道筛选</span>
          </div>
          <div class="filter-group">
            <n-form-item label="渠道" path="channels">
              <n-select
                v-model:value="localFilters.channels"
                multiple
                :options="channelOptions"
                placeholder="选择渠道"
                clearable
                @update:value="(val) => handleFilterChange('channels', val)"
              />
            </n-form-item>
            <n-form-item label="渠道组" path="channelGroups">
              <n-select
                v-model:value="localFilters.channel_groups"
                multiple
                :options="channelGroupOptions"
                placeholder="选择渠道组"
                clearable
                @update:value="(val) => handleFilterChange('channel_groups', val)"
              />
            </n-form-item>
          </div>
        </div>

        <!-- 技术参数筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">
            <span>技术参数筛选</span>
          </div>
          <div class="filter-group">
            <n-form-item label="ADF 自动输稿器" path="adfOptions">
              <n-select
                v-model:value="localFilters.adf_options"
                multiple
                :options="adfOptions"
                placeholder="选择 ADF"
                clearable
                @update:value="(val) => handleFilterChange('adf_options', val)"
              />
            </n-form-item>
            <n-form-item label="双面打印 Duplex" path="duplexOptions">
              <n-select
                v-model:value="localFilters.duplex_options"
                multiple
                :options="duplexOptions"
                placeholder="选择 Duplex"
                clearable
                @update:value="(val) => handleFilterChange('duplex_options', val)"
              />
            </n-form-item>
            <n-form-item label="无线 Wireless" path="wirelessOptions">
              <n-select
                v-model:value="localFilters.wireless_options"
                multiple
                :options="wirelessOptions"
                placeholder="选择 Wireless"
                clearable
                @update:value="(val) => handleFilterChange('wireless_options', val)"
              />
            </n-form-item>
          </div>
        </div>
      </n-form>

      <template #footer>
        <div class="filter-footer">
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleConfirm">应用筛选</n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import {
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NTabs,
  NTab,
  NCheckbox,
  NCheckboxGroup,
  NSpace,
  type SelectOption,
} from 'naive-ui'
import { useIDCStore } from '@/stores/idcStore'
import type { FilterConditions, ProductType } from '@/api/idcApiTypes'

/** 与 idcStore 初始筛选结构一致，避免 v-model 绑定 undefined 导致 Naive 组件异常 */
function createEmptyFilters(): FilterConditions {
  return {
    years: [],
    half_years: [],
    global_regions: [],
    regions: [],
    countries: [],
    companies: [],
    vendors: [],
    brands: [],
    oems: [],
    product_categories: [],
    products: [],
    formats: [],
    speed_ranges_a4: [],
    speed_ranges_letter: [],
    ink_types: [],
    production_classifications: [],
    adf_options: [],
    duplex_options: [],
    network_options: [],
    wireless_options: [],
    channels: [],
    channel_groups: [],
    business_inkjet_detail: [],
    // 品类专属筛选
    product_type: 'all',
    laser_product_details: [],
    toner_capacity_ranges: [],
    inkjet_product_details: [],
    high_end_only: false,
  }
}

interface Props {
  visible: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '筛选条件',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [filters: FilterConditions]
}>()

const idcStore = useIDCStore()

const showDrawer = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 本地筛选条件副本（必须有完整字段，避免 NSelect 等对 undefined 崩溃）
const localFilters = ref<FilterConditions>(createEmptyFilters())

// 本地产品类型状态
const localProductType = ref<ProductType>('all')

// 同步 store 中的筛选条件到本地
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      localFilters.value = {
        ...createEmptyFilters(),
        ...JSON.parse(JSON.stringify(idcStore.filters)),
      }
      localProductType.value = idcStore.productType || 'all'
    }
  }
)

// 计算是否有激活的筛选
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(
    (v) => Array.isArray(v) && v.length > 0
  )
})

// ==================== 选项数据 ====================

// 年份选项
const yearOptions = computed<SelectOption[]>(() => {
  const years = idcStore.filterOptions.years || []
  return years.map((y) => ({ label: `${y}年`, value: y }))
})

// 半年度选项
const halfYearOptions = computed<SelectOption[]>(() => {
  const halfYears = idcStore.filterOptions.half_years || []
  return halfYears.map((h) => ({ label: h, value: h }))
})

// 全球区域选项
const globalRegionOptions = computed<SelectOption[]>(() => {
  const regions = idcStore.filterOptions.global_regions || []
  return regions.map((r) => ({ label: r.label, value: r.value }))
})

// 区域选项（根据全球区域级联）
const regionOptions = computed<SelectOption[]>(() => {
  const regions = idcStore.filterOptions.regions || []
  if (!localFilters.value.global_regions?.length) return []
  return regions.filter((r) =>
    localFilters.value.global_regions?.includes(r.value)
  )
})

// 国家选项（根据区域级联）
const countryOptions = computed<SelectOption[]>(() => {
  const countries = idcStore.filterOptions.countries || []
  if (!localFilters.value.regions?.length) return []
  return countries.filter((c) =>
    localFilters.value.regions?.includes(c.value)
  )
})

// 公司选项
const companyOptions = computed<SelectOption[]>(() => {
  const companies = idcStore.filterOptions.companies || []
  return companies.map((c) => ({ label: c.label, value: c.value }))
})

// 品牌选项
const brandOptions = computed<SelectOption[]>(() => {
  const brands = idcStore.filterOptions.brands || []
  return brands.map((b) => ({ label: b.label, value: b.value }))
})

// OEM 制造商选项
const oemOptions = computed<SelectOption[]>(() => {
  const oems = idcStore.filterOptions.oems || []
  return oems.map((o) => ({ label: o.label, value: o.value }))
})

// 产品类别选项
const productCategoryOptions = computed<SelectOption[]>(() => {
  const categories = idcStore.filterOptions.product_categories || []
  return categories.map((c) => ({ label: c.label, value: c.value }))
})

// 产品选项
const productOptions = computed<SelectOption[]>(() => {
  const products = idcStore.filterOptions.products || []
  if (!localFilters.value.product_categories?.length) return []
  return products.filter((p) =>
    localFilters.value.product_categories?.includes(p.value)
  )
})

// 格式选项
const formatOptions = computed<SelectOption[]>(() => {
  const formats = idcStore.filterOptions.formats || []
  return formats.map((f) => ({ label: f.label, value: f.value }))
})

// 速度段 A4 选项 (Speed Range A4)
const speedRangeA4Options = computed<SelectOption[]>(() => {
  const ranges = idcStore.filterOptions.speed_ranges_a4 || []
  return ranges.map((r) => ({ label: r, value: r }))
})

// 渠道选项
const channelOptions = computed<SelectOption[]>(() => {
  const channels = idcStore.filterOptions.channels || []
  return channels.map((c) => ({ label: c.label, value: c.value }))
})

// 渠道组选项
const channelGroupOptions = computed<SelectOption[]>(() => {
  const groups = idcStore.filterOptions.channel_groups || []
  return groups.map((g) => ({ label: g.label, value: g.value }))
})

// 墨仓类型选项 (Ink Tank/ Ink Cartridge)
const inkTypeOptions = computed<SelectOption[]>(() => {
  const types = idcStore.filterOptions.ink_types || []
  return types.map((t) => ({ label: t.label, value: t.value }))
})

// 生产分类选项 (Production Classification)
const productionOptions = computed<SelectOption[]>(() => {
  const classifications = idcStore.filterOptions.production_classifications || []
  return classifications.map((c) => ({ label: c.label, value: c.value }))
})

// ADF 选项
const adfOptions = computed<SelectOption[]>(() => {
  return (idcStore.filterOptions.adf_options || []).map((o) => ({
    label: o.label,
    value: o.value,
  }))
})

// Duplex 选项
const duplexOptions = computed<SelectOption[]>(() => {
  return (idcStore.filterOptions.duplex_options || []).map((o) => ({
    label: o.label,
    value: o.value,
  }))
})

// Wireless 选项
const wirelessOptions = computed<SelectOption[]>(() => {
  return (idcStore.filterOptions.wireless_options || []).map((o) => ({
    label: o.label,
    value: o.value,
  }))
})

// 商用喷墨级别选项 (Business Inkjet Detail)
const businessInkjetDetailOptions = computed<SelectOption[]>(() => {
  return (idcStore.filterOptions.business_inkjet_detail || []).map((o) => ({
    label: o.label,
    value: o.value,
  }))
})

// 硒鼓容量选项 (激光专属)
const tonerCapacityOptions = computed<SelectOption[]>(() => {
  return (idcStore.filterOptions.toner_capacity_ranges || []).map((o) => ({
    label: o.label,
    value: o.value,
  }))
})

// ==================== 事件处理 ====================

/**
 * 品类类型切换处理
 * 切换时清除品类专属筛选条件
 */
function handleProductTypeChange(type: ProductType) {
  localProductType.value = type
  localFilters.value.product_type = type
  // 清除品类专属筛选
  localFilters.value.laser_product_details = []
  localFilters.value.toner_capacity_ranges = []
  localFilters.value.inkjet_product_details = []
  localFilters.value.production_classifications = []
  localFilters.value.ink_types = []
  localFilters.value.business_inkjet_detail = []
  localFilters.value.high_end_only = false
}

function handleFilterChange(key: keyof FilterConditions, value: unknown) {
  (localFilters.value as Record<string, unknown>)[key] = value
}

function handleCascadeFilter(key: 'global_regions' | 'regions', value: unknown) {
  (localFilters.value as Record<string, unknown>)[key] = value
  // 清除子级筛选
  if (key === 'global_regions') {
    localFilters.value.regions = []
    localFilters.value.countries = []
  } else if (key === 'regions') {
    localFilters.value.countries = []
  }
}

function handleReset() {
  localFilters.value = createEmptyFilters()
}

function handleCancel() {
  showDrawer.value = false
}

function handleConfirm() {
  // 同步品类类型到 store
  idcStore.setProductType(localProductType.value)
  idcStore.filters = JSON.parse(JSON.stringify(toRaw(localFilters.value)))
  idcStore.clearCache()
  emit('confirm', toRaw(localFilters.value))
  showDrawer.value = false
}
</script>

<style scoped>
.filter-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.filter-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 60px;
}

:deep(.n-drawer__body) {
  overflow-y: auto !important;
}

.filter-section {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.filter-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-type-tabs {
  margin-bottom: 12px;
}

.laser-specific,
.inkjet-specific {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid var(--primary-color);
}

.inkjet-specific {
  border-left-color: #13c2c2;
}

.high-end-filter {
  padding: 8px 12px;
  background: #fff7e6;
  border-radius: 6px;
  border-left: 3px solid #faad14;
}

.filter-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
