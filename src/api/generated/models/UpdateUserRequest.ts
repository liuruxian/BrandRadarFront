/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 更新用户请求（管理员调用）。
 */
export type UpdateUserRequest = {
    /**
     * 启用/禁用
     */
    is_active?: (boolean | null);
    /**
     * 角色名列表
     */
    roles?: (Array<string> | null);
    /**
     * 重置密码（可选）
     */
    password?: (string | null);
};

