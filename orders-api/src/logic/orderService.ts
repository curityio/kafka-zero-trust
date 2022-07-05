import {Guid} from 'guid-typescript';
import hash from 'js-sha256';
import Kafka from 'node-rdkafka';
import {tokenExchange} from '../infrastructure/authorizer';
import {ClaimsPrincipal} from './claimsPrincipal';
import {OrderCreatedEvent} from './orderCreatedEvent';
import {OrderItem} from './orderItem';
import {OrderTransaction} from './orderTransaction';
import {calculatePrices} from './priceCalculator';

const orderTransactions: OrderTransaction[] = [];

/*
 * Do the work of creating an order in this service
 */
export function createOrderTransaction(items: OrderItem[], claims: ClaimsPrincipal): OrderTransaction {

    calculatePrices(items);
    const orderTransaction = {
        orderTransactionID: Guid.create().toString(),
        userID: claims.userID,
        utcTime: new Date(),
        items,
    };

    orderTransactions.push(orderTransaction);
    return orderTransaction;
}

/*
 * Next publish the order created event
 */
export async function publishOrderCreated(orderTransaction: OrderTransaction, accessToken: string, producer: Kafka.Producer) {

    const payload = {
        orderTransactionID: orderTransaction.orderTransactionID,
        userID: orderTransaction.userID,
        utcTime: orderTransaction.utcTime.getDate(),
        items: orderTransaction.items,
    };

    const requestContentHash = hash.sha256(JSON.stringify(payload));
    const longLivedReducedScopeAccessToken = await tokenExchange(accessToken, orderTransaction.orderTransactionID, requestContentHash);

    const orderCreatedEvent = {
        accessToken: longLivedReducedScopeAccessToken,
        payload,
    } as OrderCreatedEvent;

    producer.produce('OrderCreated', null, Buffer.from(JSON.stringify(orderCreatedEvent)));
}

/*
 * Return the list of created orders
 */
export function getOrderTransactions(): OrderTransaction[] {
    return orderTransactions;
}
