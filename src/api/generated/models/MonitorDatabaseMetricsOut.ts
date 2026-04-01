/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorDatabaseMetricsOut = {
    /**
     * 连接池活跃连接数
     */
    pool_active?: (number | null);
    /**
     * 连接池空闲连接数
     */
    pool_idle?: (number | null);
    /**
     * 等待中的连接请求数
     */
    pool_waiting?: (number | null);
    /**
     * 连接失败次数（预留）
     */
    connect_failures?: (number | null);
    /**
     * 慢查询数量（预留）
     */
    slow_queries?: (number | null);
    /**
     * 数据库错误率（预留）
     */
    error_rate?: (number | null);
};

