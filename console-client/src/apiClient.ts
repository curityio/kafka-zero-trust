import fs from 'fs-extra';
import fetch from 'node-fetch'

const ordersApiBaseUrl = 'http://localhost:3000/orders';

/*
 * Call the API via the API gateway
 */
export async function createOrderTransaction(accessToken: string): Promise<any> {

    const ordersBuffer = await fs.readFile('randomOrders.json');
    const orders = JSON.parse(ordersBuffer.toString());
    const order = orders[Math.floor(Math.random() * orders.length)];
    const body = JSON.stringify(order);

    console.log('sending ' + JSON.stringify(order, null, 2))

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body,
    };
    const response = await fetch(ordersApiBaseUrl, options);

    if (response.status >= 400) {
        const details = await response.text();
        throw new Error(`Problem encountered creating an order transaction:: ${response.status}, ${details}`);
    }

    return await response.json();
}
