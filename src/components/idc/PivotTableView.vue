// 透视表格视图组件 - 简化版
// 更新时间: 2026-04-10
<template>
  <div class="pivot-table-view">
    <n-data-table
      :columns="tableColumns"
      :data="data"
      :pagination="pagination"
      :max-height="400"
      striped
      size="small"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable } from 'naive-ui'

interface Props {
  data?: Record<string, unknown>[]
  columns?: string[]
  loading?: boolean
  pagination?: { page: number; pageSize: number }
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  pagination: () => ({ page: 1, pageSize: 50 }),
})

const tableColumns = computed(() => {
  if (props.columns && props.columns.length > 0) {
    return props.columns.map((col: string) => ({
      title: col,
      key: col,
      ellipsis: { tooltip: true },
    }))
  }
  if (props.data.length > 0) {
    return Object.keys(props.data[0]).map((key: string) => ({
      title: key,
      key,
      ellipsis: { tooltip: true },
    }))
  }
  return []
})
</script>

<style scoped>
.pivot-table-view {
  width: 100%;
  overflow: auto;
}
</style>