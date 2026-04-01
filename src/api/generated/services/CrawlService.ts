/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_CrawlTaskListOut_ } from '../models/APIResponse_CrawlTaskListOut_';
import type { APIResponse_CrawlTaskOut_ } from '../models/APIResponse_CrawlTaskOut_';
import type { APIResponse_dict_ } from '../models/APIResponse_dict_';
import type { CrawlRequest } from '../models/CrawlRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CrawlService {
    /**
     * 触发采集任务
     * 异步触发采集，立即返回 task_id。通过 GET /api/crawl/{task_id} 轮询任务状态。
     * @param requestBody
     * @returns APIResponse_CrawlTaskOut_ Successful Response
     * @throws ApiError
     */
    public static triggerCrawlApiCrawlPost(
        requestBody: CrawlRequest,
    ): CancelablePromise<APIResponse_CrawlTaskOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/crawl',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 列出采集任务
     * @param brand
     * @param country
     * @returns APIResponse_CrawlTaskListOut_ Successful Response
     * @throws ApiError
     */
    public static listCrawlTasksApiCrawlGet(
        brand?: (string | null),
        country?: (string | null),
    ): CancelablePromise<APIResponse_CrawlTaskListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crawl',
            query: {
                'brand': brand,
                'country': country,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询单个任务状态
     * @param taskId
     * @returns APIResponse_CrawlTaskOut_ Successful Response
     * @throws ApiError
     */
    public static getCrawlTaskApiCrawlTaskIdGet(
        taskId: string,
    ): CancelablePromise<APIResponse_CrawlTaskOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/crawl/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 清理过期任务记录
     * @returns APIResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static cleanupTasksApiCrawlCleanupDelete(): CancelablePromise<APIResponse_dict_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/crawl/cleanup',
        });
    }
}
