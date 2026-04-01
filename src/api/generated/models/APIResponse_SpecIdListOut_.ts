/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ErrorBody } from './ErrorBody';
import type { SpecIdListOut } from './SpecIdListOut';
export type APIResponse_SpecIdListOut_ = {
    /**
     * 请求是否成功
     */
    success?: boolean;
    /**
     * 成功时返回的数据体
     */
    data?: (SpecIdListOut | null);
    /**
     * 失败时返回的错误体
     */
    error?: (ErrorBody | null);
    /**
     * 附加元信息（分页、统计等）
     */
    meta?: (Record<string, any> | null);
};

