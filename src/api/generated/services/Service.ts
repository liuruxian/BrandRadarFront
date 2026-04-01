/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_MonitorOverviewOut_ } from '../models/APIResponse_MonitorOverviewOut_';
import type { APIResponse_PriceChangeListOut_ } from '../models/APIResponse_PriceChangeListOut_';
import type { APIResponse_SchedulerCrawlOut_ } from '../models/APIResponse_SchedulerCrawlOut_';
import type { APIResponse_SchedulerStatusOut_ } from '../models/APIResponse_SchedulerStatusOut_';
import type { APIResponse_SetScheduleOut_ } from '../models/APIResponse_SetScheduleOut_';
import type { SchedulerCrawlRequest } from '../models/SchedulerCrawlRequest';
import type { SetScheduleRequest } from '../models/SetScheduleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class Service {
    /**
     * 查询价格变动记录
     * 返回最近 N 条价格变动，时间倒序。可按品牌/国家过滤。
     * @param brand 品牌过滤
     * @param country 国家代码过滤
     * @param limit 返回条数上限
     * @returns APIResponse_PriceChangeListOut_ Successful Response
     * @throws ApiError
     */
    public static getPriceChangesApiMonitorPriceChangesGet(
        brand?: (string | null),
        country?: (string | null),
        limit: number = 100,
    ): CancelablePromise<APIResponse_PriceChangeListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/monitor/price-changes',
            query: {
                'brand': brand,
                'country': country,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 系统监控总览（运维看板）
     * 聚合运维看板核心数据，并返回 display_titles 作为前端标题映射。
     *
     * 前端建议：按 display_titles 的 key 渲染各监控卡片标题，避免硬编码。
     * @returns APIResponse_MonitorOverviewOut_ Successful Response
     * @throws ApiError
     */
    public static monitorOverviewApiMonitorOverviewGet(): CancelablePromise<APIResponse_MonitorOverviewOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/monitor/overview',
        });
    }
    /**
     * 触发采集任务（按品牌/国家）
     * 按品牌/国家维度批量触发采集任务，返回任务明细列表。
     *
     * 前端可直接使用 tasks[*].status / error 渲染任务状态与失败原因。
     * @param requestBody
     * @returns APIResponse_SchedulerCrawlOut_ Successful Response
     * @throws ApiError
     */
    public static triggerSchedulerCrawlApiSchedulerCrawlPost(
        requestBody: SchedulerCrawlRequest,
    ): CancelablePromise<APIResponse_SchedulerCrawlOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/scheduler/crawl',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查看调度运行状态
     * 返回调度器运行状态、静默期配置、今日执行统计与下次执行倒计时。
     * @returns APIResponse_SchedulerStatusOut_ Successful Response
     * @throws ApiError
     */
    public static getSchedulerStatusApiSchedulerStatusGet(): CancelablePromise<APIResponse_SchedulerStatusOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/scheduler/status',
        });
    }
    /**
     * 配置自动调度时间
     * 更新自动采集的触发时间，立即生效并写回配置文件。
     *
     * **字段说明：**
     * - `interval_minutes`: 固定间隔（分钟），最小 30 分钟
     * - `cron_expression`:  Cron 表达式（优先级高于 interval），如 `0 2 * * *`
     * - `silent_hours_enabled`: 是否启用静默期
     * - `silent_start` / `silent_end`: 静默期时间范围，格式 `HH:MM`
     *
     * 至少提供上述字段之一，未传字段保持原值。
     * @param requestBody
     * @returns APIResponse_SetScheduleOut_ Successful Response
     * @throws ApiError
     */
    public static setSchedulerScheduleApiSchedulerSchedulePut(
        requestBody: SetScheduleRequest,
    ): CancelablePromise<APIResponse_SetScheduleOut_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/scheduler/schedule',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询采集任务列表
     * 按品牌/国家过滤查询采集任务。
     *
     * 返回字段包含时间、产出数量、进度与错误信息，便于前端列表与详情页展示。
     * @param brand
     * @param country
     * @returns APIResponse_SchedulerCrawlOut_ Successful Response
     * @throws ApiError
     */
    public static listSchedulerTasksApiSchedulerTasksGet(
        brand?: string,
        country?: string,
    ): CancelablePromise<APIResponse_SchedulerCrawlOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/scheduler/tasks',
            query: {
                'brand': brand,
                'country': country,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
