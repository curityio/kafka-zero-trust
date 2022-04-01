import {Kafka} from 'kafkajs';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<Kafka> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    const kafka = new Kafka({
        clientId: 'sales-api',
        brokers: [host],
    });

    return kafka;
}
