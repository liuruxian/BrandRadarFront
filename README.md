# BrandRadar 前端

基于 Vue 3 + TypeScript + Vite 构建的品牌数据监控前端系统。

## 启动

```bash
# 安装依赖（国内镜像）
npm install --registry https://registry.npmmirror.com

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

> 需先启动后端：`cd ../BrandRadar && python run_api.py`

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + `<script setup>` + TypeScript |
| 构建 | Vite 5 |
| UI | Naive UI（深色工业风主题） |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 图表 | ECharts 5 + vue-echarts |
| HTTP | Axios（含拦截器）|
| 字体 | Syne / Inter / JetBrains Mono |

## 页面

| 路径 | 页面 | 核心功能 |
|------|------|----------|
| `/` | 仪表盘 | 系统健康状态、核心指标卡、品牌分布饼图、手动刷新 |
| `/products` | 产品数据中心 | 品牌/国家/状态筛选、分页表格、移动端卡片模式 |
| `/monitor` | 价格监控 | 价格变动记录、涨跌行高亮、幅度进度条可视化 |
| `/tasks` | 采集任务 | 触发爬虫、实时轮询进度（3s/次）、任务状态动画 |
| `/scheduler` | 调度管理 | 调度状态展示、下次运行倒计时、热重载配置 |

## 项目结构

```
src/
├── api/
│   ├── types.ts          # 全局 TypeScript 类型
│   ├── client.ts         # Axios 实例 + 拦截器
│   ├── systemApi.ts      # /health, /api/summary
│   ├── productsApi.ts    # /api/products, /api/brands, /api/countries
│   ├── crawlApi.ts       # /api/crawl
│   ├── monitorApi.ts     # /api/monitor/price-changes
│   └── schedulerApi.ts   # /api/scheduler
├── stores/               # Pinia 状态管理（5个模块）
├── views/                # 5个页面视图
├── components/layout/    # AppLayout（侧边栏 + 顶栏）
├── router/               # Vue Router 配置
├── utils/
│   ├── format.ts         # 时间、价格、倒计时格式化
│   └── polling.ts        # 通用轮询 Hook
└── styles/main.css       # 全局 CSS 变量、深色主题、动画
```

## 环境变量

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=   # 留空=不启用认证
```
