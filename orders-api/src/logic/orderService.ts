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


    // Show some debug output to visualize how data flows in a verifiable way
    console.log('Creating Order Transaction ...');
    console.log(JSON.stringify(orderTransaction, null, 2));

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
        utcTime: orderTransaction.utcTime.getTime(),
        items: orderTransaction.items,
    };

    console.log('Performing Token Exchange ...');
    console.log(accessToken);

    const eventPayloadHash = hash.sha256(JSON.stringify(payload));
    const longLivedReducedScopeAccessToken = await tokenExchange(accessToken, orderTransaction.orderTransactionID, eventPayloadHash);

    const orderCreatedEvent = {
        accessToken: longLivedReducedScopeAccessToken,
        payload,
    } as OrderCreatedEvent;

    console.log('Publishing OrderCreated Event ...');
    console.log(JSON.stringify(orderCreatedEvent, null, 2));

    producer.produce('OrderCreated', null, Buffer.from(JSON.stringify(orderCreatedEvent)));
}

/*
 * Return the list of created orders
 */
export function getOrderTransactions(): OrderTransaction[] {
    return orderTransactions;
}
