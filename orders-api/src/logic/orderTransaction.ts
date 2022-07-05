import {OrderItem} from './orderItem';

/*
 * An order transaction record that might be stored in this microservice's database
 */
export interface OrderTransaction {
    transactionID: string;
    userID: string;
    utcTime: Date;
    items: OrderItem[];
}
