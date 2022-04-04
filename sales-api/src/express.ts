import express from 'express';
import {Guid} from 'guid-typescript';
import process from 'process';
import Kafka from 'node-rdkafka';
import {Order} from './order';

/*
 * The HTTP entry point
 */
export function run_express(orders: Order[], producer: Kafka.Producer) {

    const app = express();
    app.set('etag', false);

    /*
    * Return a list of items in memory
    */
    app.get('/', (request: express.Request, response: express.Response) => {

        console.log('Sales API returned a list of orders');
        response.setHeader('content-type', 'application/json');
        response.status(200).send(JSON.stringify(orders));
    });

    /*
    * Act as a Kafka producer to raise an OrderSubmitted event
    */
    app.post('/', async (request: express.Request, response: express.Response) => {

        const order = {
            id: Guid.create().toString(),
        };

        const orderRaw = JSON.stringify(order);
        producer.produce('OrderCreated', null, Buffer.from(orderRaw));
        console.log(`Sales API produced an OrderCreated event: ${orderRaw}`);
        
        // Add to the API's own data
        orders.push(order);

        // Return the HTTP response
        response.setHeader('content-type', 'application/json');
        response.status(200).send(JSON.stringify(orders));
    });

    /*
    * TODO: JWT / ClaimsPrincipal work for both HTTP and events
    */

    /*
    * Start listening for HTTP requests
    */
    const port = process.env.PORT || '3001';
    app.listen(port, () => {
        console.log(`Sales API is listening on HTTP port ${port}`);
    });
}
