/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DataAlertOut = {
    id: string;
    brand: string;
    country: string;
    parser_id?: string;
    alert_type: 'empty_data' | 'parse_error' | 'data_shrink';
    status: 'pending' | 'approved' | 'rejected';
    old_count?: number;
    new_count?: number;
    last_error?: string;
    first_seen_at: string;
    last_seen_at: string;
    trigger_count?: number;
    decided_at?: (string | null);
    decided_by?: (string | null);
};

