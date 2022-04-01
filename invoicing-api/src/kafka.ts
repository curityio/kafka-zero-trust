import {Kafka} from 'kafkajs';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<Kafka> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    const kafka = new Kafka({
        clientId: 'invoicing-api',
        brokers: [host],
    });

    const consumer = kafka.consumer({ groupId: 'kafka-demo' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'OrderProcessed', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            
            if (!message.value) {
                throw new Error('Invoicing API received an invalid message');
            }

            const orderRaw = message.value.toString();
            const order = JSON.parse(orderRaw);
            orders.push(order);
            console.log(`Invoicing API received an OrderProcessed event: ${orderRaw}`);
        }
    });

    return kafka;
}
