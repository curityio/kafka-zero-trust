import Kafka from 'node-rdkafka';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<Kafka.Producer> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    
    const producer = new Kafka.Producer({
        'metadata.broker.list': host
    });
    await connect_async(producer, undefined);
    console.log('Sales API producer is connected');

    return producer;
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
