import express from 'express';
import process from 'process';

const app = express();
app.set('etag', false);

/*
 * An HTTP request endpoint to return a list of items
 */
app.get('/', (request: express.Request, response: express.Response) => {

    console.log('Invoicing API returned a list of orders');

    const data = [{
        id: '1234',
        description: 'Order 1234',
    }];
    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(data, null, 2));
});

/*
 * TODO: Kafka consumer: https://github.com/tulios/kafkajs#-usage
 */

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
