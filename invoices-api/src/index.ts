import {startHttpServer} from './infrastructure/httpServer.js';
import {startMessageBroker} from './infrastructure/messageBroker.js';

(async () => {

    await startMessageBroker();
    startHttpServer();
})();
