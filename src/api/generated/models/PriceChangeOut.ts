/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 单条价格变动记录。
 */
export type PriceChangeOut = {
    time: string;
    brand: string;
    country: string;
    product_id?: string;
    model?: string;
    old_price: string;
    new_price: string;
    change_pct?: (number | null);
    /**
     * 涨价 | 降价 | 变动
     */
    direction: string;
};

