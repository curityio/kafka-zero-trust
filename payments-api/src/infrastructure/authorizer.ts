import express from 'express';
import {ClaimsPrincipal} from '../logic/claimsPrincipal';
import {OrderCreatedEvent} from '../logic/orderCreatedEvent';

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
        scope: 'orders payments',
        transactionID: '2679354',
    };

    // Add configuration with audience etc

    // Validate JWT using jose library

    // Check for an orders scope and return 403

    // Error responses
}

/*
 * Do additional validation before processing payment for event messages
 */
export function authorizePayment(event: OrderCreatedEvent, claims: ClaimsPrincipal) {

    /*if (claims.transactionID !== event.payload.transactionID) {
        throw new PaymentError(403, 'invalid_event', 'An event message failed security verification');
    }*/

    // Check request_content_hash
}
