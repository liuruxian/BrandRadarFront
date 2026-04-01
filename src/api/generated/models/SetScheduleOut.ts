/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 调度时间配置更新后的响应。
 */
export type SetScheduleOut = {
    /**
     * 当前生效的间隔分钟数
     */
    interval_minutes: number;
    /**
     * 当前生效的 cron 表达式（为空表示未启用）
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
     * 操作结果说明
     */
    message: string;
};

