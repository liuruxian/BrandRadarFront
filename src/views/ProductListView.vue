<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">产品中心</h2>
        <p class="page-subtitle">浏览和筛选所有品牌产品数据<span class="font-mono" style="color:var(--accent);margin-left:8px" v-if="meta">{{ meta.total.toLocaleString() }} 条</span></p>
      </div>
    </div>

    <div class="card filter-bar" style="margin-bottom:16px">
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
          <button class="btn btn-primary" @click="doSearch" :disabled="loading">查询</button>
          <button class="btn btn-ghost" @click="doReset">重置</button>
        </div>
      </div>
    </div>

    <div class="card" v-if="!isMobile">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>图片</th><th>品牌</th><th>型号</th><th>国家</th><th>价格</th><th>状态</th><th>采集时间</th>
          </tr></thead>
          <tbody v-if="!loading">
            <tr v-for="p in products" :key="p.product_id" class="product-row">
              <td>
                <div class="thumb-wrap" @mouseenter="showPreview($event,getProductImage(p))" @mouseleave="hidePreview">
                  <img v-if="getProductImage(p)" :src="getProductImage(p)" :alt="p.model" class="thumb-img" @error="(e)=>(e.target as HTMLImageElement).style.display='none'"/>
                  <div v-else class="thumb-empty"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/></svg></div>
                </div>
              </td>
              <td><span class="brand-chip">{{ p.brand }}</span></td>
              <td><a :href="p.url" target="_blank" class="model-link">{{ p.model||'—' }}</a></td>
              <td>{{ p.country }}</td>
              <td><span class="font-mono price-val">{{ p.price||'—' }}</span></td>
              <td><span class="status-tag" :class="p.status==='on_sale'?'tag-on':'tag-off'">{{ p.status==='on_sale'?'在售':'已下架' }}</span></td>
              <td><span class="font-mono ts">{{ formatTime(p.scraped_at) }}</span></td>
            </tr>
            <tr v-if="products.length===0"><td colspan="7" class="empty-row">暂无数据，请调整筛选条件</td></tr>
          </tbody>
          <tbody v-else><tr v-for="i in 8" :key="i"><td v-for="j in 7" :key="j"><div class="skeleton" style="height:13px"></div></td></tr></tbody>
        </table>
      </div>
    </div>

    <div v-else class="mobile-cards">
      <div v-if="loading"><div v-for="i in 4" :key="i" class="card mobile-card"><div class="skeleton" style="height:14px;width:55%;margin-bottom:8px"></div></div></div>
      <div v-else v-for="p in products" :key="p.product_id" class="card mobile-card">
        <div class="mobile-head"><span class="brand-chip">{{ p.brand }}</span><span class="badge" :class="p.status==='on_sale'?'badge-green':'badge-gray'">{{ p.status==='on_sale'?'在售':'下架' }}</span></div>
        <div class="mobile-body">
          <img v-if="getProductImage(p)" :src="getProductImage(p)" class="mobile-thumb" @error="(e)=>(e.target as HTMLImageElement).style.display='none'"/>
          <div class="mobile-info">
            <div class="mobile-model">{{ p.model||p.sku }}</div>
            <div class="mobile-meta"><span class="font-mono">{{ p.sku }}</span><span>{{ p.country }}</span><span class="font-mono price-val">{{ p.price||'—' }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="meta&&meta.total_pages>1">
      <button class="btn btn-ghost" :disabled="filters.page<=1" @click="goPage(filters.page-1)">上一页</button>
      <span class="page-info font-mono">{{ filters.page }} / {{ meta.total_pages }}</span>
      <button class="btn btn-ghost" :disabled="filters.page>=meta.total_pages" @click="goPage(filters.page+1)">下一页</button>
    </div>

    <teleport to="body">
      <div v-if="previewImg" class="img-preview-float" :style="previewStyle"><img :src="previewImg"/></div>
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
  if (p.brand === 'HP' && p.product_id)
    return `https://ssl-product-images.www8.hp.com/digmedialib/prodimg/knowledgebase/c${p.product_id.padStart(8,'0')}/c${p.product_id.padStart(8,'0')}-825-1hb.png`
  return ''
}

const store    = useProductStore()
const products = computed(() => store.products)
const brands   = computed(() => store.brands)
const countries= computed(() => store.countries)
const meta     = computed(() => store.meta)
const loading  = computed(() => store.loading)
const filters  = store.filters

const isMobile   = ref(window.innerWidth < 768)
const onResize   = () => { isMobile.value = window.innerWidth < 768 }
const previewImg   = ref('')
const previewStyle = ref({})

