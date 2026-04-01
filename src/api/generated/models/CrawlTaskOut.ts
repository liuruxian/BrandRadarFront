/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 采集任务状态响应。
 */
export type CrawlTaskOut = {
    /**
     * 任务唯一 ID
     */
    task_id: string;
    /**
     * 任务状态
     */
    status: 'queued' | 'running' | 'done' | 'failed' | 'skipped';
    brand?: (string | null);
    country?: (string | null);
    /**
     * 开始时间 ISO 8601
     */
    started_at?: (string | null);
    /**
     * 完成时间 ISO 8601
     */
    finished_at?: (string | null);
    /**
     * 本次采集产品总数
     */
    product_count?: (number | null);
    /**
     * 新增产品数
     */
    new_count?: (number | null);
    /**
     * 更新产品数
     */
    updated_count?: (number | null);
    /**
     * 失败时的错误信息
     */
    error?: (string | null);
    /**
     * 进度描述，如 'HP dk-da 2/5'
     */
    progress?: (string | null);
};

