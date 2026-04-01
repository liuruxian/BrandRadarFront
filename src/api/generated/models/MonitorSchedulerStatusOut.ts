/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorSchedulerStatusOut = {
    /**
     * 调度运行模式
     */
    mode: string;
    /**
     * 自动调度间隔（分钟）
     */
    interval_minutes: number;
    /**
     * Cron 表达式；为空时按 interval_minutes 运行
     */
    cron_expression: string;
    /**
     * 是否启用静默期
     */
    silent_hours_enabled: boolean;
    /**
     * 静默开始时间
     */
    silent_start: string;
    /**
     * 静默结束时间
     */
    silent_end: string;
    /**
     * 每日自动触发上限
     */
    max_daily_runs: number;
    /**
     * 今日自动触发次数
     */
    today_runs: number;
    /**
     * 距离下次触发剩余秒数
     */
    next_run_in_seconds: number;
    /**
     * 调度守护循环是否存活
     */
    daemon_alive: boolean;
};