function showPreview(e: MouseEvent, img: string) {
  if (!img) return
  previewImg.value = img
  const size = 180
  let x = e.clientX + 16, y = e.clientY - size/2
  if (x + size > window.innerWidth - 10) x = e.clientX - size - 16
  if (y < 10) y = 10
  if (y + size > window.innerHeight - 10) y = window.innerHeight - size - 10
  previewStyle.value = { left:x+'px', top:y+'px', width:size+'px', height:size+'px' }
}
function hidePreview() { previewImg.value = '' }

onMounted(() => {
  window.addEventListener('resize', onResize)
  store.fetchBrands(); store.fetchCountries(); store.fetchProducts()
})
onUnmounted(() => window.removeEventListener('resize', onResize))

async function onBrandChange() { filters.country = undefined; await store.fetchCountries(filters.brand || undefined) }
async function doSearch() { filters.page = 1; await store.fetchProducts() }
async function doReset() { store.resetFilters(); await store.fetchBrands(); await store.fetchCountries(); await store.fetchProducts() }
async function goPage(p: number) { filters.page = p; await store.fetchProducts() }
</script>

<style scoped>
.filter-bar { padding:16px 20px; }
.filter-row { display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap; }
.filter-item { display:flex; flex-direction:column; gap:5px; min-width:130px; flex:1; }
.filter-label { font-size:11px; color:var(--text-muted); letter-spacing:.04em; font-weight:500; }
.filter-actions { display:flex; gap:8px; align-items:flex-end; }
.table-wrap { overflow-x:auto; }
.product-row { animation:fadeInRow .25s var(--ease-out) both; }
@keyframes fadeInRow { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
.brand-chip { padding:2px 8px; background:rgba(0,196,204,.1); color:#00AAB1; border:1px solid rgba(0,196,204,.3); border-radius:999px; font-size:11px; font-weight:600; }
.region-chip { padding:2px 8px; background:var(--cyan-glow); color:var(--cyan); border:1px solid rgba(34,211,238,.35); border-radius:999px; font-size:11px; }
.model-link { color:var(--text-primary); text-decoration:none; font-size:13px; transition:color .15s; }
.model-link:hover { color:var(--accent-medical-1); }
.sku { font-size:11px; color:var(--text-muted); }
.price-val { color:#00AAB1; font-size:13px; font-weight:600; }
.ts { font-size:11px; color:var(--text-muted); }
.thumb-wrap { width:48px; height:48px; display:flex; align-items:center; justify-content:center; }
.thumb-img { width:48px; height:48px; object-fit:contain; border:1px solid var(--border); background:rgba(255,255,255,.04); border-radius:8px; cursor:zoom-in; transition:opacity .15s, transform .15s; }
.thumb-img:hover { opacity:.86; transform:scale(1.03); }
.thumb-empty { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:8px; color:var(--text-muted); }
.img-preview-float { position:fixed; z-index:99999; pointer-events:none; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:14px; padding:6px; box-shadow:0 20px 60px rgba(0,0,0,0.55),var(--shadow-glow-accent); animation:scaleIn .15s var(--ease-elastic); }
.img-preview-float img { width:100%; height:100%; object-fit:contain; display:block; border-radius:10px; }
@keyframes scaleIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
.mobile-cards { display:flex; flex-direction:column; gap:10px; }
.mobile-card { padding:14px 16px; }
.mobile-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.mobile-body { display:flex; gap:12px; align-items:flex-start; }
.mobile-thumb { width:60px; height:60px; object-fit:contain; border:1px solid var(--border); background:rgba(255,255,255,.04); border-radius:8px; }
.mobile-info { flex:1; min-width:0; }
.mobile-model { font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:5px; }
.mobile-meta { display:flex; gap:10px; font-size:11px; color:var(--text-muted); flex-wrap:wrap; }
.pagination { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:18px; }
.page-info { font-size:12px; color:var(--text-secondary); min-width:60px; text-align:center; }
.empty-row { text-align:center; padding:48px; color:var(--text-muted); font-size:13px; }
.status-tag { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; letter-spacing:.02em; border:1px solid transparent; }
.tag-on  { background:rgba(16,185,129,.18); color:#6EE7B7; border-color:rgba(16,185,129,.35); }
.tag-off { background:rgba(148,163,184,.12); color:#CBD5E1; border-color:rgba(148,163,184,.26); }
.country-text { font-size:13px; color:var(--text-secondary); }
</style>
