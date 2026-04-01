/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 错误信息体。
 */
export type ErrorBody = {
    /**
     * 错误码，便于前端按类型处理
     */
    error_code: string;
    /**
     * 面向用户/开发者的错误说明
     */
    message: string;
    /**
     * 附加错误细节
     */
    detail?: null;
};

