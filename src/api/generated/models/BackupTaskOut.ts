/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BackupTaskOut = {
    task_id: string;
    status: 'queued' | 'running' | 'done' | 'failed' | 'skipped';
    started_at?: (string | null);
    finished_at?: (string | null);
    db_backup_file?: (string | null);
    logs_backup_file?: (string | null);
    error?: (string | null);
    trigger?: 'manual' | 'auto';
    target?: 'all' | 'database' | 'logs';
};

