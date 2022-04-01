import express from 'express';
import {Kafka} from 'kafkajs';
import process from 'process';
import {Order} from './order';

/*
 * The HTTP entry point
 */
export function run_express(orders: Order[], kafka: Kafka) {

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
            id: '1234',
        };

        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
            topic: 'OrderCreated',
            messages: [
              {value: JSON.stringify(order)},
            ],
        });
        await producer.disconnect();
        orders.push(order);
        
        console.log('Sales API sent an OrderCreated event');
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
