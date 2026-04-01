/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BackupLogsConfig = {
    enabled?: boolean;
    retention_days?: number;
    backup_dir?: string;
    /**
     * 每次打包最近多少小时日志
     */
    since_hours?: number;
};

