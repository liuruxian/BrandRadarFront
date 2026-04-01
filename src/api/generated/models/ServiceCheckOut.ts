/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ServiceCheckOut = {
    name: string;
    status: 'up' | 'down' | 'degraded';
    message?: string;
    checked_at: string;
    consecutive_failures?: number;
};

