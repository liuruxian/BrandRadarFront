/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 创建用户请求（管理员调用，不支持自注册）。
 */
export type CreateUserRequest = {
    /**
     * 用户邮箱（唯一）
     */
    email: string;
    /**
     * 初始密码
     */
    password: string;
    /**
     * system | frontend
     */
    user_type: string;
    /**
     * 角色名列表，如 ['viewer', 'operator']
     */
    roles?: Array<string>;
};

