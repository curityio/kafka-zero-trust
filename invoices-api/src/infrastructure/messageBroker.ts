import Kafka from 'node-rdkafka';
import {authorizeInvoiceJob, authorizeJobsRequest} from './authorizer.js';
import {createInvoiceJob} from '../logic/invoicingService.js';
import {logError} from './exceptionHandler.js';
import {InvoiceServiceError} from './invoiceServiceError.js';

/*
 * Set up the message broker ready for consuming
 */
export async function startMessageBroker(): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Invoices API is waiting for the message broker ...');
    
    if (!process.env.IS_LOCAL) {
        await waitForMessageBroker();
    }

    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'invoices-api-consumer',
        'client.id': 'invoices-api-consumer',
        'metadata.broker.list': host,
        event_cb: true,
      }, {});
    consumer
        .on('ready', () => {

            console.log('Invoices API Consumer is ready ...');
            consumer.subscribe(['OrderCreated']);
            consumer.consume();
        })
        .on('data', async (message: Kafka.Message) => {

            if (message.value) {

                try {

                    // Get the authorization header from the Kafka message and validate the access token
                    const key = 'Authorization';
                    const authorizationHeader = message.headers?.find((h) => h[key])?.[key]?.toString() || '';
                    const claims = await authorizeJobsRequest(authorizationHeader);

                    // Implement business authorization and then process the order event to create an invoice
                    const orderEvent = JSON.parse(message.value.toString());
                    authorizeInvoiceJob(orderEvent, claims);
                    createInvoiceJob(orderEvent, claims);

                } catch (e: any) {

                    // Log invalid messages and remove them from the queue
                    const error = e as InvoiceServiceError;
                    logError(error);
                }
            }
        })
        .on('event.error', (e) => {

            const error = new InvoiceServiceError(500, 'event_error', 'A problem was encountered with the message broker', e);
            logError(error);
        });
    await connect_async(consumer);
}

/*
 * When running in Docker, this helps to ensure that Kafka is reliably started
 */
async function waitForMessageBroker(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 5000);
    });
}

/*
 * Return a promise to enable an async await style of coding
 */
async function connect_async(
    client: Kafka.Client<any>,
    optionsParam: Kafka.MetadataOptions | undefined = undefined): Promise<Kafka.Metadata> {

    const options = optionsParam || {timeout: 5000};
    return new Promise((resolve, reject) => {

        client.connect(options, (err, data) => {

            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
