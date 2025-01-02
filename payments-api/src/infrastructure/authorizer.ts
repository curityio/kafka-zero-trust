import express from 'express';
import {createRemoteJWKSet, jwtVerify, JWTVerifyResult} from 'jose';
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
        const accessToken = readAccessToken(request.header('authorization') || '');
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
export async function authorizeJobs(authorizationHeader: string) {

    const accessToken = readAccessToken(authorizationHeader);
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
    
    // Do standard JWT validation
    let result: JWTVerifyResult;
    try {
        result = await jwtVerify(accessToken, remoteJWKSet, options);
    } catch (e: any) {
        throw new PaymentServiceError(401, 'invalid_token', 'Missing, invalid or expired access token', e);
    }

    // Check for the required scope
    const scope = (result.payload.scope as string).split(' ');
    if (scope.indexOf('payments') === -1) {
        throw new PaymentServiceError(403, 'insufficient_scope', 'The access token has insufficient scope');
    }

    // Also check for required claims
    if (!result.payload.event_id || !result.payload.transaction_id) {
        throw new PaymentServiceError(403, 'insufficient_claims', 'The access token does not have the required claims');
    }

    return {
        userID: result.payload.sub as string,
        scope,
        eventID: result.payload.event_id as string,
        orderTransactionID: result.payload.transaction_id as string,
    };
}

/*
 * Read the token from the bearer header when required
 */
function readAccessToken(authorizationHeader: string): string {

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

    // The access token can only be used for the current event message
    if (claims.eventID != event.eventID) {
        throw new PaymentServiceError(403, 'invalid_message', 'The event message has invalid data');
    }

    // The access token can only be used for a single transaction ID
    if (claims.orderTransactionID !== event.orderTransactionID) {
        throw new PaymentServiceError(403, 'invalid_message', 'The event message has invalid data');
    }
}
