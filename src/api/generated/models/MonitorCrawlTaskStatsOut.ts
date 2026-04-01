/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorCrawlTaskStatsOut = {
    /**
     * 排队中的采集任务数
     */
    queued: number;
    /**
     * 运行中的采集任务数
     */
    running: number;
    /**
     * 已完成采集任务数
     */
    done: number;
    /**
     * 失败采集任务数
     */
    failed: number;
};

