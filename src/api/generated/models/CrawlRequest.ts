/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 触发采集任务的请求体（POST /api/crawl）。
 */
export type CrawlRequest = {
    /**
     * 指定品牌，为空则抓全部
     */
    brand?: (string | null);
    /**
     * 指定国家代码，为空则抓全部
     */
    country?: (string | null);
    /**
     * 遇到已有产品时是否更新字段
     */
    update_existing?: boolean;
    /**
     * 强制触发：同一 brand+country 任务正在运行时，是否强制新建
     */
    force?: boolean;
};

