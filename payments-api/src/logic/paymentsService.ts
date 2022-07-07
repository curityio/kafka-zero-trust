import {Guid} from 'guid-typescript';
import {authorizePayment} from '../infrastructure/authorizer';
import {ClaimsPrincipal} from './claimsPrincipal';
import {OrderCreatedEvent} from './orderCreatedEvent';
import {calculateAmount} from './paymentCalculator';
import {PaymentTransaction} from './paymentTransaction';

const paymentTransactions: PaymentTransaction[] = [];

/*
 * Do the work of creating a payment
 */
export function createPaymentTransaction(event: OrderCreatedEvent, claims: ClaimsPrincipal): PaymentTransaction {

    authorizePayment(event, claims);

    const paymentTransaction = {
        paymentTransactionID: Guid.create().toString(),
        orderTransactionID: claims.orderTransactionID!,
        userID: claims.userID,
        utcTime: new Date(),
        amount: calculateAmount(event.payload.items),
    }

    // Show some debug output to visualize how data flows in a verifiable way
    console.log('Created Payment Transaction ...');
    console.log(JSON.stringify(paymentTransaction, null, 2));
        
    paymentTransactions.push(paymentTransaction);
    return paymentTransaction;
}