/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackupHeartbeatStatusOut } from './BackupHeartbeatStatusOut';
import type { MonitorAlertStatsOut } from './MonitorAlertStatsOut';
import type { MonitorBackupStatusOut } from './MonitorBackupStatusOut';
import type { MonitorBackupTaskMetricsOut } from './MonitorBackupTaskMetricsOut';
import type { MonitorCrawlTaskStatsOut } from './MonitorCrawlTaskStatsOut';
import type { MonitorDatabaseMetricsOut } from './MonitorDatabaseMetricsOut';
import type { MonitorHostMetricsOut } from './MonitorHostMetricsOut';
import type { MonitorLogMetricsOut } from './MonitorLogMetricsOut';
import type { MonitorSchedulerStatusOut } from './MonitorSchedulerStatusOut';
import type { MonitorSystemHealthOut } from './MonitorSystemHealthOut';
import type { MonitorTaskPerformanceOut } from './MonitorTaskPerformanceOut';
import type { ServiceWatchdogStatusOut } from './ServiceWatchdogStatusOut';
export type MonitorOverviewOut = {
    /**
     * 监控分组标题映射（前端可直接用于卡片标题）
     */
    display_titles?: Record<string, string>;
    system_health: MonitorSystemHealthOut;
    scheduler_status: MonitorSchedulerStatusOut;
    backup_status: MonitorBackupStatusOut;
    backup_heartbeat_status: BackupHeartbeatStatusOut;
    service_watchdog_status: ServiceWatchdogStatusOut;
    crawl_task_stats: MonitorCrawlTaskStatsOut;
    alert_stats: MonitorAlertStatsOut;
    host_metrics: MonitorHostMetricsOut;
    database_metrics: MonitorDatabaseMetricsOut;
    task_performance_metrics: MonitorTaskPerformanceOut;
    backup_task_metrics: MonitorBackupTaskMetricsOut;
    log_metrics: MonitorLogMetricsOut;
};

