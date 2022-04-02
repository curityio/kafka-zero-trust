import {run_express} from './express';
import {run_kafka} from './kafka';
import {Order} from './order';

(async () => {

    const orders: Order[] = [];
     await run_kafka(orders);
    run_express(orders);
})();
