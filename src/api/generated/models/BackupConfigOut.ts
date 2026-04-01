/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackupDatabaseConfig } from './BackupDatabaseConfig';
import type { BackupLogsConfig } from './BackupLogsConfig';
import type { BackupScheduleConfig } from './BackupScheduleConfig';
export type BackupConfigOut = {
    enabled?: boolean;
    schedule?: BackupScheduleConfig;
    database?: BackupDatabaseConfig;
    logs?: BackupLogsConfig;
    schedule_desc?: string;
    next_run_at?: (string | null);
};

