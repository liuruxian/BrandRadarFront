<template>
  <div ref="wrapperRef" class="world-map-chart">
    <svg ref="svgRef" class="world-map-svg" />
    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="map-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tt-name">{{ tooltip.name }}</div>
      <div class="tt-rank">排名 #{{ tooltip.rank }}</div>
      <div class="tt-row"><span>销量</span><span>{{ tooltip.units?.toLocaleString() }} 台</span></div>
      <div class="tt-row"><span>销售额</span><span>${{ tooltip.value?.toLocaleString() }}M</span></div>
      <div class="tt-row"><span>平均单价</span><span>${{ tooltip.asp?.toLocaleString() }}</span></div>
      <div class="tt-row tt-share"><span>市场份额</span><span>{{ tooltip.share }}%</span></div>
    </div>
    <!-- Legend -->
    <div class="map-legend">
      <div class="legend-bar" />
      <div class="legend-labels">
        <span>低</span>
        <span>高</span>
      </div>
    </div>
    <!-- Zoom Controls -->
    <div class="map-zoom-controls">
      <button class="zoom-btn" title="Zoom In" @click="zoomIn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <button class="zoom-btn" title="Zoom Out" @click="zoomOut">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <button class="zoom-btn" title="Reset" @click="zoomReset">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { ISO3_TO_NUMERIC } from '@/utils/countryCoords'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'

interface HeatmapItem {
  name: string
  code: string
  rank: number
  units: number
  value: number
  asp: number
  share: number
}

interface Props {
  heatmap: HeatmapItem[]
  metric: 'units' | 'value' | 'asp'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const wrapperRef = ref<HTMLElement>()
const svgRef = ref<SVGElement>()
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  name: '',
  rank: 0,
  units: 0,
  value: 0,
  asp: 0,
  share: 0,
})

let worldFeatures: any[] = []
let zoomGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null

const COLOR_RANGE = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']

async function loadWorldGeo() {
  if (worldFeatures.length) return
  const res = await fetch('/world.json')
  const topoData: Topology = await res.json()
  const countries = topojson.feature(topoData, topoData.objects.countries as any)
  worldFeatures = countries.features || []
}

function getIso3FromFeature(feat: any): string | null {
  const numericId = feat.id ?? feat.properties?.id
  if (!numericId) return null
  const entry = Object.entries(ISO3_TO_NUMERIC).find(([, num]) => String(num) === String(numericId))
  return entry?.[0] ?? null
}

function buildColorMap(): Map<string, string> {
  const map = new Map<string, string>()
  const data = props.heatmap
  if (!data.length) return map

  const values = data.map((d) => d[props.metric])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const colorScale = d3
    .scaleSequential()
    .domain([minVal, maxVal])
    .interpolator(d3.interpolateRgbBasis(COLOR_RANGE))

  const dataMap = new Map(data.map((d) => [d.code, d[props.metric]]))

  for (const feat of worldFeatures) {
    const iso3 = getIso3FromFeature(feat)
    if (iso3 && dataMap.has(iso3)) {
      map.set(String(feat.id), colorScale(dataMap.get(iso3)!))
    }
  }
  return map
}

let renderTimer: ReturnType<typeof setTimeout> | null = null

