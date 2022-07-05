import express from 'express';
import {ClaimsPrincipal} from '../logic/claimsPrincipal';

/*
 * Do JWT validation for HTTP requests
 */
export function authorizeHttpRequest(request: express.Request, response: express.Response, next: express.NextFunction) {

    response.locals.claims = authorize('huodsfghiweghijf');
    next();
}

/*
 * Do JWT validation and create a claims principal
 */
export function authorize(accessToken: string): ClaimsPrincipal {

    return {
        userID: 'user789',
        scope: 'orders payments'
    };

    // Add configuration with audience etc

    // Validate JWT using jose library

    // Check for an orders scope and return 403

    // Error responses
}
