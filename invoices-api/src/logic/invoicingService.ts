import {randomUUID} from 'crypto';
import {ClaimsPrincipal} from './claimsPrincipal.js';
import {OrderCreatedEvent} from './orderCreatedEvent.js';
import {calculateAmount} from './invoiceCalculator.js';
import {Invoice} from './invoice.js';

const invoices: Invoice[] = [];

/*
 * Does the work to create an invoice
 */
export function createInvoice(event: OrderCreatedEvent, claims: ClaimsPrincipal): Invoice {

    console.debug('Consuming OrderCreated Event ...');
    console.debug(JSON.stringify(event, null, 2));

    const invoice = {
        invoiceID: randomUUID(),
        transactionID: claims.transactionID!,
        userID: claims.userID,
        utcTime: new Date(),
        amount: calculateAmount(event.items),
    }

    // Show some debug output to visualize how data flows in a verifiable way
    console.debug('Creating Invoice ...');
    console.debug(JSON.stringify(invoice, null, 2));
        
    invoices.push(invoice);
    return invoice;
}
