/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StreamPublishRequest = {
    /**
     * 事件名，例如 crawl_task_completed
     */
    event?: string;
    /**
     * 事件主题，用于客户端分组订阅
     */
    topic?: string;
    /**
     * 事件负载数据
     */
    data?: Record<string, any>;
};

