/*
 * A claims principal that is useful to the Invoices service
 */
export interface ClaimsPrincipal {
    userID: string;
    scope: string[];
    transactionID?: string;
}
