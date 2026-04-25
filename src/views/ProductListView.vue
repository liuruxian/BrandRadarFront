<template>
  <div class="page-container">
    <div class="filter-bar">
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
          <button class="action-btn action-btn--primary" :disabled="loading" @click="doSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            查询
          </button>
          <button class="action-btn action-btn--secondary" @click="doReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 表格区域 - 桌面端 -->
    <div
      v-if="!isMobile"
      class="data-table-wrap"
    >
      <!-- 骨架屏 -->
      <UiSkeletonTable
        v-if="loading"
        :columns="tableColumns"
        :rows="filters.page_size || 8"
        :loading="loading"
      />

      <!-- 真实数据表格 -->
      <div v-if="!loading" class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>图片</th>
              <th>品牌</th>
              <th>型号</th>
              <th>国家</th>
              <th>价格</th>
              <th>状态</th>
              <th>采集时间</th>
            </tr>
          </thead>
          <tbody>
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
                <div class="empty-row__graphic">
                  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                    <rect x="10" y="10" width="68" height="68" rx="10" fill="white" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08))"/>
                    <path d="M28 22H52L64 34V68H28V22Z" stroke="#A5C89E" stroke-width="2.5" stroke-linejoin="round"/>
                    <path d="M52 22V34H64" stroke="#A5C89E" stroke-width="2.5" stroke-linejoin="round"/>
                    <circle cx="45" cy="42" r="5" stroke="#A5C89E" stroke-width="2.5"/>
                    <path d="M49 46L52 49" stroke="#A5C89E" stroke-width="2.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <p class="empty-row__title">No Crawler Data Found</p>
                <p class="empty-row__desc">We couldn't find any records matching your current selection.<br>Try adjusting your filters or starting a new crawl task.</p>
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

    <!-- 测试弹窗示例 -->
    <UiModal
      v-model:visible="showDetailModal"
      title="产品详情"
      size="lg"
      @confirm="showDetailModal = false"
    >
      <template #default>
        <div class="demo-modal-content">
          <div class="demo-section">
            <h4 class="demo-section-title">数据统计</h4>
            <div class="demo-stats">
              <div class="demo-stat-card">
                <div class="stat-value">1,234</div>
                <div class="stat-label">总产品数</div>
              </div>
              <div class="demo-stat-card">
                <div class="stat-value">856</div>
                <div class="stat-label">在售产品</div>
              </div>
              <div class="demo-stat-card">
                <div class="stat-value">378</div>
                <div class="stat-label">已下架</div>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <h4 class="demo-section-title">品牌分布</h4>
            <table class="demo-table">
              <thead>
                <tr>
                  <th>品牌</th>
                  <th>产品数</th>
                  <th>占比</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="brand-chip">HP</span></td>
                  <td class="font-mono">423</td>
                  <td class="font-mono">34.3%</td>
                  <td><span class="status-tag tag-on">活跃</span></td>
                </tr>
                <tr>
                  <td><span class="brand-chip">Dell</span></td>
                  <td class="font-mono">312</td>
                  <td class="font-mono">25.3%</td>
                  <td><span class="status-tag tag-on">活跃</span></td>
                </tr>
                <tr>
                  <td><span class="brand-chip">Lenovo</span></td>
                  <td class="font-mono">289</td>
                  <td class="font-mono">23.4%</td>
                  <td><span class="status-tag tag-on">活跃</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="modal-btn modal-btn-secondary" @click="showDetailModal = false">取消</button>
        <button class="modal-btn modal-btn-danger" @click="showDangerModal = true; showDetailModal = false">危险操作</button>
        <button class="modal-btn modal-btn-gradient" @click="showDetailModal = false">确认</button>
      </template>
    </UiModal>

    <!-- 危险操作确认弹窗 -->
    <UiModal
      v-model:visible="showDangerModal"
      title="确认危险操作"
      size="sm"
      :danger="true"
      confirm-text="确认删除"
      @confirm="handleDangerConfirm"
    >
      <template #default>
        <div class="danger-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>此操作不可撤销，将永久删除所有相关数据。</span>
        </div>
      </template>
    </UiModal>

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
import { UiSkeletonTable, UiModal, type SkeletonColumn } from '@/components/feedback'

function getProductImage(p: Product): string {
  if (p.image) return p.image
  if (p.brand === 'HP' && p.product_id)
    return `https://ssl-product-images.www8.hp.com/digmedialib/prodimg/knowledgebase/c${p.product_id.padStart(8,'0')}/c${p.product_id.padStart(8,'0')}-825-1hb.png`
  return ''
}

