/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_SpecIdListOut_ } from '../models/APIResponse_SpecIdListOut_';
import type { APIResponse_SpecOut_ } from '../models/APIResponse_SpecOut_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SpecsService {
    /**
     * 已采集规格的产品 ID 列表
     * @param brand
     * @param country
     * @returns APIResponse_SpecIdListOut_ Successful Response
     * @throws ApiError
     */
    public static listSpecIdsApiSpecsBrandCountryGet(
        brand: string,
        country: string,
    ): CancelablePromise<APIResponse_SpecIdListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/specs/{brand}/{country}',
            path: {
                'brand': brand,
                'country': country,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询单个产品规格
     * lang 参数控制返回语言：both（默认）= 原文+英文；original = 仅原文；en = 仅英文
     * @param brand
     * @param country
     * @param productId
     * @param lang both | original | en
     * @returns APIResponse_SpecOut_ Successful Response
     * @throws ApiError
     */
    public static getSpecApiSpecsBrandCountryProductIdGet(
        brand: string,
        country: string,
        productId: string,
        lang: string = 'both',
    ): CancelablePromise<APIResponse_SpecOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/specs/{brand}/{country}/{product_id}',
            path: {
                'brand': brand,
                'country': country,
                'product_id': productId,
            },
            query: {
                'lang': lang,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
