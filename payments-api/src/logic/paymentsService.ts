import {randomUUID} from 'crypto';
import {authorizePayment} from '../infrastructure/authorizer.js';
import {ClaimsPrincipal} from './claimsPrincipal.js';
import {OrderCreatedEvent} from './orderCreatedEvent.js';
import {calculateAmount} from './paymentCalculator.js';
import {PaymentTransaction} from './paymentTransaction.js';

const paymentTransactions: PaymentTransaction[] = [];

/*
 * Do the work of creating a payment
 */
export function createPaymentTransaction(event: OrderCreatedEvent, claims: ClaimsPrincipal): PaymentTransaction {

    authorizePayment(event, claims);

    console.debug('Consuming OrderCreated Event ...');
    console.debug(JSON.stringify(event, null, 2));

    const paymentTransaction = {
        paymentTransactionID: randomUUID(),
        orderTransactionID: claims.orderTransactionID!,
        userID: claims.userID,
        utcTime: new Date(),
        amount: calculateAmount(event.items),
    }

    // Show some debug output to visualize how data flows in a verifiable way
    console.debug('Creating Payment Transaction ...');
    console.debug(JSON.stringify(paymentTransaction, null, 2));
        
    paymentTransactions.push(paymentTransaction);
    return paymentTransaction;
}