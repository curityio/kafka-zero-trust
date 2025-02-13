import {OrderItem} from './orderItem.js';

/*
 * An event message published by the orders service
 */
export interface OrderCreatedEvent {
    eventID: string;
    utcTime: Date;
    items: OrderItem[];
}
