/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorHostMetricsOut = {
    /**
     * CPU 使用率（%）
     */
    cpu_percent?: (number | null);
    /**
     * 内存使用率（%）
     */
    memory_percent?: (number | null);
    /**
     * 已用内存（字节）
     */
    memory_used_bytes?: (number | null);
    /**
     * 总内存（字节）
     */
    memory_total_bytes?: (number | null);
    /**
     * 磁盘总容量（字节）
     */
    disk_total_bytes?: (number | null);
    /**
     * 磁盘已用容量（字节）
     */
    disk_used_bytes?: (number | null);
    /**
     * 磁盘剩余容量（字节）
     */
    disk_free_bytes?: (number | null);
    /**
     * 磁盘使用率（%）
     */
    disk_used_percent?: (number | null);
    /**
     * 系统负载（1/5/15分钟）
     */
    load_avg?: (Array<number> | null);
    /**
     * 服务运行时长（秒）
     */
    service_uptime_seconds?: (number | null);
};

