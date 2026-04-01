/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ServiceCheckOut } from './ServiceCheckOut';
export type ServiceWatchdogStatusOut = {
    enabled: boolean;
    daemon_alive: boolean;
    next_run_in_seconds: number;
    last_checked_at?: (string | null);
    overall_status?: 'up' | 'down' | 'degraded';
    checks?: Array<ServiceCheckOut>;
};

