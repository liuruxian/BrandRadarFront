<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">产品数据中心</h2>
        <p class="page-subtitle">浏览和筛选所有品牌的产品数据</p>
      </div>
      <span class="font-mono" style="font-size:13px;color:var(--text-muted)" v-if="meta">
        共 {{ meta.total.toLocaleString() }} 条
      </span>
    </div>

    <!-- 筛选栏 -->
    <div class="card filter-bar" style="margin-bottom:20px">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">品牌</label>
          <select class="select" v-model="filters.brand" @change="onBrandChange">
            <option value="">全部品牌</option>
            <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">国家</label>
          <select class="select" v-model="filters.country">
            <option value="">全部国家</option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <select class="select" v-model="filters.status">
            <option value="">全部状态</option>
            <option value="on_sale">在售</option>
            <option value="discontinued">已下架</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">每页</label>
          <select class="select" v-model.number="filters.page_size">
            <option :value="50">50条</option>
            <option :value="100">100条</option>
            <option :value="200">200条</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" @click="doSearch" :disabled="loading">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            查询
          </button>
          <button class="btn btn-ghost" @click="doReset">重置</button>
        </div>
      </div>
    </div>

    <!-- 桌面端表格 -->
    <div class="card" v-if="!isMobile">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>图片</th><th>品牌</th><th>型号</th><th>SKU</th><th>国家</th><th>价格</th><th>状态</th><th>采集时间</th>
          </tr></thead>
          <tbody v-if="!loading">
            <tr v-for="p in products" :key="p.product_id" class="product-row">
              <td>
                <div class="thumb-wrap"
                  @mouseenter="showPreview($event, getProductImage(p))"
                  @mouseleave="hidePreview"
                >
                  <img v-if="getProductImage(p)" :src="getProductImage(p)" :alt="p.model" class="thumb-img"
                    @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                  <div v-else class="thumb-empty">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                </div>
              </td>
              <td><span class="brand-tag">{{ p.brand }}</span></td>
              <td><a :href="p.url" target="_blank" class="model-link">{{ p.model || '—' }}</a></td>
              <td><span class="font-mono" style="font-size:12px">{{ p.sku }}</span></td>
              <td><span class="country-tag">{{ p.country }}</span></td>
              <td><span class="font-mono price">{{ p.price || '—' }}</span></td>
              <td>
                <span class="badge" :class="p.status === 'on_sale' ? 'badge-green' : 'badge-gray'">
                  {{ p.status === 'on_sale' ? '在售' : '下架' }}
                </span>
              </td>
              <td><span class="font-mono" style="font-size:11px;color:var(--text-muted)">{{ formatTime(p.scraped_at) }}</span></td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">暂无数据，请调整筛选条件</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="i in 8" :key="i">
              <td v-for="j in 8" :key="j"><div class="skeleton" style="height:14px"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 移动端卡片 -->
    <div v-else class="mobile-cards">
      <div v-if="loading">
        <div v-for="i in 4" :key="i" class="card mobile-card">
          <div class="skeleton" style="height:16px;width:60%;margin-bottom:10px"></div>
          <div class="skeleton" style="height:12px;width:40%"></div>
        </div>
      </div>
      <div v-else v-for="p in products" :key="p.product_id" class="card mobile-card">
        <div class="mobile-card-head">
          <span class="brand-tag">{{ p.brand }}</span>
          <span class="badge" :class="p.status === 'on_sale' ? 'badge-green' : 'badge-gray'">
            {{ p.status === 'on_sale' ? '在售' : '下架' }}
          </span>
        </div>
        <div class="mobile-card-body">
          <div class="mobile-thumb-wrap">
            <img v-if="getProductImage(p)" :src="getProductImage(p)" :alt="p.model" class="mobile-thumb"
              @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
            <div v-else class="thumb-empty mobile-thumb">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          </div>
          <div class="mobile-card-content">
            <div class="mobile-card-model">{{ p.model || p.sku }}</div>
            <div class="mobile-card-meta">
              <span class="font-mono">{{ p.sku }}</span>
              <span>{{ p.country }}</span>
              <span class="price font-mono">{{ p.price || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="meta && meta.total_pages > 1">
      <button class="btn btn-ghost" :disabled="filters.page <= 1" @click="goPage(filters.page - 1)">&lt;&lt; 上一页</button>
      <span class="page-info font-mono">{{ filters.page }} / {{ meta.total_pages }}</span>
      <button class="btn btn-ghost" :disabled="filters.page >= meta.total_pages" @click="goPage(filters.page + 1)">下一页 &gt;&gt;</button>
    </div>

    <!-- 全局图片预览浮层 -->
    <teleport to="body">
      <div v-if="previewImg" class="img-preview-float" :style="previewStyle">
        <img :src="previewImg" />
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { formatTime } from '@/utils/format'
import type { Product } from '@/api/types'

function getProductImage(p: Product): string {
  if (p.image) return p.image
  // HP 官方 CDN fallback
  if (p.brand === 'HP' && p.product_id) {
    return `https://ssl-product-images.www8.hp.com/digmedialib/prodimg/knowledgebase/c${p.product_id.padStart(8,'0')}/c${p.product_id.padStart(8,'0')}-825-1hb.png`
  }
  return ''
}

const store = useProductStore()
const products = computed(() => store.products)
const brands = computed(() => store.brands)
const countries = computed(() => store.countries)
const meta = computed(() => store.meta)
const loading = computed(() => store.loading)
const filters = store.filters

const isMobile = ref(window.innerWidth < 768)
const onResize = () => { isMobile.value = window.innerWidth < 768 }

// 图片预览浮层
const previewImg = ref('')
const previewStyle = ref({})

function showPreview(e: MouseEvent, img: string) {
  if (!img) return
  previewImg.value = img
  const size = 180
  let x = e.clientX + 16
  let y = e.clientY - size / 2
  if (x + size > window.innerWidth - 10) x = e.clientX - size - 16
  if (y < 10) y = 10
  if (y + size > window.innerHeight - 10) y = window.innerHeight - size - 10
  previewStyle.value = { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px' }
}

function hidePreview() {
  previewImg.value = ''
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  store.fetchBrands()
  store.fetchCountries()
  store.fetchProducts()
})
onUnmounted(() => window.removeEventListener('resize', onResize))

async function onBrandChange() {
  filters.country = undefined
  await store.fetchCountries(filters.brand || undefined)
}

async function doSearch() {
  filters.page = 1
  await store.fetchProducts()
}

async function doReset() {
  store.resetFilters()
  await store.fetchBrands()
  await store.fetchCountries()
  await store.fetchProducts()
}

async function goPage(p: number) {
  filters.page = p
  await store.fetchProducts()
}
</script>

<style scoped>
.filter-bar { padding: 16px 20px; }
.filter-row { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 5px; min-width: 140px; flex: 1; }
.filter-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
.filter-actions { display: flex; gap: 8px; align-items: flex-end; padding-bottom: 0; }

.table-wrap { overflow-x: auto; overflow-y: visible; }

.data-table { overflow: visible; }

.brand-tag {
  padding: 2px 8px;
  background: var(--accent-glow);
  color: var(--accent);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono);
}
.country-tag {
  padding: 2px 7px;
  background: rgba(167,139,250,0.1);
  color: #a78bfa;
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
}
.model-link {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s;
}
.model-link:hover { color: var(--accent); text-decoration: underline; }
.price { color: var(--amber); font-size: 13px; }

.thumb-wrap {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.thumb-img {
  width: 56px; height: 56px;
  object-fit: contain;
  border-radius: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  cursor: zoom-in;
  transition: opacity 0.15s;
}
.thumb-img:hover { opacity: 0.75; }

.thumb-empty {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
}

.img-preview-float {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  background: var(--bg-card);
  border: 1px solid rgba(0,212,255,0.4);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.85), 0 0 20px rgba(0,212,255,0.15);
  animation: scaleIn 0.15s var(--ease-out);
}
.img-preview-float img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

.mobile-cards { display: flex; flex-direction: column; gap: 10px; }
.mobile-card { padding: 14px 16px; }
.mobile-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.mobile-card-body { display: flex; gap: 12px; align-items: flex-start; }
.mobile-thumb-wrap { flex-shrink: 0; }
.mobile-thumb {
  width: 64px; height: 64px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.mobile-card-content { flex: 1; min-width: 0; }
.mobile-card-model { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.mobile-card-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding: 8px 0;
}
.page-info { font-size: 13px; color: var(--text-secondary); min-width: 60px; text-align: center; }
</style>
