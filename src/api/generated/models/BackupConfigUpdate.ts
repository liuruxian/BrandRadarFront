/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackupDatabaseConfig } from './BackupDatabaseConfig';
import type { BackupLogsConfig } from './BackupLogsConfig';
import type { BackupScheduleConfig } from './BackupScheduleConfig';
export type BackupConfigUpdate = {
    enabled?: boolean;
    schedule?: BackupScheduleConfig;
    database?: BackupDatabaseConfig;
    logs?: BackupLogsConfig;
};

