/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorTaskPerformanceOut = {
    /**
     * 任务成功率（0~1）
     */
    success_rate?: (number | null);
    /**
     * 平均耗时（秒）
     */
    avg_duration_seconds?: (number | null);
    /**
     * P95 耗时（秒）
     */
    p95_duration_seconds?: (number | null);
    /**
     * 最近一条已完成任务详情
     */
    last_task?: (Record<string, any> | null);
};

