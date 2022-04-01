import {Kafka} from 'kafkajs';
import {Order} from './order';

/*
 * The events entry point
 */
export async function run_kafka(orders: Order[]): Promise<Kafka> {

    const host = process.env.IS_LOCAL ? 'localhost:29092' : 'kafka:9092';
    const kafka = new Kafka({
        clientId: 'orders-api',
        brokers: [host],
    });

    const consumer = kafka.consumer({ groupId: 'kafka-demo' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'OrderCreated', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            
            // Process an incoming message
            if (!message.value) {
                throw new Error('Orders API received an invalid message');
            }

            const orderRaw = message.value.toString();
            const order = JSON.parse(orderRaw);
            console.log(`Orders API received an OrderCreated event: ${orderRaw}`);

            // Inform downstream APIs that the order has been processed
            const producer = kafka.producer();
            await producer.connect();
            await producer.send({
                topic: 'OrderProcessed',
                messages: [
                {value: JSON.stringify(order)},
                ],
            });
            await producer.disconnect();
            orders.push(order);
        }
    });

    return kafka;
}
