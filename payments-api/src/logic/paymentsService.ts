import {Guid} from 'guid-typescript';
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

    console.log('Consuming OrderCreated Event ...');

    const paymentTransaction = {
        paymentTransactionID: Guid.create().toString(),
        orderTransactionID: claims.orderTransactionID!,
        userID: claims.userID,
        utcTime: new Date(),
        amount: calculateAmount(event.payload.items),
    }

    // Show some debug output to visualize how data flows in a verifiable way
    console.log('Creating Payment Transaction ...');
    console.log(JSON.stringify(paymentTransaction, null, 2));
        
    paymentTransactions.push(paymentTransaction);
    return paymentTransaction;
}