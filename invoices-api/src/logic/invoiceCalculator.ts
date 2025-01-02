import {OrderCreatedEventItem} from './orderCreatedEventItem.js';

/*
 * Simulate money calculation
 */
export function calculateAmount(items: OrderCreatedEventItem[]): number {

    let total = 0;
    items.forEach(i => total += i.quantity * i.price)
    return total;
}
