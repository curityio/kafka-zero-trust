import Kafka from 'node-rdkafka';
import {authorize} from './authorizer.js';
import {createPaymentTransaction} from '../logic/paymentsService.js';
import {logError} from './exceptionHandler.js';
import {PaymentServiceError} from './paymentServiceError.js';

/*
 * Set up the message broker ready for consuming
 */
export async function startMessageBroker(): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Payments API is waiting for the message broker ...');
    
    if (!process.env.IS_LOCAL) {
        await waitForMessageBroker();
    }

    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'payments-api-consumer',
        'client.id': 'payments-api-consumer',
        'metadata.broker.list': host,
        event_cb: true,
      }, {});
    consumer
        .on('ready', () => {

            console.log('Payments API Consumer is ready ...');
            consumer.subscribe(['OrderCreated']);
            consumer.consume();
        })
        .on('data', async (message: any) => {

            const orderEvent = JSON.parse(message.value.toString());
            console.log(`Payments API is consuming an OrderCreated event ...`);

            try {
                // Try the authorization
                const claims = await authorize(orderEvent.accessToken);

                // Then process the payment
                createPaymentTransaction(orderEvent, claims);

            } catch (e: any) {

                // This code example logs the details and removes the message from the queue
                const error = e as PaymentServiceError;
                logError(error);
            }
        })
        .on('event.error', (e) => {

            const error = new PaymentServiceError(500, 'event_error', 'A problem was encountered with the message broker', e);
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
