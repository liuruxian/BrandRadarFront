/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 登录成功返回的 token。
 */
export type TokenOut = {
    /**
     * JWT access token
     */
    access_token: string;
    token_type?: string;
    user_id: string;
    email: string;
    /**
     * system | frontend
     */
    user_type: string;
    /**
     * 角色名列表
     */
    roles?: Array<string>;
    /**
     * 聚合后的权限列表
     */
    permissions?: Array<string>;
};

