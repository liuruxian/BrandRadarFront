/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 创建角色请求。
 */
export type CreateRoleRequest = {
    /**
     * 角色唯一标识，如 operator
     */
    name: string;
    /**
     * 显示名称，如 运营人员
     */
    label: string;
    /**
     * 角色说明
     */
    description?: string;
    /**
     * 权限列表，如 ['products:read','crawl:write']
     */
    permissions?: Array<string>;
};

