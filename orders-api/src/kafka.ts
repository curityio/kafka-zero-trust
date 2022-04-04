import Kafka from 'node-rdkafka';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Orders API is waiting for Kafka ...');
    await waitForKafka();

    // Set up the producer of OrderProcessed events
    const producer = new Kafka.Producer({
        'metadata.broker.list': host,
        'client.id': 'orders-api-producer',
        event_cb: true,
    });
    producer
        .on('ready', () => {
            console.log('Orders API Producer is ready');
        })
        .on('event.error', function(e: any) {
            console.log('Orders API Producer Error');
            console.log(e);
        });
    await connect_async(producer);
    
    // Set up the consumer of OrderCreated events
    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'orders-api-consumer',
        'client.id': 'orders-api-consumer',
        'metadata.broker.list': host,
        event_cb: true,
      }, {});
    consumer
        .on('ready', () => {

            console.log('Orders API Consumer is ready');
            consumer.subscribe(['OrderCreated']);
            consumer.consume();
        })
        .on('data', (message: any) => {

            // Process an incoming message
            const orderRaw = message.value.toString();
            const order = JSON.parse(orderRaw);
            console.log(`Orders API received an OrderCreated event: ${orderRaw}`);

            // Add to the API's own data
            orders.push(order);
            
            // Produce an outgoing message
            producer.produce('OrderProcessed', null, Buffer.from(orderRaw));
            console.log(`Orders API produced an OrderProcessed event: ${orderRaw}`);
            
        })
        .on('event.error', (err) => {
            console.log('Orders API Consumer Error');
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

/*
 * I still get some Kafka not ready errors so wait for a short time before connecting
 */
async function waitForKafka(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 5000);
    });
}