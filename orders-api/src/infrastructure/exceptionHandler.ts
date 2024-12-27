import express from 'express';
import {OrderServiceError} from './orderServiceError.js';

/*
 * Basic API error logging
 */
export function logError(error: OrderServiceError) {

    let data = `Orders Service Error: ${error.getStatus()}, ${error.getCode()}, ${error.message}`;
    if (error.getCause()) {
        data += `, ${error.getCause()}`;
    }

    console.log(data);
}

/*
 * Return an error to the client
 */
export function sendClientResponse(error: OrderServiceError, response: express.Response) {

    response.setHeader('Content-Type', 'application/json');
    if (error.getStatus() === 401) {
        response.setHeader('WWW-Authenticate', 'Bearer');
    }

    const clientError = {
        code: error.getCode(),
        message: error.message,
    }

    response.status(error.getStatus()).send(JSON.stringify(clientError));
}
