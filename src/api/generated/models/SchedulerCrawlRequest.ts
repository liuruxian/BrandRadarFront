/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * POST /api/scheduler/crawl — 按品牌/国家维度触发采集。
 *
 * 支持：
 * - 单品牌单国家:  {"brand": "HP", "countries": ["dk-da"]}
 * - 单品牌多国家:  {"brand": "HP", "countries": ["dk-da", "be-nl", "ar-es"]}
 * - 全品牌全量:    {}  （brand/countries 均为空）
 * - 单品牌全量:    {"brand": "HP"}
 */
export type SchedulerCrawlRequest = {
    /**
     * 指定品牌（如 'HP'），为空则抓全部品牌
     */
    brand?: (string | null);
    /**
     * 国家代码列表（如 ['dk-da','be-nl']），为空则抓该品牌全部国家
     */
    countries?: (Array<string> | null);
    /**
     * 强制触发：同一任务正在运行时是否强制新建
     */
    force?: boolean;
    /**
     * 遇到已有产品时是否更新字段
     */
    update_existing?: boolean;
};

