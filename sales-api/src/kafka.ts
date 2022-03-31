import {Kafka} from 'kafkajs';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<Kafka> {

    const kafka = new Kafka({
        clientId: 'sales-api',
        brokers: ['localhost:9092'],
    });

    return kafka;
}
