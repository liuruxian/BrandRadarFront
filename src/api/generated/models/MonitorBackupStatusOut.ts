/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackupTaskOut } from './BackupTaskOut';
export type MonitorBackupStatusOut = {
    /**
     * 备份功能是否启用
     */
    enabled: boolean;
    /**
     * 备份调度的人类可读说明
     */
    schedule_desc: string;
    /**
     * 下次计划执行时间（UTC）
     */
    next_run_at?: (string | null);
    /**
     * 距离下次备份剩余秒数
     */
    next_run_in_seconds: number;
    /**
     * 备份守护循环是否存活
     */
    daemon_alive: boolean;
    /**
     * 当前运行中的备份任务 ID
     */
    running_task_id?: (string | null);
    /**
     * 最近一次备份任务信息
     */
    last_task?: (BackupTaskOut | null);
    /**
     * 备份调度原始配置
     */
    schedule?: Record<string, any>;
    /**
     * 数据库备份配置
     */
    database?: Record<string, any>;
    /**
     * 日志备份配置
     */
    logs?: Record<string, any>;
};

