/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BackupScheduleConfig = {
    schedule_type?: 'interval' | 'daily' | 'weekly';
    /**
     * 间隔模式：每隔多少分钟
     */
    interval_minutes?: number;
    /**
     * 每日/每周模式：HH:MM
     */
    time_of_day?: string;
    /**
     * 每周模式：1-7(周一到周日)
     */
    weekly_days?: Array<number>;
    /**
     * IANA 时区，例如 Asia/Shanghai
     */
    timezone?: string;
};

