/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 角色信息响应。
 */
export type RoleOut = {
    id: string;
    name: string;
    label: string;
    description?: string;
    is_system?: boolean;
    permissions?: Array<string>;
    created_at?: (string | null);
    updated_at?: (string | null);
};

