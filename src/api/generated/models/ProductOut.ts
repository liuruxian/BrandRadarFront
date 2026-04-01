/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 单个产品的 API 输出模型。
 */
export type ProductOut = {
    /**
     * 品牌名称
     */
    brand: string;
    /**
     * 国家代码，如 dk-da
     */
    country: string;
    /**
     * 国家中文名（按品牌映射）
     */
    country_name_zh?: string;
    /**
     * 产品唯一 ID
     */
    product_id: string;
    /**
     * SKU / 料号
     */
    sku?: string;
    /**
     * 产品型号（已去除语言前缀和括号内 SKU）
     */
    model?: string;
    /**
     * 产品详情页链接
     */
    url?: string;
    /**
     * 当前售价
     */
    price?: string;
    /**
     * 原价（有折扣时）
     */
    original_price?: string;
    /**
     * 货币代码，如 DKK / AUD
     */
    currency?: string;
    /**
     * 主图 URL
     */
    image?: string;
    /**
     * 评分
     */
    rating?: string;
    /**
     * 评论数
     */
    total_reviews?: string;
    /**
     * on_sale | discontinued
     */
    status?: string;
    /**
     * 最近采集时间 ISO 8601
     */
    scraped_at?: string;
    /**
     * 首次发现时间
     */
    listed_at?: string;
    /**
     * 下架时间（空字符串表示在售）
     */
    delisted_at?: string;
};

