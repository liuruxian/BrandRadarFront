/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_dict_ } from '../models/APIResponse_dict_';
import type { APIResponse_HealthOut_ } from '../models/APIResponse_HealthOut_';
import type { APIResponse_SummaryOut_ } from '../models/APIResponse_SummaryOut_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemService {
    /**
     * 服务健康检查
     * 公开接口，无需 API Key。用于负载均衡器心跳检测。
     * @returns APIResponse_HealthOut_ Successful Response
     * @throws ApiError
     */
    public static healthCheckHealthGet(): CancelablePromise<APIResponse_HealthOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * 全局数据汇总
     * 返回各品牌/国家产品数量统计，以及最近更新时间。
     * @returns APIResponse_SummaryOut_ Successful Response
     * @throws ApiError
     */
    public static getSummaryApiSummaryGet(): CancelablePromise<APIResponse_SummaryOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/summary',
        });
    }
    /**
     * 热重载调度配置
     * 重新读取 schedule_config.json，立即生效，无需重启服务。
     *
     * 用法：修改 schedule_config.json 后调用此接口即可。
     * @returns APIResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static reloadSchedulerApiSchedulerReloadPost(): CancelablePromise<APIResponse_dict_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/scheduler/reload',
        });
    }
}
