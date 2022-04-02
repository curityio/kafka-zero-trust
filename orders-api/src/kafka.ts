import Kafka from 'node-rdkafka';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Orders API is connecting to Kafka');
    
    var consumer = new Kafka.KafkaConsumer({
        'group.id': 'kafka-demo',
        'metadata.broker.list': host
      }, {});
    await connect_async(consumer, undefined);
    console.log('Orders API consumer is connected');

    const producer = new Kafka.Producer({
        'metadata.broker.list': host
    });
    await connect_async(producer, undefined);
    console.log('Orders API producer is connected');

    consumer
        .on('ready', () => {

            consumer.subscribe(['OrderCreated']);
            consumer.consume();
        })
        .on('data', (message: any) => {

            // Process an incoming message
            const orderRaw = message.value.toString();
            const order = JSON.parse(orderRaw);
            console.log(`Orders API received an OrderCreated event: ${orderRaw}`);

            // Inform downstream APIs that the order has been processed
            producer.produce('OrderProcessed', null, Buffer.from(orderRaw));
            console.log('Orders API sent an OrderCreated event');

            // Add to the API's own data
            orders.push(order);
        });
}

/*
 * A utility to enable an async await style of coding
 */
async function connect_async(
    client: Kafka.Client<any>,
    optionsParam: Kafka.MetadataOptions | undefined): Promise<Kafka.Metadata> {

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
