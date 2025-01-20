import express from 'express';

import {createRemoteJWKSet, jwtVerify, JWTVerifyResult} from 'jose';
import fetch from 'node-fetch'
import {ClaimsPrincipal} from '../logic/claimsPrincipal.js';
import {logError, sendClientResponse} from './exceptionHandler.js';
import {oauthConfiguration} from './oauthConfiguration.js';
import {OrderServiceError} from './orderServiceError.js';

const remoteJWKSet = createRemoteJWKSet(new URL(oauthConfiguration.jwksEndpoint));

/*
 * Read the token from the bearer header when required
 */
export function readAccessToken(request: express.Request): string {

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
 * Do JWT validation for HTTP requests
 */
export async function validateAccessToken(request: express.Request, response: express.Response, next: express.NextFunction) {

    try {
        const accessToken = readAccessToken(request);
        
        const options = {
            algorithms: [oauthConfiguration.algorithm],
            issuer: oauthConfiguration.issuer,
            audience: oauthConfiguration.audience,
        };
    
        // Do standard JWT validation
        let result: JWTVerifyResult;
        try {
            result = await jwtVerify(accessToken, remoteJWKSet, options);
        } catch (e: any) {
            throw new OrderServiceError(401, 'authentication_error', 'Missing, invalid or expired access token', e)
        }
    
        // Check for the required scope
        const scope = (result.payload.scope as string).split(' ');
        if (scope.indexOf(oauthConfiguration.scope) === -1) {
            throw new OrderServiceError(403, 'insufficient_scope', 'The access token has insufficient scope');
        }
    
        const claimsPrincipal: ClaimsPrincipal = {
            userID: result.payload.sub as string,
            scope,
        };
    
        if (claimsPrincipal.scope.indexOf('orders') === -1) {
            throw new OrderServiceError(403, 'authorization_error', 'The token has insufficient scope')
        }
    
        response.locals.claims = claimsPrincipal;
        next();

    } catch (e: any) {

        const error = e as OrderServiceError;
        if (error) {
            logError(error);
            sendClientResponse(error, response);
        }
    }
}

/*
 * Do a token exchange to get a reduced scope access token to include in the event published to the message broker
 */
export async function tokenExchange(accessToken: string, eventID: string, transactionID: string): Promise<string> {

    // Supply standard token exchange parameters from RFC 8693
    let body = 'grant_type=urn:ietf:params:oauth:grant-type:token-exchange';
    body += `&client_id=${oauthConfiguration.clientID}`;
    body += `&client_secret=${oauthConfiguration.clientSecret}`;
    body += `&subject_token=${accessToken}`;
    body += '&subject_token_type=urn:ietf:params:oauth:token-type:access_token';
    body += '&audience=jobs.example.com';
    body += '&scope=trigger_invoicing';

    // Send custom fields to bind the exchanged token to exact identifiers to reduce token privileges
    body += `&event_id=${eventID}`;
    body += `&transaction_id=${transactionID}`;

    try {
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body,
        };

        const result = await fetch(oauthConfiguration.tokenEndpoint, options);

        if (result.status >= 500) {
            const text = await result.text()
            throw new OrderServiceError(500, 'authorization_server_error', 'Problem encountered calling the Authorization Server', text);
        }
    
        if (result.status >= 400) {
            const errorData = await result.json() as any;
            const code = errorData.error || 'authorization_request_error';
            throw new OrderServiceError(result.status, code, 'The request was rejected by the Authorization Server', JSON.stringify(errorData));
        }

        const responseData = await result.json() as any;
        return responseData.access_token;

    } catch (e: any) {

        if (e instanceof OrderServiceError) {
            throw e;
        }

        throw new OrderServiceError(500, 'authorization_connection_error', 'Problem encountered connecting to the Authorization Server', e);
    }
}