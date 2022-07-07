import express from 'express';

import {createRemoteJWKSet, jwtVerify, JWTVerifyResult} from 'jose';
import fetch from 'node-fetch'
import {ClaimsPrincipal} from '../logic/claimsPrincipal';
import {logError, sendClientResponse} from './exceptionHandler';
import {oauthConfiguration} from './oauthConfiguration';
import {OrderServiceError} from './orderServiceError';

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
export async function authorizeHttpRequest(request: express.Request, response: express.Response, next: express.NextFunction) {

    try {
        const accessToken = readAccessToken(request);
        response.locals.claims = await authorize(accessToken);
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
 * Do JWT validation and create a claims principal
 */
async function authorize(accessToken: string): Promise<ClaimsPrincipal> {

    const options = {
        algorithms: [oauthConfiguration.algorithm],
        issuer: oauthConfiguration.issuer,
        audience: oauthConfiguration.audience,
    };
    
    let result: JWTVerifyResult;
    try {
        result = await jwtVerify(accessToken, remoteJWKSet, options);
    } catch (e: any) {
        throw new OrderServiceError(401, 'authentication_error', 'Missing, invalid or expired access token', e)
    }

    const claimsPrincipal: ClaimsPrincipal = {
        userID: result.payload.sub as string,
        scope: (result.payload.scope as string).split(' '),
    }

    if (claimsPrincipal.scope.indexOf('orders') === -1) {
        throw new OrderServiceError(403, 'authorization_error', 'The token has insufficient scope')
    }

    return claimsPrincipal;
}

/*
 * Do a token exchange to get a reduced scope access token to include in the event published to the message broker
 */
export async function tokenExchange(accessToken: string, orderTransactionID: string, eventPayloadHash: string): Promise<string> {

    let body = 'grant_type=https://curity.se/grant/accesstoken';
    body += `&client_id=${oauthConfiguration.clientID}`;
    body += `&client_secret=${oauthConfiguration.clientSecret}`;
    body += `&scope=trigger_payments`;
    body += `&token=${accessToken}`;
    
    // These custom fields are include in the reduced scope token via a token procedure
    body += `&order_transaction_id=${orderTransactionID}`;
    body += `&event_payload_hash=${eventPayloadHash}`;

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