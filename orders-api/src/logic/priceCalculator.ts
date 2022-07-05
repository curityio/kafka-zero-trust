import {OrderItem} from './orderItem';

/*
 * Simulate money calculation
 */
export function calculatePrices(items: OrderItem[]) {

    items.forEach(i => {
        i.price = 100;
    })
}
