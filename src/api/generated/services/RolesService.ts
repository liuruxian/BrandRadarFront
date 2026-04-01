/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_List_RoleOut__ } from '../models/APIResponse_List_RoleOut__';
import type { APIResponse_NoneType_ } from '../models/APIResponse_NoneType_';
import type { APIResponse_RoleOut_ } from '../models/APIResponse_RoleOut_';
import type { CreateRoleRequest } from '../models/CreateRoleRequest';
import type { UpdateRoleRequest } from '../models/UpdateRoleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RolesService {
    /**
     * 查询所有角色
     * @returns APIResponse_List_RoleOut__ Successful Response
     * @throws ApiError
     */
    public static listRolesApiRolesGet(): CancelablePromise<APIResponse_List_RoleOut__> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/roles',
        });
    }
    /**
     * 创建自定义角色
     * @param requestBody
     * @returns APIResponse_RoleOut_ Successful Response
     * @throws ApiError
     */
    public static createRoleApiRolesPost(
        requestBody: CreateRoleRequest,
    ): CancelablePromise<APIResponse_RoleOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/roles',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询单个角色
     * @param roleId
     * @returns APIResponse_RoleOut_ Successful Response
     * @throws ApiError
     */
    public static getRoleApiRolesRoleIdGet(
        roleId: string,
    ): CancelablePromise<APIResponse_RoleOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/roles/{role_id}',
            path: {
                'role_id': roleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 更新角色权限/说明
     * @param roleId
     * @param requestBody
     * @returns APIResponse_RoleOut_ Successful Response
     * @throws ApiError
     */
    public static updateRoleApiRolesRoleIdPut(
        roleId: string,
        requestBody: UpdateRoleRequest,
    ): CancelablePromise<APIResponse_RoleOut_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/roles/{role_id}',
            path: {
                'role_id': roleId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 删除角色（内置角色不可删除）
     * @param roleId
     * @returns APIResponse_NoneType_ Successful Response
     * @throws ApiError
     */
    public static deleteRoleApiRolesRoleIdDelete(
        roleId: string,
    ): CancelablePromise<APIResponse_NoneType_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/roles/{role_id}',
            path: {
                'role_id': roleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
