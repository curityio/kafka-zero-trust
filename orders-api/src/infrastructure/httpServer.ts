import express from 'express';
import Kafka from 'node-rdkafka';
import {createOrderTransaction, getOrderTransactions, publishOrderCreated} from '../logic/ordersService.js';
import {readAccessToken, validateAccessToken} from './authorizer.js';
import {logError, sendClientResponse} from './exceptionHandler.js';
import {OrderServiceError} from './orderServiceError.js';

/*
 * Set up the REST API
 */
export function startHttpServer(producer: Kafka.Producer) {

    const app = express();
    app.use('*', validateAccessToken);
    app.use('*', express.json());
    app.set('etag', false);

    /*
     * Return a list of order transactions
     */
    app.get('/orders', (request: express.Request, response: express.Response) => {

        console.log('Orders API returned a list of Order Transactions ...');
        response.setHeader('content-type', 'application/json');

        const transactions = getOrderTransactions();
        response.status(200).send(JSON.stringify(transactions));
    });

    /*
     * Create an order transaction
     */
    app.post('/orders', async (request: express.Request, response: express.Response) => {

        try {
        
            const orderTransaction = createOrderTransaction(request.body.items, response.locals.claims);
            await publishOrderCreated(orderTransaction, readAccessToken(request), producer);
            
            response.setHeader('content-type', 'application/json');
            response.status(201).send(JSON.stringify(orderTransaction));

        } catch (e: any) {

            const error = e as OrderServiceError;
            if (error) {
                logError(error);
                sendClientResponse(error, response);
            }
        }
    });

    /*
     * Start listening for HTTP requests
     */
    const port = '3001';
    app.listen(port, () => {
        console.log(`Orders API is listening on HTTP port ${port} ...`);
    });
}
