/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackupHeartbeatRecordOut } from './BackupHeartbeatRecordOut';
export type BackupHeartbeatStatusOut = {
    enabled: boolean;
    daemon_alive: boolean;
    remote_host?: string;
    interval_minutes: number;
    timeout_seconds: number;
    failure_threshold: number;
    consecutive_failures: number;
    health: 'healthy' | 'degraded' | 'down';
    last_record?: (BackupHeartbeatRecordOut | null);
};

