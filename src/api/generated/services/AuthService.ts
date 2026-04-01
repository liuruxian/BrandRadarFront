/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIResponse_TokenOut_ } from '../models/APIResponse_TokenOut_';
import type { APIResponse_UserOut_ } from '../models/APIResponse_UserOut_';
import type { LoginRequest } from '../models/LoginRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * 用户登录
     * 邮箱 + 密码登录，返回 JWT access token。
     * @param requestBody
     * @returns APIResponse_TokenOut_ Successful Response
     * @throws ApiError
     */
    public static loginApiAuthLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<APIResponse_TokenOut_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取当前登录用户信息
     * @returns APIResponse_UserOut_ Successful Response
     * @throws ApiError
     */
    public static meApiAuthMeGet(): CancelablePromise<APIResponse_UserOut_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
        });
    }
}
