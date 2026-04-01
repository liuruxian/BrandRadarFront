/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BackupTriggerRequest = {
    /**
     * 是否强制触发（忽略当前正在执行的备份）
     */
    force?: boolean;
    /**
     * all/database/logs
     */
    target?: 'all' | 'database' | 'logs';
};

