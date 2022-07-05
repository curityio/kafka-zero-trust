import {Guid} from 'guid-typescript';
import Kafka from 'node-rdkafka';
import {ClaimsPrincipal} from './claimsPrincipal';
import {OrderCreatedEvent} from './orderCreatedEvent';
import {OrderItem} from './orderItem';
import {OrderTransaction} from './orderTransaction';
import {calculatePrices} from './priceCalculator';

const orderTransactions: OrderTransaction[] = [];

/*
 * Do the work of creating an order
 */
export function createOrderTransaction(items: OrderItem[], claims: ClaimsPrincipal, producer: Kafka.Producer): OrderTransaction {

    // Add a record to the API's own data
    calculatePrices(items);
    const orderTransaction = {
        transactionID: Guid.create().toString(),
        userID: claims.userID,
        utcTime: new Date(),
        items,
    };
    orderTransactions.push(orderTransaction);

    // Next publish the order created event
    const orderCreatedEvent = {
        accessToken: 'ijop24frjkpn3rghk3rhg',
        payload: {
            transactionID: orderTransaction.transactionID,
            userID: orderTransaction.userID,
            utcTime: orderTransaction.utcTime.getDate(),
            items: orderTransaction.items,
        }
    } as OrderCreatedEvent;
    producer.produce('OrderCreated', null, Buffer.from(JSON.stringify(orderCreatedEvent)));

    return orderTransaction;
}

/*
 * Return the list of created orders
 */
export function getOrderTransactions(): OrderTransaction[] {
    return orderTransactions;
}
