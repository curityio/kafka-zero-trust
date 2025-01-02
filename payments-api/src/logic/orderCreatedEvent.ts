import {OrderCreatedEventItem} from './orderCreatedEventItem.js';

/*
 * An event message received by the payments service
 */
export interface OrderCreatedEvent {
    eventID: string;
    orderTransactionID: string;
    utcTime: number;
    items: OrderCreatedEventItem[];
}
