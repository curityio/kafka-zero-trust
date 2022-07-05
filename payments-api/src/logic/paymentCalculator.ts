import {OrderCreatedEventItem} from './orderCreatedEventItem';

/*
 * Simulate money calculation
 */
export function calculateAmount(items: OrderCreatedEventItem[]): number {

    let total = 0;
    items.forEach(i => total += i.price)
    return total;
}
