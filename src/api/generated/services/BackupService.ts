/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_BackupConfigOut_ } from '../models/APIResponse_BackupConfigOut_';
import type { APIResponse_BackupTaskListOut_ } from '../models/APIResponse_BackupTaskListOut_';
import type { APIResponse_BackupTaskOut_ } from '../models/APIResponse_BackupTaskOut_';
import type { APIResponse_dict_ } from '../models/APIResponse_dict_';
import type { BackupConfigUpdate } from '../models/BackupConfigUpdate';
import type { BackupTriggerRequest } from '../models/BackupTriggerRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BackupService {
    /**
     * 查看备份配置
     * @returns APIResponse_BackupConfigOut_ Successful Response
     * @throws ApiError
     */
    public static getBackupConfigApiBackupConfigGet(): CancelablePromise<APIResponse_BackupConfigOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/backup/config',
        });
    }
    /**
     * 更新备份配置
     * @param requestBody
     * @returns APIResponse_BackupConfigOut_ Successful Response
     * @throws ApiError
     */
    public static updateBackupConfigApiBackupConfigPut(
        requestBody: BackupConfigUpdate,
    ): CancelablePromise<APIResponse_BackupConfigOut_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/backup/config',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 手动触发备份
     * @param requestBody
     * @returns APIResponse_BackupTaskOut_ Successful Response
     * @throws ApiError
     */
    public static triggerBackupApiBackupTriggerPost(
        requestBody: BackupTriggerRequest,
    ): CancelablePromise<APIResponse_BackupTaskOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/backup/trigger',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询备份任务列表
     * @param limit
     * @returns APIResponse_BackupTaskListOut_ Successful Response
     * @throws ApiError
     */
    public static listBackupTasksApiBackupTasksGet(
        limit: number = 50,
    ): CancelablePromise<APIResponse_BackupTaskListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/backup/tasks',
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 备份调度状态
     * @returns APIResponse_dict_ Successful Response
     * @throws ApiError
     */
    public static backupStatusApiBackupStatusGet(): CancelablePromise<APIResponse_dict_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/backup/status',
        });
    }
}
