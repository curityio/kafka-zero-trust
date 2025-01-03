import express from 'express';
import {createRemoteJWKSet, jwtVerify, JWTVerifyResult} from 'jose';
import {ClaimsPrincipal} from '../logic/claimsPrincipal.js';
import {logError, sendClientResponse} from './exceptionHandler.js';
import {OAuthConfiguration, oauthHttpConfiguration, oauthJobsConfiguration} from './oauthConfiguration.js';
import {InvoiceServiceError} from './invoiceServiceError.js';

const remoteJWKSet = createRemoteJWKSet(new URL(oauthHttpConfiguration.jwksEndpoint));

/*
 * Do JWT validation for HTTP requests with normal short lived access tokens
 */
export async function validateHttpAccessToken(request: express.Request, response: express.Response, next: express.NextFunction) {

    try {
        const accessToken = readAccessToken(request.header('authorization') || '');
        const result = await validateAccessToken(accessToken, oauthHttpConfiguration);

        const scope = (result.payload.scope as string).split(' ');
        if (scope.indexOf(oauthHttpConfiguration.scope) === -1) {
            throw new InvoiceServiceError(403, 'insufficient_scope', 'The access token has insufficient scope');
        }
        
        response.locals.claims = {
            userID: result.payload.sub as string,
            scope: result.payload.scope,
        };

    return {
        userID: result.payload.sub as string,
        scope,
        eventID: result.payload.event_id as string || '',
        transactionID: result.payload.transaction_id as string || '',
    };


        next();

    } catch (e: any) {

        const error = e as InvoiceServiceError;
        logError(error);
        sendClientResponse(error, response);
    }
}

/*
 * Do JWT validation for async jobs with long lived low privilege access tokens
 */
export async function validateAsyncAccessToken(authorizationHeader: string, eventID: string): Promise<ClaimsPrincipal> {

    const accessToken = readAccessToken(authorizationHeader);
    const result = await validateAccessToken(accessToken, oauthJobsConfiguration);

    const scope = (result.payload.scope as string).split(' ');
    if (scope.indexOf(oauthJobsConfiguration.scope) === -1) {
        throw new InvoiceServiceError(403, 'insufficient_scope', 'The access token has insufficient scope');
    }

    if (!result.payload.event_id || !result.payload.transaction_id) {
        throw new InvoiceServiceError(403, 'insufficient_scope', 'The access token does not have the required claims');
    }

    if (result.payload.event_id !== eventID) {
        throw new InvoiceServiceError(403, 'invalid_message', 'The event message does not match the event ID in the access token');
    }

    return {
        userID: result.payload.sub as string,
        scope,
        transactionID: result.payload.transaction_id as string,
    };
}

/*
 * Common JWT validation
 */
async function validateAccessToken(accessToken: string, oauthConfiguration: OAuthConfiguration): Promise<JWTVerifyResult> {

    const options = {
        algorithms: [oauthConfiguration.algorithm],
        issuer: oauthConfiguration.issuer,
        audience: oauthConfiguration.audience,
    };
    
    try {
        return await jwtVerify(accessToken, remoteJWKSet, options);
    } catch (e: any) {
        throw new InvoiceServiceError(401, 'invalid_token', 'Missing, invalid or expired access token', e);
    }
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
