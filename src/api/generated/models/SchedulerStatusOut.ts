/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * GET /api/scheduler/status — 当前调度状态。
 */
export type SchedulerStatusOut = {
    /**
     * 调度运行模式（当前系统固定为读取配置展示，不提供切换接口）
     */
    mode: string;
    /**
     * 自动调度间隔（分钟）
     */
    interval_minutes: number;
    /**
     * Cron 表达式；为空表示按 interval 运行
     */
    cron_expression: string;
    /**
     * 是否启用静默期
     */
    silent_hours_enabled: boolean;
    /**
     * 静默期开始时间
     */
    silent_start: string;
    /**
     * 静默期结束时间
     */
    silent_end: string;
    /**
     * 今日已自动触发次数
     */
    today_runs: number;
    /**
     * 每日自动触发上限
     */
    max_daily_runs: number;
    /**
     * 距离下次自动触发剩余秒数
     */
    next_run_in_seconds: number;
    /**
     * 调度后台循环是否存活
     */
    daemon_alive: boolean;
};

