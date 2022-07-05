import Kafka from 'node-rdkafka';
import {authorize} from './authorizer';
import {createPaymentTransaction} from '../logic/paymentsService';

/*
 * Set up the message broker ready for consuming
 */
export async function startMessageBroker(): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Payments API is waiting for the message broker ...');
    await waitForMessageBroker();

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
        .on('data', (message: any) => {

            const orderEvent = JSON.parse(message.value.toString());
            console.log(`Payments API consumed an OrderCreated event ...`);

            const claims = authorize(orderEvent.accessToken);
            createPaymentTransaction(orderEvent, claims);
        })
        .on('event.error', (err) => {

            console.log('Payments API Consumer Error ...');
            console.log(err);
        });
    await connect_async(consumer);
}

/*
 * Wait a short time after startup, before connecting to Kafka
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
