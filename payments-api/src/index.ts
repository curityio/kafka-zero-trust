import {startHttpServer} from './infrastructure/httpServer';
import {startMessageBroker} from './infrastructure/messageBroker';

(async () => {

    await startMessageBroker();
    startHttpServer();
})();
