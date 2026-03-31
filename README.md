# BrandRadar 前端

基于 Vue 3 + TypeScript + Vite 构建的品牌数据监控前端系统。

## 启动

```bash
# 安装依赖（国内镜像）
npm install --registry https://registry.npmmirror.com

# 启动开发服务器（端口 4000）
npm run dev
```

访问 http://localhost:4000

> 需先启动后端：`cd ../BrandRadar && python run_api.py`

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + `<script setup>` + TypeScript |
| 构建 | Vite 5 |
| UI | Naive UI（浅色青绿主题） |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 图表 | ECharts 5 + vue-echarts |
| HTTP | Axios（含拦截器）|
| 字体 | Plus Jakarta Sans / Inter / JetBrains Mono |

## 页面

| 路径 | 页面 | 核心功能 |
|------|------|----------|
| `/` | 仪表盘 | 系统健康状态、核心指标卡、品牌分布饼图、手动刷新 |
| `/products` | 产品数据中心 | 品牌/国家/状态筛选、分页表格、移动端卡片模式 |
| `/monitor` | 价格监控 | 价格变动记录、涨跌行高亮、幅度进度条可视化 |
| `/scheduler` | 调度管理 | 调度状态展示、下次运行倒计时、热重载配置 |
| `/profile` | 个人中心 | 用户信息编辑、密码修改、登录状态查看 |
| `/biz/users` | 用户管理 | 用户/角色/权限管理（仅管理员） |
| `/admin/*` | 运维管理 | 系统监控、服务控制台、日志审计、会话管理、备份恢复、配置中心、系统公告 |

## 项目结构

```
src/
├── api/
│   ├── types.ts          # 全局 TypeScript 类型
│   ├── client.ts         # Axios 实例 + 拦截器
│   ├── authApi.ts        # 登录、登出、用户信息
│   ├── systemApi.ts      # /health, /api/summary
│   ├── productsApi.ts    # /api/products, /api/brands, /api/countries
│   ├── crawlApi.ts       # /api/crawl
│   ├── monitorApi.ts     # /api/monitor/price-changes
│   ├── schedulerApi.ts   # /api/scheduler
│   ├── adminApi.ts       # 管理员接口
│   └── userApi.ts        # 用户管理接口
├── stores/               # Pinia 状态管理（8个模块）
│   ├── authStore.ts      # 认证状态
│   ├── systemStore.ts    # 系统状态
│   ├── productStore.ts   # 产品数据
│   ├── monitorStore.ts   # 价格监控
│   ├── schedulerStore.ts # 调度管理
│   ├── crawlStore.ts     # 采集任务
│   ├── adminStore.ts     # 管理员数据
│   └── ...
├── views/                # 页面视图
│   ├── LoginView.vue     # 登录页（青绿主题）
│   ├── ProfileCenterView.vue  # 个人中心
│   ├── DashboardView.vue # 仪表盘
│   ├── ProductListView.vue    # 产品中心
│   ├── PriceMonitorView.vue   # 价格监控
│   ├── SchedulerConfigView.vue # 调度管理
│   └── admin/            # 管理员页面
├── components/
│   └── layout/AppLayout.vue   # 主布局（侧边栏 + 顶栏）
├── router/index.ts       # Vue Router 配置 + 路由守卫
├── utils/
│   ├── format.ts         # 时间、价格、倒计时格式化
│   └── polling.ts        # 通用轮询 Hook
└── styles/main.css       # 全局 CSS 变量、浅色主题、动画
```

## 设计系统

### 主色调
- **主色**：`#00C4CC`（青绿）
- **主色悬停**：`#00AAB1`
- **主色按下**：`#008C93`
- **辅助色**：`#10B981`（绿色）

### 背景与文本
- **背景**：`#FFFFFF`（纯白）
- **卡片**：`#FFFFFF` + `1px #E5E7EB` 边框
- **文本主**：`#111827`
- **文本次**：`#4B5563`
- **文本弱**：`#6B7280`

### 组件
- 所有输入框、下拉框、按钮均采用浅色 + 主色体系
- 登录页采用浅色背景 + 青绿渐变
- 表格、卡片、徽章等保持一致的浅色主题

## 认证与路由

- 登录页：`/login`（公开路由）
- 路由守卫：检查 `localStorage` 中的 `brand_radar_token`
- 未登录用户自动重定向到登录页
- 个人中心：点击顶部用户名直接进入 `/profile`
- 侧边栏已移除个人中心入口

## 环境变量

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=   # 留空=不启用认证
```
