/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 调度触发后的单条任务信息。
 */
export type SchedulerTaskItem = {
    /**
     * 任务唯一 ID
     */
    task_id: string;
    /**
     * 品牌；为空表示全品牌
     */
    brand?: (string | null);
    /**
     * 国家代码；为空表示该品牌全国家
     */
    country?: (string | null);
    /**
     * 任务状态：queued/running/done/failed
     */
    status: string;
    /**
     * 开始时间（ISO 8601）
     */
    started_at?: (string | null);
    /**
     * 结束时间（ISO 8601）
     */
    finished_at?: (string | null);
    /**
     * 本次采集产品总数
     */
    product_count?: (number | null);
    /**
     * 本次新增产品数
     */
    new_count?: (number | null);
    /**
     * 本次更新产品数
     */
    updated_count?: (number | null);
    /**
     * 失败时错误信息
     */
    error?: (string | null);
    /**
     * 进度描述
     */
    progress?: (string | null);
};

