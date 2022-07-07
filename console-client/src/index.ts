/*
 * A minimal OAuth client that authenticates and gets a user level access token
 * The token is then sent to an API to create an Order transaction, to initiate an asynchronous back end flow
 * The user identity securely flows in the event message
 */

import {login} from './oauthClient'
import {createOrderTransaction} from './apiClient'

(async () => {

    try {
    
        console.log('Console client is authenticating a user ...');
        const accessToken = await login();

        console.log('Console client is calling the Orders API ...');
        const data = await createOrderTransaction(accessToken);

        console.log(`Order transaction created successfully ...`);
        console.log(JSON.stringify(data, null, 2));

    } catch (e: any) {

        console.log(e.message);
    }
})();
