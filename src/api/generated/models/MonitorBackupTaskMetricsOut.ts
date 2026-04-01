/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorBackupTaskMetricsOut = {
    /**
     * 最近备份任务状态
     */
    last_status?: (string | null);
    /**
     * 最近备份完成时间
     */
    last_finished_at?: (string | null);
    /**
     * 最近数据库备份文件路径
     */
    last_db_backup_file?: (string | null);
    /**
     * 最近日志备份文件路径
     */
    last_logs_backup_file?: (string | null);
    /**
     * 最近一次失败错误
     */
    last_error?: (string | null);
    /**
     * 近7天成功率（0~1）
     */
    seven_day_success_rate?: (number | null);
    /**
     * 近7天成功次数
     */
    seven_day_done: number;
    /**
     * 近7天失败次数
     */
    seven_day_failed: number;
};

