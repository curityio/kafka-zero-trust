import express from 'express';
import {createRemoteJWKSet, jwtVerify, JWTVerifyResult} from 'jose';
import hash from 'js-sha256';
import {ClaimsPrincipal} from '../logic/claimsPrincipal.js';
import {OrderCreatedEvent} from '../logic/orderCreatedEvent.js';
import {logError, sendClientResponse} from './exceptionHandler.js';
import {oauthConfiguration} from './oauthConfiguration.js';
import {PaymentServiceError} from './paymentServiceError.js';

const remoteJWKSet = createRemoteJWKSet(new URL(oauthConfiguration.jwksEndpoint));

/*
 * Do JWT validation for HTTP requests
 */
export async function authorizeHttpRequest(request: express.Request, response: express.Response, next: express.NextFunction) {

    try {
        const accessToken = readAccessToken(request);
        response.locals.claims = await authorize(accessToken, oauthConfiguration.audienceHttp);
        next();

    } catch (e: any) {

        const error = e as PaymentServiceError;
        logError(error);
        sendClientResponse(error, response);
    }
}

/*
 * Do JWT validation for async jobs
 */
export async function authorizeJobs(accessToken: string) {
    return await authorize(accessToken, oauthConfiguration.audienceAsyncJobs);
}

/*
 * Common JWT validation and creation of the claims principal
 */
export async function authorize(accessToken: string, expectedAudience: string): Promise<ClaimsPrincipal> {

    const options = {
        algorithms: [oauthConfiguration.algorithm],
        issuer: oauthConfiguration.issuer,
        audience: expectedAudience,
    };
    
    let result: JWTVerifyResult;
    try {
        result = await jwtVerify(accessToken, remoteJWKSet, options);
    } catch (e: any) {
        throw new PaymentServiceError(401, 'authentication_error', 'Missing, invalid or expired access token', e);
    }

    const claimsPrincipal: ClaimsPrincipal = {
        userID: result.payload.sub as string,
        scope: (result.payload.scope as string).split(' '),
    }

    // Read extended claims into the prinicipal if they exist
    if (result.payload.transaction_id) {
        claimsPrincipal.orderTransactionID = result.payload.transaction_id as string;
    }

    if (result.payload.event_payload_hash) {
        claimsPrincipal.eventPayloadHash = result.payload.event_payload_hash as string;
    }

    return claimsPrincipal;
}

/*
 * Read the token from the bearer header when required
 */
function readAccessToken(request: express.Request): string {

    const authorizationHeader = request.header('authorization');
    if (authorizationHeader) {
        const parts = authorizationHeader.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            return parts[1];
        }
    }

    return '';
}

/*
 * Do additional validation before processing payment for event messages
 */
export function authorizePayment(event: OrderCreatedEvent, claims: ClaimsPrincipal) {

    if (claims.scope.indexOf('payments') === -1) {
        throw new PaymentServiceError(403, 'authorization_error', 'The token has insufficient scope');
    }

    // The payload of the event must match that from the access token
    const eventPayloadHash = hash.sha256(JSON.stringify(event.payload));
    if (claims.eventPayloadHash != eventPayloadHash) {
        throw new PaymentServiceError(403, 'invalid_event_message', 'The event message contains an unexpected payload');
    }

    // The transaction ID from the event must match that from the access token
    if (claims.orderTransactionID !== event.payload.orderTransactionID) {
        throw new PaymentServiceError(403, 'invalid_event_transaction', 'The event message contain unexpected transaction data');
    }
}
