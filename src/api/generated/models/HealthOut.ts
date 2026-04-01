/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 服务健康状态。
 */
export type HealthOut = {
    /**
     * ok | degraded | error
     */
    status: string;
    version: string;
    env: string;
    /**
     * 当前存储后端: file | postgresql | mongodb
     */
    db_backend: string;
    uptime_seconds: number;
};

