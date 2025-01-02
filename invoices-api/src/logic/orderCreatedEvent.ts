import {OrderCreatedEventItem} from './orderCreatedEventItem.js';

/*
 * The event message received by the invoices service
 */
export interface OrderCreatedEvent {
    eventID: string;
    transactionID: string;
    utcTime: number;
    items: OrderCreatedEventItem[];
}