function renderMap() {
  if (!svgRef.value || !worldFeatures.length || !wrapperRef.value) return

  const { width, height } = wrapperRef.value.getBoundingClientRect()
  if (width === 0 || height === 0) return

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  svg.attr('width', width).attr('height', height)

  const projection = d3
    .geoNaturalEarth1()
    .scale((width / 640) * 100)
    .translate([width / 2, height / 2])

  const pathGen = d3.geoPath().projection(projection)
  const colorMap = buildColorMap()

  // Background rect - does NOT capture events, so mouse can pass through to page nav
  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#e8edf2')
    .style('pointer-events', 'none')

  // Zoom container group
  zoomGroup = svg.append('g')

  zoomGroup
    .selectAll('path.country')
    .data(worldFeatures)
    .join('path')
    .attr('class', 'country')
    .attr('d', pathGen as any)
    .attr('fill', (d: any) => colorMap.get(String(d.id)) || '#d1d9e6')
    .attr('stroke', '#a0aec0')
    .attr('stroke-width', 0.4)
    .style('cursor', (d: any) => {
      const numericId = String(d.id)
      return props.heatmap.some((h) => {
        const entry = Object.entries(ISO3_TO_NUMERIC).find(([, num]) => String(num) === numericId)
        return entry?.[0] === h.code
      }) ? 'pointer' : 'default'
    })
    .on('mouseenter', function (event: MouseEvent, d: any) {
      const numericId = String(d.id)
      const entry = Object.entries(ISO3_TO_NUMERIC).find(([, num]) => String(num) === numericId)
      const code = entry?.[0]
      const item = props.heatmap.find((h) => h.code === code)
      if (!item) return
      tooltip.value = {
        visible: true,
        x: event.offsetX + 12,
        y: event.offsetY - 12,
        name: item.name,
        rank: item.rank,
        units: item.units,
        value: item.value,
        asp: item.asp,
        share: item.share,
      }
      d3.select(this).attr('stroke', '#2563EB').attr('stroke-width', 1.5)
    })
    .on('mousemove', function (event: MouseEvent) {
      tooltip.value.x = event.offsetX + 12
      tooltip.value.y = event.offsetY - 12
    })
    .on('mouseleave', function (_: MouseEvent) {
      tooltip.value.visible = false
      d3.select(this).attr('stroke', '#a0aec0').attr('stroke-width', 0.4)
    })
}

// Zoom controls - directly manipulate SVG transform, no D3 zoom event capture
function zoomIn() {
  if (svgRef.value && zoomGroup) {
    const stored = zoomGroup.attr('data-scale')
    const currentScale = stored ? parseFloat(stored) : 1
    const newScale = Math.min(currentScale * 1.5, 10)
    zoomGroup.attr('transform', `scale(${newScale})`)
    zoomGroup.attr('data-scale', String(newScale))
  }
}

function zoomOut() {
  if (svgRef.value && zoomGroup) {
    const stored = zoomGroup.attr('data-scale')
    const currentScale = stored ? parseFloat(stored) : 1
    const newScale = Math.max(currentScale * 0.67, 0.5)
    zoomGroup.attr('transform', `scale(${newScale})`)
    zoomGroup.attr('data-scale', String(newScale))
  }
}

function zoomReset() {
  if (zoomGroup) {
    zoomGroup.attr('transform', 'scale(1)')
    zoomGroup.attr('data-scale', '1')
  }
}

// ResizeObserver with debounce
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await loadWorldGeo()

  requestAnimationFrame(() => {
    renderMap()
  })

  resizeObserver = new ResizeObserver(() => {
    if (renderTimer) clearTimeout(renderTimer)
    renderTimer = setTimeout(renderMap, 100)
  })
  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (renderTimer) clearTimeout(renderTimer)
})

watch(
  () => [props.heatmap, props.metric],
  () => {
    if (renderTimer) clearTimeout(renderTimer)
    renderTimer = setTimeout(renderMap, 50)
  },
  { deep: true }
)
</script>

<style scoped>
.world-map-chart {
  width: 100%;
  height: 100%;
  min-height: 480px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.world-map-svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Tooltip */
.map-tooltip {
  position: absolute;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #111827;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  min-width: 160px;
}

.tt-name {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
}

.tt-rank {
  color: #9ca3af;
  font-size: 11px;
  margin-bottom: 8px;
}

.tt-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 1.8;
  font-size: 11px;
}

.tt-row span:first-child {
  color: #6b7280;
}

.tt-row span:last-child {
  font-weight: 600;
}

.tt-share span:last-child {
  color: #2563eb;
}

/* Legend */
.map-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 10px;
  backdrop-filter: blur(4px);
}

.legend-bar {
  width: 12px;
  height: 80px;
  background: linear-gradient(to top, #dbeafe, #93c5fd, #3b82f6, #1d4ed8, #1e3a8a);
  border-radius: 3px;
}

.legend-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
  font-size: 10px;
  color: #64748b;
  position: absolute;
  left: 28px;
  top: 8px;
}

/* Zoom Controls */
.map-zoom-controls {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  backdrop-filter: blur(4px);
  transition: all 0.15s;
}

.zoom-btn:hover {
  background: #fff;
  border-color: #2563eb;
  color: #2563eb;
}

.zoom-btn:active {
  transform: scale(0.95);
}
</style>
