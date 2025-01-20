import {OrderCreatedEventItem} from './orderCreatedEventItem.js';

/*
 * The event message received by the invoices service
 */
export interface OrderCreatedEvent {
    eventID: string;
    utcTime: number;
    items: OrderCreatedEventItem[];
}
