import Kafka from 'node-rdkafka';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<void> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    console.log('Invoicing API is connecting to Kafka');

    //GlobalConfig
    //"client.id": 'invoicing-api'

    var consumer = new Kafka.KafkaConsumer({
        'group.id': 'kafka-demo',
        'metadata.broker.list': host
      }, {});
    await connect_async(consumer, undefined);
    console.log('Invoicing API consumer is connected');

    consumer
        .on('ready', () => {

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
