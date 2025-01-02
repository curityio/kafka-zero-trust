import {randomUUID} from 'crypto';
import Kafka from 'node-rdkafka';
import {tokenExchange} from '../infrastructure/authorizer.js';
import {ClaimsPrincipal} from './claimsPrincipal.js';
import {OrderCreatedEvent} from './orderCreatedEvent.js';
import {OrderItem} from './orderItem.js';
import {OrderTransaction} from './orderTransaction.js';
import {calculatePrices} from './priceCalculator.js';

const orderTransactions: OrderTransaction[] = [];

/*
 * Do the work of creating an order in this service
 */
export function createOrderTransaction(items: OrderItem[], claims: ClaimsPrincipal): OrderTransaction {

    calculatePrices(items);
    const orderTransaction = {
        orderTransactionID: randomUUID(),
        userID: claims.userID,
        utcTime: new Date(),
        items,
    };

    console.debug('Creating Order Transaction ...');
    console.debug(JSON.stringify(orderTransaction, null, 2));
    orderTransactions.push(orderTransaction);
    return orderTransaction;
}

/*
 * Next publish the order created event
 */
export async function publishOrderCreated(orderTransaction: OrderTransaction, accessToken: string, producer: Kafka.Producer) {

    console.debug('Performing Token Exchange ...');
    const eventID = randomUUID();
    const longLivedReducedScopeAccessToken = await tokenExchange(accessToken, eventID, orderTransaction.orderTransactionID);

    const orderCreatedEvent = {
        eventID,
        orderTransactionID: orderTransaction.orderTransactionID,
        utcTime: orderTransaction.utcTime,
        items: orderTransaction.items,
    } as OrderCreatedEvent;

    console.debug('Publishing OrderCreated Event ...');
    console.debug(JSON.stringify(orderCreatedEvent, null, 2));

    const partition = null;
    const message = Buffer.from(JSON.stringify(orderCreatedEvent));
    const key = null;
    const timestamp = null;
    const opaque = null;
    const headers: Kafka.MessageHeader[] = [
        {
            'Authorization': `Bearer ${longLivedReducedScopeAccessToken}`,
        }
    ];
    
    producer.produce('OrderCreated', partition, message, key, timestamp, opaque, headers);
}

/*
 * Return the list of created orders
 */
export function getOrderTransactions(): OrderTransaction[] {
    return orderTransactions;
}
