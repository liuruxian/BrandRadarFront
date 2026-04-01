/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_List_BrandInfo__ } from '../models/APIResponse_List_BrandInfo__';
import type { APIResponse_List_str__ } from '../models/APIResponse_List_str__';
import type { APIResponse_ProductListOut_ } from '../models/APIResponse_ProductListOut_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * 查询产品列表
     * 支持按品牌、国家、状态过滤，支持分页。
     * @param brand 品牌名称，如 HP
     * @param country 国家代码，如 dk-da
     * @param status 产品状态: on_sale | discontinued
     * @param page 页码（从 1 开始）
     * @param pageSize 每页条数
     * @returns APIResponse_ProductListOut_ Successful Response
     * @throws ApiError
     */
    public static listProductsApiProductsGet(
        brand?: (string | null),
        country?: (string | null),
        status?: (string | null),
        page: number = 1,
        pageSize: number = 50,
    ): CancelablePromise<APIResponse_ProductListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products',
            query: {
                'brand': brand,
                'country': country,
                'status': status,
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询指定品牌+国家的产品
     * @param brand
     * @param country
     * @param status
     * @param page
     * @param pageSize
     * @returns APIResponse_ProductListOut_ Successful Response
     * @throws ApiError
     */
    public static listProductsByBrandCountryApiProductsBrandCountryGet(
        brand: string,
        country: string,
        status?: (string | null),
        page: number = 1,
        pageSize: number = 50,
    ): CancelablePromise<APIResponse_ProductListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/{brand}/{country}',
            path: {
                'brand': brand,
                'country': country,
            },
            query: {
                'status': status,
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 返回所有已有数据的品牌列表
     * @returns APIResponse_List_str__ Successful Response
     * @throws ApiError
     */
    public static listBrandsApiBrandsGet(): CancelablePromise<APIResponse_List_str__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/brands',
        });
    }
    /**
     * 返回配置文件中的品牌和地区信息
     * @returns APIResponse_List_BrandInfo__ Successful Response
     * @throws ApiError
     */
    public static listBrandsConfigApiBrandsConfigGet(): CancelablePromise<APIResponse_List_BrandInfo__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/brands/config',
        });
    }
    /**
     * 返回已有数据的国家列表
     * @param brand 按品牌过滤
     * @returns APIResponse_List_str__ Successful Response
     * @throws ApiError
     */
    public static listCountriesApiCountriesGet(
        brand?: (string | null),
    ): CancelablePromise<APIResponse_List_str__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/countries',
            query: {
                'brand': brand,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
