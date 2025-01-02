/*
 * A claims principal that is useful to the Payments service
 */
export interface ClaimsPrincipal {
    userID: string;
    scope: string[];
    eventID: string;
    orderTransactionID: string;
}