// 表格骨架屏列配置
const tableColumns: SkeletonColumn[] = [
  { key: 'image', title: '图片', type: 'image' },
  { key: 'brand', title: '品牌', type: 'text' },
  { key: 'model', title: '型号', type: 'text' },
  { key: 'country', title: '国家', type: 'text' },
  { key: 'price', title: '价格', type: 'price' },
  { key: 'status', title: '状态', type: 'tag' },
  { key: 'time', title: '采集时间', type: 'text' },
]

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

// 测试弹窗状态
const showDetailModal = ref(false)
const showDangerModal = ref(false)

function handleDangerConfirm() {
  showDangerModal.value = false
  alert('危险操作已执行')
}

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

<style>
/* 筛选栏 - 蓝色渐变风格 */
.filter-bar {
  padding: 12px 16px;
  background: var(--dt-color-bg-filter-bar);
  border-radius: var(--dt-radius-lg);
  border: 1px solid var(--dt-color-border);
  box-shadow: var(--dt-shadow-sm);
  font-family: var(--dt-font-sans);
}
.filter-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 4px; min-width: 120px; flex: 1; }
.filter-label {
  font-size: var(--dt-text-2xs);
  color: var(--dt-color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--dt-tracking-widest);
  font-weight: var(--dt-weight-medium);
  font-family: var(--dt-font-sans);
}
.filter-actions { display: flex; gap: 10px; align-items: flex-end; }

/* ══════════════════════════════════════════════════════
   按钮系统 — BrandRadar Radar Pro (Blue Edition)
   ══════════════════════════════════════════════════════ */
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--dt-btn-height-md);
  padding: 0 16px;
  border-radius: var(--dt-radius-sm);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-medium);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
  white-space: nowrap;
  gap: 8px;
  user-select: none;
}

.btn-base:active { transform: scale(0.98); }
.btn-base:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* Primary — 查询 / 确认 */
.btn-primary {
  background-color: var(--dt-color-primary);
  color: var(--dt-color-primary-text);
  border-color: var(--dt-color-primary);
}
.btn-primary:hover {
  background-color: var(--dt-color-primary-hover);
  border-color: var(--dt-color-primary-hover);
  box-shadow: var(--dt-shadow-btn-hover);
}
.btn-primary:active { background-color: var(--dt-color-primary-active); }

/* Secondary — 重置 / 取消 */
.btn-secondary {
  background-color: var(--dt-color-bg-surface);
  color: var(--dt-btn-secondary-text);
  border-color: var(--dt-color-primary);
}
.btn-secondary:hover {
  background-color: var(--dt-color-primary-light);
}

/* Ghost — 行详情 / 复制链接 */
.btn-ghost {
  background-color: transparent;
  color: var(--dt-color-text-secondary);
  padding: 0 8px;
}
.btn-ghost:hover {
  background-color: var(--dt-color-bg-muted);
  color: var(--dt-color-text-primary);
}

/* 主要操作按钮（查询/重置） */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-2);
  height: var(--dt-btn-height-base);
  padding: 0 var(--dt-space-4);
  border-radius: var(--dt-radius-xs);
  font-family: var(--dt-font-sans);
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-semibold);
  cursor: pointer;
  transition: var(--dt-transition-default);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}
.action-btn:active { transform: scale(0.98); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* 查询 — 蓝底白字 */
.action-btn--primary {
  background: var(--dt-btn-primary-bg);
  color: var(--dt-btn-primary-text);
  border: 1px solid var(--dt-btn-primary-border);
}
.action-btn--primary:hover {
  background: var(--dt-btn-primary-bg-hover);
  border-color: var(--dt-btn-primary-border-hover);
  box-shadow: var(--dt-shadow-btn-hover);
}
.action-btn--primary:active {
  background: var(--dt-btn-primary-bg-active);
  transform: scale(0.98);
}
.action-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 重置 — 白底蓝字蓝边框 */
.action-btn--secondary {
  background: var(--dt-btn-secondary-bg);
  color: var(--dt-btn-secondary-text);
  border: 1px solid var(--dt-btn-secondary-border);
}
.action-btn--secondary:hover {
  background: var(--dt-btn-secondary-bg-hover);
  border-color: var(--dt-btn-secondary-border-hover);
  color: var(--dt-btn-secondary-text);
}

/* 表格区域 - 无边框，依靠阴影 */
.table-wrap {
  overflow-x: auto;
  border-radius: var(--dt-radius-md);
  font-family: var(--dt-font-sans);
}
.data-table-wrap {
  border-radius: var(--dt-radius-md);
  overflow: hidden;
  box-shadow: var(--dt-shadow-sm);
  background: var(--dt-color-bg-surface);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dt-text-sm);
  font-family: var(--dt-font-sans);
}
.data-table thead th {
  background: var(--dt-color-bg-muted);
  color: var(--dt-table-th-color);
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-table-th-font-weight);
  font-family: var(--dt-font-sans);
  text-transform: uppercase;
  letter-spacing: var(--dt-tracking-upper);
  border-bottom: 1px solid var(--dt-color-border);
  padding: var(--dt-table-th-cell-padding);
  height: var(--dt-table-th-height);
  white-space: nowrap;
  text-align: left;
}
.data-table tbody td {
  padding: var(--dt-table-cell-padding);
  border-bottom: 1px solid var(--dt-color-border-light);
  color: var(--dt-table-td-color);
  font-size: var(--dt-table-td-font-size);
  font-family: var(--dt-font-sans);
  height: var(--dt-table-td-height);
  background: var(--dt-color-bg-surface);
}
.data-table tbody tr:hover td {
  background: var(--dt-table-td-bg-hover);
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}
.product-row { animation: fadeInRow 0.25s var(--dt-ease-out) both; }
@keyframes fadeInRow { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }

