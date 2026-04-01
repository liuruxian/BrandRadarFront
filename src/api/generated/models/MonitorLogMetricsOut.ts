/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorLogMetricsOut = {
    /**
     * 最近采样窗口 ERROR 数
     */
    error_per_minute: number;
    /**
     * 最近采样窗口 WARN 数
     */
    warn_per_minute: number;
    /**
     * 最近异常摘要
     */
    recent_exceptions?: Array<string>;
    /**
     * 日志增长字节数（当前实现为当前文件大小）
     */
    log_growth_bytes_last_minute?: (number | null);
};

