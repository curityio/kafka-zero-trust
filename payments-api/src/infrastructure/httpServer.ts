import express from 'express';
import {authorizeHttpRequest} from './authorizer';

/*
 * Set up the REST API, though there are no endpoints in this code example
 */
export function startHttpServer() {

    const app = express();
    app.use('*', authorizeHttpRequest);
    app.use('*', express.json());
    app.set('etag', false);

    /*
     * Start listening for HTTP requests
     */
    const port = '3002';
    app.listen(port, () => {
        console.log(`Payments API is listening on HTTP port ${port} ...`);
    });
}
