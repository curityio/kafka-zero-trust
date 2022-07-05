/*
 * An item within an order event
 */
export interface OrderCreatedEventItem {
    itemID: string;
    price: number;
    quantity: number;
}
