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
        paymentID: Guid.create().toString(),
        orderID: claims.transactionID!,
        userID: claims.userID,
        utcTime: new Date(),
        amount: calculateAmount(event.payload.items),
    }
        
    paymentTransactions.push(paymentTransaction);
    return paymentTransaction;
}

/*
 * Return the list of created orders
 */
export function getPaymentTransactions(): PaymentTransaction[] {
    return paymentTransactions;
}
