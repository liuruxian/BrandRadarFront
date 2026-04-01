/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_CountryDisplayListOut_ } from '../models/APIResponse_CountryDisplayListOut_';
import type { APIResponse_dict_ } from '../models/APIResponse_dict_';
import type { CountryMappingUpsertRequest } from '../models/CountryMappingUpsertRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CountryMappingService {
    /**
     * 查询指定品牌的国家映射
     * @param brand
     * @returns APIResponse_CountryDisplayListOut_ Successful Response
     * @throws ApiError
     */
    public static listCountryMappingsApiCountryMappingsBrandGet(
        brand: string,
    ): CancelablePromise<APIResponse_CountryDisplayListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/country-mappings/{brand}',
            path: {
                'brand': brand,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 更新品牌-国家映射
     * @param brand
     * @param countryCode
     * @param requestBody
     * @returns APIResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static upsertCountryMappingApiCountryMappingsBrandCountryCodePut(
        brand: string,
        countryCode: string,
        requestBody: CountryMappingUpsertRequest,
    ): CancelablePromise<APIResponse_dict_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/country-mappings/{brand}/{country_code}',
            path: {
                'brand': brand,
                'country_code': countryCode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
