/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 产品规格 API 输出模型。
 */
export type SpecOut = {
    /**
     * 产品唯一 ID
     */
    product_id: string;
    /**
     * SKU
     */
    sku?: string;
    /**
     * 产品型号
     */
    model?: string;
    /**
     * 品牌
     */
    brand?: string;
    /**
     * 国家代码
     */
    country?: string;
    /**
     * 详情页 URL
     */
    detail_url?: string;
    /**
     * 采集时间
     */
    scraped_at?: string;
    /**
     * 价格
     */
    price?: string;
    /**
     * 轮播图 URL 列表
     */
    banners?: Array<string>;
    /**
     * 原文规格
     */
    specs?: (Record<string, any> | null);
    /**
     * 英文规格
     */
    specs_en?: (Record<string, any> | null);
};

