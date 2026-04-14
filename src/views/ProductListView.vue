<template>
  <div class="page-container">
    <!-- 页面头部 - IDC风格 -->
    <div class="page-header idc-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
            <polyline points="7.5 19.79 7.5 14.6 3 12"/>
            <polyline points="21 12 16.5 14.6 16.5 19.79"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>产品中心</h1>
          <p class="header-desc">
            浏览和筛选所有品牌产品数据
            <span v-if="meta" class="header-count">{{ meta.total.toLocaleString() }} 条</span>
          </p>
        </div>
      </div>
    </div>

    <div class="card filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">品牌</label>
          <select
            v-model="filters.brand"
            class="select"
            @change="onBrandChange"
          >
            <option value="">全部品牌</option>
            <option
              v-for="b in brands"
              :key="b"
              :value="b"
            >{{ b }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">国家</label>
          <select v-model="filters.country" class="select">
            <option value="">全部国家</option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <select v-model="filters.status" class="select">
            <option value="">全部状态</option>
            <option value="on_sale">在售</option>
            <option value="discontinued">已下架</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">每页</label>
          <select v-model.number="filters.page_size" class="select">
            <option :value="50">50条</option>
            <option :value="100">100条</option>
            <option :value="200">200条</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn btn-idc-primary" :disabled="loading" @click="doSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            查询
          </button>
          <button class="btn btn-idc-ghost" @click="doReset">重置</button>
        </div>
      </div>
    </div>

    <div
      v-if="!isMobile"
      class="card"
    >
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>图片</th><th>品牌</th><th>型号</th><th>国家</th><th>价格</th><th>状态</th><th>采集时间</th>
            </tr>
          </thead>
          <tbody v-if="!loading">
            <tr
              v-for="p in products"
              :key="p.product_id"
              class="product-row"
            >
              <td>
                <div
                  class="thumb-wrap"
                  @mouseenter="showPreview($event,getProductImage(p))"
                  @mouseleave="hidePreview"
                >
                  <img
                    v-if="getProductImage(p)"
                    :src="getProductImage(p)"
                    :alt="p.model"
                    class="thumb-img"
                    @error="(e)=>(e.target as HTMLImageElement).style.display='none'"
                  >
                  <div
                    v-else
                    class="thumb-empty"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    ><rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="1"
                    /></svg>
                  </div>
                </div>
              </td>
              <td><span class="brand-chip">{{ p.brand }}</span></td>
              <td>
                <a
                  :href="p.url"
                  target="_blank"
                  class="model-link"
                >{{ p.model||'—' }}</a>
              </td>
              <td>{{ p.country }}</td>
              <td><span class="font-mono price-val">{{ p.price||'—' }}</span></td>
              <td>
                <span
                  class="status-tag"
                  :class="p.status==='on_sale'?'tag-on':'tag-off'"
                >{{ p.status==='on_sale'?'在售':'已下架' }}</span>
              </td>
              <td><span class="font-mono ts">{{ formatTime(p.scraped_at) }}</span></td>
            </tr>
            <tr v-if="products.length===0">
              <td
                colspan="7"
                class="empty-row"
              >
                暂无数据，请调整筛选条件
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr
              v-for="i in 8"
              :key="i"
            >
              <td
                v-for="j in 7"
                :key="j"
              >
                <div
                  class="skeleton"
                  style="height:13px"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-else
      class="mobile-cards"
    >
      <div v-if="loading">
        <div
          v-for="i in 4"
          :key="i"
          class="card mobile-card"
        >
          <div
            class="skeleton"
            style="height:14px;width:55%;margin-bottom:8px"
          />
        </div>
      </div>
      <div
        v-for="p in products"
        v-else
        :key="p.product_id"
        class="card mobile-card"
      >
        <div class="mobile-head">
          <span class="brand-chip">{{ p.brand }}</span><span
            class="badge"
            :class="p.status==='on_sale'?'badge-green':'badge-gray'"
          >{{ p.status==='on_sale'?'在售':'下架' }}</span>
        </div>
        <div class="mobile-body">
          <img
            v-if="getProductImage(p)"
            :src="getProductImage(p)"
            class="mobile-thumb"
            @error="(e)=>(e.target as HTMLImageElement).style.display='none'"
          >
          <div class="mobile-info">
            <div class="mobile-model">
              {{ p.model||p.sku }}
            </div>
            <div class="mobile-meta">
              <span class="font-mono">{{ p.sku }}</span><span>{{ p.country }}</span><span class="font-mono price-val">{{ p.price||'—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="meta&&meta.total_pages>1"
      class="pagination"
    >
      <button
        class="btn btn-ghost"
        :disabled="filters.page<=1"
        @click="goPage(filters.page-1)"
      >
        上一页
      </button>
      <span class="page-info font-mono">{{ filters.page }} / {{ meta.total_pages }}</span>
      <button
        class="btn btn-ghost"
        :disabled="filters.page>=meta.total_pages"
        @click="goPage(filters.page+1)"
      >
        下一页
      </button>
    </div>

    <teleport to="body">
      <div
        v-if="previewImg"
        class="img-preview-float"
        :style="previewStyle"
      >
        <img :src="previewImg">
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
.page-container { display: flex; flex-direction: column; gap: 20px; padding: 0; }

.idc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
}
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
}
.header-title h1 { font-size: 22px; font-weight: 700; color: white; margin: 0; line-height: 1.2; }
.header-desc { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 4px 0 0; }
.header-count { font-family: var(--font-mono); background: rgba(255, 255, 255, 0.2); padding: 2px 8px; border-radius: 999px; font-size: 12px; margin-left: 8px; }

/* 按钮 */
.btn-idc-primary { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--gradient-primary); border: none; border-radius: 8px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-idc-primary:hover:not(:disabled) { background: var(--gradient-primary-hover); }
.btn-idc-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-idc-ghost { padding: 8px 16px; background: transparent; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; color: white; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
.btn-idc-ghost:hover { background: rgba(255, 255, 255, 0.2); }

/* 筛选栏（继承全局 .filter-bar） */
.filter-actions { display: flex; gap: 8px; align-items: flex-end; }

.table-wrap { overflow-x: auto; }
.product-row { animation: fadeInRow 0.25s var(--ease-out) both; }
@keyframes fadeInRow { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }

/* 品牌标签 - IDC风格 */
.brand-chip { display: inline-flex; align-items: center; padding: 2px 10px; background: rgba(59, 130, 246, 0.1); color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 999px; font-size: 11px; font-weight: 600; }
.region-chip { padding: 2px 8px; background: rgba(59, 130, 246, 0.1); color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 999px; font-size: 11px; }
.model-link { color: #111827; text-decoration: none; font-size: 13px; transition: color 0.15s; }
.model-link:hover { color: #3B82F6; }
.sku { font-size: 11px; color: #6b7280; }
.price-val { color: #3B82F6; font-size: 13px; font-weight: 600; }
.ts { font-size: 11px; color: #6b7280; }
.thumb-wrap { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
.thumb-img { width: 48px; height: 48px; object-fit: contain; border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 8px; cursor: zoom-in; transition: opacity 0.15s, transform 0.15s; }
.thumb-img:hover { opacity: 0.86; transform: scale(1.03); }
.thumb-empty { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; color: #6b7280; }
.img-preview-float { position: fixed; z-index: 99999; pointer-events: none; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; padding: 6px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); animation: scaleIn 0.15s var(--ease-elastic); }
.img-preview-float img { width: 100%; height: 100%; object-fit: contain; display: block; border-radius: 10px; }
@keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
.mobile-cards { display: flex; flex-direction: column; gap: 10px; }
.mobile-card { padding: 14px 16px; border-radius: 16px; transition: all 0.2s ease; }
.mobile-card:hover { border-color: #d1d5db; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.mobile-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.mobile-body { display: flex; gap: 12px; align-items: flex-start; }
.mobile-thumb { width: 60px; height: 60px; object-fit: contain; border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 8px; }
.mobile-info { flex: 1; min-width: 0; }
.mobile-model { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 5px; }
.mobile-meta { display: flex; gap: 10px; font-size: 11px; color: #6b7280; flex-wrap: wrap; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.page-info { font-size: 12px; color: #6b7280; min-width: 60px; text-align: center; }
.empty-row { text-align: center; padding: 48px; color: var(--text-tertiary); font-size: 13px; }

/* 状态标签 - IDC风格 */
.status-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; border: 1px solid transparent; }
.tag-on { background: rgba(16, 185, 129, 0.1); color: #10B981; border-color: rgba(16, 185, 129, 0.3); }
.tag-off { background: rgba(107, 114, 128, 0.1); color: #6b7280; border-color: rgba(107, 114, 128, 0.3); }
.country-text { font-size: 13px; color: #6b7280; }
</style>
