/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_NoneType_ } from '../models/APIResponse_NoneType_';
import type { APIResponse_UserListOut_ } from '../models/APIResponse_UserListOut_';
import type { APIResponse_UserOut_ } from '../models/APIResponse_UserOut_';
import type { CreateUserRequest } from '../models/CreateUserRequest';
import type { UpdateUserRequest } from '../models/UpdateUserRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * 创建用户（管理员）
     * @param requestBody
     * @returns APIResponse_UserOut_ Successful Response
     * @throws ApiError
     */
    public static createUserApiUsersPost(
        requestBody: CreateUserRequest,
    ): CancelablePromise<APIResponse_UserOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询用户列表
     * @param userType system | frontend
     * @param page
     * @param pageSize
     * @returns APIResponse_UserListOut_ Successful Response
     * @throws ApiError
     */
    public static listUsersApiUsersGet(
        userType?: (string | null),
        page: number = 1,
        pageSize: number = 50,
    ): CancelablePromise<APIResponse_UserListOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
            query: {
                'user_type': userType,
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询单个用户
     * @param userId
     * @returns APIResponse_UserOut_ Successful Response
     * @throws ApiError
     */
    public static getUserApiUsersUserIdGet(
        userId: string,
    ): CancelablePromise<APIResponse_UserOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 更新用户（状态/权限/密码）
     * @param userId
     * @param requestBody
     * @returns APIResponse_UserOut_ Successful Response
     * @throws ApiError
     */
    public static updateUserApiUsersUserIdPut(
        userId: string,
        requestBody: UpdateUserRequest,
    ): CancelablePromise<APIResponse_UserOut_> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 删除用户
     * @param userId
     * @returns APIResponse_NoneType_ Successful Response
     * @throws ApiError
     */
    public static deleteUserApiUsersUserIdDelete(
        userId: string,
    ): CancelablePromise<APIResponse_NoneType_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
