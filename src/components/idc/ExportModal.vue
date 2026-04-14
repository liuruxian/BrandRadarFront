// 导出弹窗组件 - 简化版
// 更新时间: 2026-04-10
<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="导出数据"
    positive-text="导出"
    negative-text="取消"
    @positive-click="handleExport"
    @negative-click="handleCancel"
  >
    <n-form :model="formData" label-placement="top">
      <n-form-item label="导出格式">
        <n-radio-group v-model:value="formData.format">
          <n-space>
            <n-radio value="csv">CSV</n-radio>
            <n-radio value="excel">Excel</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="文件名">
        <n-input v-model:value="formData.filename" placeholder="输入文件名" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NRadioGroup, NRadio, NSpace, NInput, useMessage } from 'naive-ui'

interface Props {
  visible: boolean
  filename?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  filename: 'IDC_Export',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'export': [format: string]
}>()

const message = useMessage()

const showModal = ref(props.visible)
const formData = ref({
  format: 'excel' as 'csv' | 'excel',
  filename: props.filename,
})

watch(() => props.visible, (val) => {
  showModal.value = val
})

watch(showModal, (val) => {
  emit('update:visible', val)
})

function handleExport() {
  emit('export', formData.value.format)
  message.success(`开始导出 ${formData.value.format.toUpperCase()} 文件...`)
}

function handleCancel() {
  showModal.value = false
}
</script>
