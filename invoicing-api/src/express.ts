import express from 'express';
import process from 'process';
import {Order} from './order';

/*
 * The HTTP entry point
 */
export function run_express(orders: Order[]) {

    const app = express();
    app.set('etag', false);

    /*
    * Return a list of items in memory
    */
    app.get('/', (request: express.Request, response: express.Response) => {

        console.log('Invoicing API returned a list of orders');
        response.setHeader('content-type', 'application/json');
        response.status(200).send(JSON.stringify(orders));
    });

    /*
    * TODO: JWT / ClaimsPrincipal work for both HTTP and events
    */

    /*
    * Start listening for HTTP requests
    */
    const port = process.env.PORT || '3003';
    app.listen(port, () => {
        console.log(`Invoicing API is listening on HTTP port ${port}`);
    });
}
