import {startHttpServer} from './infrastructure/httpServer';
import {startMessageBroker} from './infrastructure/messageBroker';

(async () => {

    const producer = await startMessageBroker();
    startHttpServer(producer);
})();
