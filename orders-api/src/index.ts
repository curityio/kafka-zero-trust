import {startHttpServer} from './infrastructure/httpServer.js';
import {startMessageBroker} from './infrastructure/messageBroker.js';

(async () => {
    const producer = await startMessageBroker();
    startHttpServer(producer);
})();
