/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_BackupHeartbeatConfig_ } from '../models/APIResponse_BackupHeartbeatConfig_';
import type { APIResponse_BackupHeartbeatHistoryOut_ } from '../models/APIResponse_BackupHeartbeatHistoryOut_';
import type { APIResponse_BackupHeartbeatRecordOut_ } from '../models/APIResponse_BackupHeartbeatRecordOut_';
import type { APIResponse_BackupHeartbeatStatusOut_ } from '../models/APIResponse_BackupHeartbeatStatusOut_';
import type { BackupHeartbeatConfig } from '../models/BackupHeartbeatConfig';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BackupHeartbeatService {
    /**
     * 获取备份服务器心跳状态
     * @returns APIResponse_BackupHeartbeatStatusOut_ Successful Response
     * @throws ApiError
     */
    public static heartbeatStatusApiBackupHeartbeatStatusGet(): CancelablePromise<APIResponse_BackupHeartbeatStatusOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/backup/heartbeat/status',
        });
    }
    /**
     * 获取心跳历史
     * @param limit
     * @returns APIResponse_BackupHeartbeatHistoryOut_ Successful Response
     * @throws ApiError
     */
    public static heartbeatHistoryApiBackupHeartbeatHistoryGet(
        limit: number = 50,
    ): CancelablePromise<APIResponse_BackupHeartbeatHistoryOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/backup/heartbeat/history',
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 手动刷新心跳
     * @returns APIResponse_BackupHeartbeatRecordOut_ Successful Response
     * @throws ApiError
     */
    public static heartbeatRefreshApiBackupHeartbeatRefreshPost(): CancelablePromise<APIResponse_BackupHeartbeatRecordOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/backup/heartbeat/refresh',
        });
    }
    /**
     * 更新心跳配置
     * @param requestBody
     * @returns APIResponse_BackupHeartbeatConfig_ Successful Response
     * @throws ApiError
     */
    public static heartbeatUpdateConfigApiBackupHeartbeatConfigPut(
        requestBody: BackupHeartbeatConfig,
    ): CancelablePromise<APIResponse_BackupHeartbeatConfig_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/backup/heartbeat/config',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
