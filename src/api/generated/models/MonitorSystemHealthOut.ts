/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorSystemHealthOut = {
    /**
     * API 主服务是否存活
     */
    api_alive: boolean;
    /**
     * 采集调度后台是否存活
     */
    scheduler_alive: boolean;
    /**
     * 备份调度后台是否存活
     */
    backup_alive: boolean;
    /**
     * 服务看门狗后台是否存活
     */
    watchdog_alive: boolean;
};

