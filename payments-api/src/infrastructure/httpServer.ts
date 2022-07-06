import express from 'express';
import {authorizeHttpRequest} from './authorizer';
import {getPaymentTransactions} from '../logic/paymentsService';

/*
 * Set up the REST API
 */
export function startHttpServer() {

    const app = express();
    app.use('*', authorizeHttpRequest);
    app.use('*', express.json());
    app.set('etag', false);

    /*
     * Return a list of payment transactions
     */
    app.get('/', (request: express.Request, response: express.Response) => {

        console.log('Payments API returned a list of Payment Transactions ...');
        response.setHeader('content-type', 'application/json');

        const transactions = getPaymentTransactions();
        response.status(200).send(JSON.stringify(transactions));
    });

    /*
     * Start listening for HTTP requests
     */
    const port = '3002';
    app.listen(port, () => {
        console.log(`Payments API is listening on HTTP port ${port} ...`);
    });
}
