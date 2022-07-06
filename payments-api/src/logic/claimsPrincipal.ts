/*
 * A claims principal that is useful to the Orders service
 */
export interface ClaimsPrincipal {
    userID: string;
    scope: string[];
    orderTransactionID?: string;
    requestContentHash?: string;
}
