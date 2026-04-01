/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 用户信息响应（不含密码）。
 */
export type UserOut = {
    id: string;
    email: string;
    user_type: string;
    is_active: boolean;
    /**
     * 角色名列表
     */
    roles?: Array<string>;
    /**
     * 聚合后的权限列表
     */
    permissions?: Array<string>;
    created_at: string;
    updated_at: string;
};

