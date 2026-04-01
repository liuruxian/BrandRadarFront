/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * PUT /api/scheduler/schedule — 配置自动调度时间。
 *
 * 二选一：
 * - interval_minutes: 固定间隔（如 1440 = 每天一次）
 * - cron_expression:  cron 表达式（如 '0 2 * * *' = 每天凌晨2点）
 *
 * 两者同时传时 cron_expression 优先。
 */
export type SetScheduleRequest = {
    /**
     * 采集间隔（分钟），最小 30 分钟
     */
    interval_minutes?: (number | null);
    /**
     * Cron 表达式（分 时 日 月 周）
     */
    cron_expression?: (string | null);
    /**
     * 是否启用静默期（不传则保持原设置）
     */
    silent_hours_enabled?: (boolean | null);
    /**
     * 静默期开始时间，格式 HH:MM（如 '00:00'）
     */
    silent_start?: (string | null);
    /**
     * 静默期结束时间，格式 HH:MM（如 '06:00'）
     */
    silent_end?: (string | null);
};

