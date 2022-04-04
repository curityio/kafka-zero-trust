import Kafka from 'node-rdkafka';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';

    // Set up the consumer of OrderCreated events
    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'invoicing-api-consumer',
        'client.id': 'invoicing-api-consumer',
        'metadata.broker.list': host,
        event_cb: true,
      }, {});
    consumer
        .on('ready', () => {

            console.log('Invoicing API Consumer is ready');
            consumer.subscribe(['OrderProcessed']);
            consumer.consume();
        })
        .on('data', (message: any) => {

            // Process an incoming message
            const orderRaw = message.value.toString();
            const order = JSON.parse(orderRaw);
            console.log(`Invoicing API received an OrderProcessed event: ${orderRaw}`);

            // Add to the API's own data
            orders.push(order);
            
        })
        .on('event.error', (err) => {
            console.log('Invoicing API Consumer Error');
            console.log(err);
        });
    await connect_async(consumer);
}

/*
 * A utility to enable an async await style of coding
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
