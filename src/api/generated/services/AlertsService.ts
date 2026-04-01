/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_DataAlertListOut_ } from '../models/APIResponse_DataAlertListOut_';
import type { APIResponse_DataAlertOut_ } from '../models/APIResponse_DataAlertOut_';
import type { DataAlertDecisionRequest } from '../models/DataAlertDecisionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlertsService {
    /**
     * 查询预警列表
     * @param brand
     * @param country
     * @param status
     * @returns APIResponse_DataAlertListOut_ Successful Response
     * @throws ApiError
     */
    public static listAlertsApiAlertsGet(
        brand?: (string | null),
        country?: (string | null),
        status?: (string | null),
    ): CancelablePromise<APIResponse_DataAlertListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/alerts',
            query: {
                'brand': brand,
                'country': country,
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 处理预警（批准覆盖/拒绝覆盖）
     * @param alertId
     * @param requestBody
     * @returns APIResponse_DataAlertOut_ Successful Response
     * @throws ApiError
     */
    public static decideAlertApiAlertsAlertIdDecisionPut(
        alertId: string,
        requestBody: DataAlertDecisionRequest,
    ): CancelablePromise<APIResponse_DataAlertOut_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/alerts/{alert_id}/decision',
            path: {
                'alert_id': alertId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
