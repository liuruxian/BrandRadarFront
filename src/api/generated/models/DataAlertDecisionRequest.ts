/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DataAlertDecisionRequest = {
    /**
     * approved=允许覆盖 rejected=继续保留旧数据
     */
    decision: 'approved' | 'rejected';
    /**
     * 操作人
     */
    operator?: string;
    /**
     * 备注
     */
    note?: string;
};

