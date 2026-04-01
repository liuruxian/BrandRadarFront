/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_StreamPublishOut_ } from '../models/APIResponse_StreamPublishOut_';
import type { APIResponse_StreamStatsOut_ } from '../models/APIResponse_StreamStatsOut_';
import type { StreamPublishRequest } from '../models/StreamPublishRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StreamService {
    /**
     * SSE 事件流
     * @returns any Successful Response
     * @throws ApiError
     */
    public static streamEventsApiStreamEventsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stream/events',
        });
    }
    /**
     * 发布测试事件
     * @param requestBody
     * @returns APIResponse_StreamPublishOut_ Successful Response
     * @throws ApiError
     */
    public static publishEventApiStreamPublishPost(
        requestBody: StreamPublishRequest,
    ): CancelablePromise<APIResponse_StreamPublishOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stream/publish',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * SSE 订阅统计
     * @returns APIResponse_StreamStatsOut_ Successful Response
     * @throws ApiError
     */
    public static streamStatsApiStreamStatsGet(): CancelablePromise<APIResponse_StreamStatsOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stream/stats',
        });
    }
}
