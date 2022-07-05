import {OrderCreatedEventItem} from './orderCreatedEventItem';

/*
 * An event message received by the payments service
 */
export interface OrderCreatedEvent {
    accessToken: string;
    payload: {
        transactionID: string;
        utcTime: number;
        items: OrderCreatedEventItem[];
    }
}
