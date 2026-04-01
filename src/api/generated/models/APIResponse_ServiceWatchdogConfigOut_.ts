/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ErrorBody } from './ErrorBody';
import type { ServiceWatchdogConfigOut } from './ServiceWatchdogConfigOut';
export type APIResponse_ServiceWatchdogConfigOut_ = {
    /**
     * 请求是否成功
     */
    success?: boolean;
    /**
     * 成功时返回的数据体
     */
    data?: (ServiceWatchdogConfigOut | null);
    /**
     * 失败时返回的错误体
     */
    error?: (ErrorBody | null);
    /**
     * 附加元信息（分页、统计等）
     */
    meta?: (Record<string, any> | null);
};

