import Kafka from 'node-rdkafka';
import {logError} from './exceptionHandler';
import {OrderServiceError} from './orderServiceError';

/*
 * Set up the message broker ready for publishing
 */
export async function startMessageBroker(): Promise<Kafka.Producer> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Orders API is waiting for the message broker ...');
    
    if (!process.env.IS_LOCAL) {
        await waitForMessageBroker();
    }

    const producer = new Kafka.Producer({
        'metadata.broker.list': host,
        'client.id': 'orders-api-producer',
        event_cb: true,
    });
    producer
        .on('ready', () => {
            console.log('Orders API Producer is ready ...');
        })
        .on('event.error', function(e: any) {
            
            const error = new OrderServiceError(500, 'event_error', 'A problem was encountered with the message broker', e);
            logError(error);
        });
    await connect(producer);

    return producer;
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
async function connect(
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