/* 品牌标签 */
.brand-chip { display: inline-flex; align-items: center; padding: 2px 10px; background: rgba(0, 74, 198, 0.08); color: var(--dt-color-primary); border: 1px solid rgba(0, 74, 198, 0.2); border-radius: 999px; font-size: var(--dt-text-2xs); font-weight: var(--dt-weight-semibold); font-family: var(--dt-font-sans); }
.region-chip { padding: 2px 8px; background: rgba(0, 74, 198, 0.08); color: var(--dt-color-primary); border: 1px solid rgba(0, 74, 198, 0.2); border-radius: 999px; font-size: var(--dt-text-2xs); font-family: var(--dt-font-sans); }
.model-link { color: var(--dt-color-text-primary); text-decoration: none; font-size: var(--dt-text-sm); font-weight: var(--dt-weight-medium); transition: color var(--dt-duration-fast); font-family: var(--dt-font-sans); }
.model-link:hover { color: var(--dt-color-primary); }
.sku { font-size: var(--dt-text-2xs); color: var(--dt-color-text-muted); font-family: var(--dt-font-sans); }
.price-val { color: var(--dt-color-primary); font-size: var(--dt-text-sm); font-weight: var(--dt-weight-semibold); font-family: var(--dt-font-mono); }
.ts { font-size: var(--dt-text-2xs); color: var(--dt-color-text-muted); font-family: var(--dt-font-mono); }
.thumb-wrap { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
.thumb-img { width: 48px; height: 48px; object-fit: contain; border: 1px solid var(--dt-color-border); background: var(--dt-color-bg-muted); border-radius: var(--dt-radius-sm); cursor: zoom-in; transition: opacity var(--dt-duration-fast), transform var(--dt-duration-base); }
.thumb-img:hover { opacity: 0.86; transform: scale(1.03); }
.thumb-empty { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--dt-color-bg-muted); border: 1px solid var(--dt-color-border); border-radius: var(--dt-radius-sm); color: var(--dt-color-text-muted); }
.img-preview-float { position: fixed; z-index: var(--dt-z-tooltip); pointer-events: none; background: var(--dt-color-bg-elevated); border: 1px solid var(--dt-color-border); border-radius: var(--dt-radius-md); padding: 6px; box-shadow: var(--dt-shadow-xl); animation: scaleIn 0.15s var(--dt-ease-elastic); }
.img-preview-float img { width: 100%; height: 100%; object-fit: contain; display: block; border-radius: var(--dt-radius-sm); }
@keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }

.mobile-cards { display: flex; flex-direction: column; gap: 10px; }
.mobile-card { padding: 14px 16px; border-radius: var(--dt-radius-lg); transition: var(--dt-transition-hover); }
.mobile-thumb { width: 60px; height: 60px; object-fit: contain; border: 1px solid var(--dt-color-border); background: var(--dt-color-bg-muted); border-radius: var(--dt-radius-sm); }
.mobile-info { flex: 1; min-width: 0; }
.mobile-model { font-size: var(--dt-text-sm); font-weight: var(--dt-weight-semibold); color: var(--dt-color-text-primary); margin-bottom: 5px; font-family: var(--dt-font-sans); }
.mobile-meta { display: flex; gap: 10px; font-size: var(--dt-text-2xs); color: var(--dt-color-text-secondary); flex-wrap: wrap; font-family: var(--dt-font-sans); }

