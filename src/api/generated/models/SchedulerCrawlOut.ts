/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SchedulerTaskItem } from './SchedulerTaskItem';
/**
 * 触发采集后的响应：返回任务明细列表。
 */
export type SchedulerCrawlOut = {
    /**
     * 本次触发产生的任务明细
     */
    tasks: Array<SchedulerTaskItem>;
    /**
     * 本次触发任务总数
     */
    total: number;
};

