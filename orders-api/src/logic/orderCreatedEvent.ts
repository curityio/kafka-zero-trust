import {OrderItem} from './orderItem.js';

/*
 * An event message published by the orders service
 */
export interface OrderCreatedEvent {
    accessToken: string;
    payload: {
        orderTransactionID: string;
        utcTime: number;
        items: OrderItem[];
    }
}