.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; font-family: var(--dt-font-sans); }
.page-info { font-size: var(--dt-text-xs); color: var(--dt-color-text-secondary); min-width: 60px; text-align: center; font-family: var(--dt-font-mono); }
.empty-row {
  text-align: center;
  padding: 60px 24px;
  font-family: var(--dt-font-sans);
  border: none;
}

.empty-row__graphic {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  animation: empty-float 3s ease-in-out infinite;
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.empty-row__title {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
  margin: 0 0 10px;
  font-family: var(--dt-font-sans);
  letter-spacing: -0.01em;
}

.empty-row__desc {
  font-size: var(--dt-text-sm);
  color: var(--dt-color-text-tertiary);
  margin: 0;
  font-family: var(--dt-font-sans);
  line-height: 1.7;
}

/* 状态标签 */
.status-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: var(--dt-text-2xs); font-weight: var(--dt-weight-semibold); letter-spacing: 0.02em; border: 1px solid transparent; font-family: var(--dt-font-sans); }
.tag-on { background: var(--dt-color-success-bg); color: var(--dt-color-success-text); border-color: var(--dt-color-success-light); }
.tag-off { background: var(--dt-color-bg-muted); color: var(--dt-color-text-secondary); border-color: var(--dt-color-border); }
.country-text { font-size: var(--dt-text-sm); color: var(--dt-color-text-secondary); font-family: var(--dt-font-sans); }

/* 弹窗演示样式 */
.demo-modal-content { display: flex; flex-direction: column; gap: var(--dt-space-6); }
.demo-section { display: flex; flex-direction: column; gap: var(--dt-space-3); }
.demo-section-title { margin: 0; font-size: var(--dt-text-sm); font-weight: var(--dt-weight-semibold); color: var(--dt-color-text-primary); font-family: var(--dt-font-sans); }
.demo-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--dt-space-3); }
.demo-stat-card { background: var(--dt-color-bg-muted); border: 1px solid var(--dt-color-border-light); border-radius: var(--dt-radius-md); padding: var(--dt-space-4); text-align: center; font-family: var(--dt-font-sans); }
.stat-value { font-size: var(--dt-text-2xl); font-weight: var(--dt-weight-bold); background: var(--dt-gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: var(--dt-font-sans); }
.stat-label { font-size: var(--dt-text-xs); color: var(--dt-color-text-secondary); margin-top: var(--dt-space-1); font-family: var(--dt-font-sans); }

.demo-table { width: 100%; border-collapse: collapse; font-family: var(--dt-font-sans); }
.demo-table th { background: var(--dt-color-bg-muted); padding: 10px 12px; font-size: var(--dt-text-xs); font-weight: var(--dt-weight-semibold); color: var(--dt-color-text-secondary); text-align: left; border-bottom: 1px solid var(--dt-color-border); font-family: var(--dt-font-sans); }
.demo-table td { padding: 12px; border-bottom: 1px solid var(--dt-color-border-light); font-size: var(--dt-text-sm); color: var(--dt-color-text-primary); font-family: var(--dt-font-sans); }
.demo-table tr:hover td { background: var(--dt-color-bg-hover); }

.danger-warning { display: flex; align-items: flex-start; gap: 12px; padding: var(--dt-space-4); background: var(--dt-color-danger-bg); border: 1px solid var(--dt-color-danger-light); border-radius: var(--dt-radius-sm); font-size: var(--dt-text-sm); color: var(--dt-color-danger-text); font-family: var(--dt-font-sans); }
.danger-warning svg { flex-shrink: 0; margin-top: 2px; }

/* 弹窗按钮样式 */
.modal-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 10px 20px; border-radius: var(--dt-radius-md); font-size: var(--dt-text-sm); font-weight: var(--dt-weight-semibold); cursor: pointer; transition: var(--dt-transition-default); border: 1px solid transparent; font-family: var(--dt-font-sans); }
.modal-btn-secondary { background: var(--dt-color-bg-surface); color: var(--dt-color-text-secondary); border-color: var(--dt-color-border); }
.modal-btn-secondary:hover { background: var(--dt-color-bg-muted); border-color: var(--dt-color-border-strong); }
.modal-btn-danger { background: var(--dt-color-bg-surface); color: var(--dt-color-danger); border-color: var(--dt-color-danger-light); }
.modal-btn-danger:hover { background: var(--dt-color-danger-bg); }
.modal-btn-gradient { background: var(--dt-gradient-primary); color: var(--dt-color-text-inverse); border: none; }
.modal-btn-gradient:hover { background: var(--dt-gradient-primary-hover); filter: brightness(1.05); box-shadow: var(--dt-shadow-btn-hover); transform: translateY(-1px); }
</style>
