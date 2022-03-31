import express from 'express';
import process from 'process';

const app = express();
app.set('etag', false);

/*
 * An HTTP request endpoint to return a list of items
 */
app.get('/', (request: express.Request, response: express.Response) => {

    console.log('Orders API returned a list of orders');

    const data = [{
        id: '1234',
        description: 'Order 1234',
    }];
    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(data, null, 2));
});

/*
 * TODO: Kafka producer and consumer: https://github.com/tulios/kafkajs#-usage
 */

/*
 * TODO: JWT / ClaimsPrincipal work for both HTTP and events
 */

/*
 * TODO: Create an OrderCreated topic if required, when the API starts
 */

/*
 * Start listening for HTTP requests
 */
const port = process.env.PORT || '3002';
app.listen(port, () => {
    console.log(`Orders API is listening on HTTP port ${port}`);
});
