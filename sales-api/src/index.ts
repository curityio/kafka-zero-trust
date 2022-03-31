import express from 'express';
import process from 'process';

const app = express();
app.set('etag', false);

/*
 * An HTTP request endpoint to return a list of items
 */
app.get('/', (request: express.Request, response: express.Response) => {

    console.log('Sales API returned a list of orders');

    const data = [{
        id: '1234',
        description: 'Order 1234',
    }];
    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(data, null, 2));
});

/*
 * This will act as a Kafka producer to raise an OrderSubmitted event
 */
app.post('/', (request: express.Request, response: express.Response) => {
});

/*
 * TODO: JWT / ClaimsPrincipal work for both HTTP and events
 */

/*
 * TODO: Create an OrderSubmitted topic if required, when the API starts
 */

/*
 * Start listening for HTTP requests
 */
const port = process.env.PORT || '3001';
app.listen(port, () => {
    console.log(`Sales API is listening on HTTP port ${port}`);
});
