/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_ServiceWatchdogConfigOut_ } from '../models/APIResponse_ServiceWatchdogConfigOut_';
import type { APIResponse_ServiceWatchdogStatusOut_ } from '../models/APIResponse_ServiceWatchdogStatusOut_';
import type { ServiceWatchdogConfigUpdate } from '../models/ServiceWatchdogConfigUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WatchdogService {
    /**
     * 查看服务监听配置
     * @returns APIResponse_ServiceWatchdogConfigOut_ Successful Response
     * @throws ApiError
     */
    public static getWatchdogConfigApiWatchdogConfigGet(): CancelablePromise<APIResponse_ServiceWatchdogConfigOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/watchdog/config',
        });
    }
    /**
     * 更新服务监听配置
     * @param requestBody
     * @returns APIResponse_ServiceWatchdogConfigOut_ Successful Response
     * @throws ApiError
     */
    public static updateWatchdogConfigApiWatchdogConfigPut(
        requestBody: ServiceWatchdogConfigUpdate,
    ): CancelablePromise<APIResponse_ServiceWatchdogConfigOut_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/watchdog/config',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查看服务监听状态
     * @returns APIResponse_ServiceWatchdogStatusOut_ Successful Response
     * @throws ApiError
     */
    public static getWatchdogStatusApiWatchdogStatusGet(): CancelablePromise<APIResponse_ServiceWatchdogStatusOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/watchdog/status',
        });
    }
    /**
     * 手动执行一次服务检测
     * @returns APIResponse_ServiceWatchdogStatusOut_ Successful Response
     * @throws ApiError
     */
    public static runWatchdogCheckApiWatchdogCheckPost(): CancelablePromise<APIResponse_ServiceWatchdogStatusOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/watchdog/check',
        });
    }
}
