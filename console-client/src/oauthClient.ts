import Http from 'http';
import fetch from 'node-fetch'
import open from 'open';
import {generateHash, generateRandomString} from './cryptoUtils';

/*
 * OAuth settings for the simple console client
 */
const identityServerBaseUrl = 'http://localhost:8443/oauth/v2';
const authorizationEndpoint = `${identityServerBaseUrl}/oauth-authorize`;
const tokenEndpoint = `${identityServerBaseUrl}/oauth-token`;
const clientId = 'console-client';
const loopbackPort = 3003;
const redirectUri = `http://127.0.0.1:${loopbackPort}`;
const scope = 'openid profile orders'

/*
 * Do a code flow login to authenticate and get a user level access token
 * This identity will then flow in backend asynchronous event messages
 */
export async function login(): Promise<string> {

    // Set up the authorization request
    const codeVerifier = generateRandomString();
    const codeChallenge = generateHash(codeVerifier);
    const state = generateRandomString();
    const authorizationUrl = buildAuthorizationUrl(state, codeChallenge);

    return new Promise<string>((resolve, reject) => {

        let server: Http.Server | null = null;
        const callback = async (request: Http.IncomingMessage, response: Http.ServerResponse) => {

            if (server != null) {
                
                // Complete the incoming HTTP request when a login response is received
                response.write('Login completed for the console client ...');
                response.end();
                server.close();
                server = null;

                try {

                    // Swap the code for tokens
                    const requestUrl = new URL(request.url || '', `http://${request.headers.host}`);
                    const accessToken = await redeemCodeForAccessToken(requestUrl, state, codeVerifier);
                    resolve(accessToken);

                } catch (e: any) {
                    reject(e);
                }
            }
        }

        // Start an HTTP server and listen for the authorization response on a loopback URL, according to RFC8252
        server = Http.createServer(callback);
        server.listen(loopbackPort);
        
        // Open the system browser to begin authentication
        open(authorizationUrl);
    });
}

/*
 * Build a code flow URL for a native console app
 */
function buildAuthorizationUrl(state: string, codeChallenge: string): string {

    let url = authorizationEndpoint;
    url += `?client_id=${encodeURIComponent(clientId)}`;
    url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    url += '&response_type=code';
    url += `&scope=${encodeURIComponent(scope)}`;
    url += `&state=${encodeURIComponent(state)}`;
    url += `&code_challenge=${encodeURIComponent(codeChallenge)}`;
    url += '&code_challenge_method=S256';
    url += '&prompt=login';
    return url;
}

/*
 * Swap the code for tokens using PKCE and return the access token
 */
async function redeemCodeForAccessToken(responseUrl: URL, requestState: string, codeVerifier: string): Promise<string> {

    const [code, responseState] = getLoginResult(responseUrl);
    if (responseState !== requestState) {
        throw new Error('An invalid authorization response state was received');
    }

    let body = 'grant_type=authorization_code';
    body += `&client_id=${encodeURIComponent(clientId)}`;
    body += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    body += `&code=${encodeURIComponent(code)}`;
    body += `&code_verifier=${encodeURIComponent(codeVerifier)}`;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
    };

    const response = await fetch(tokenEndpoint, options);
    if (response.status >= 400) {
        const details = await response.text();
        throw new Error(`Problem encountered redeeming the code for tokens: ${response.status}, ${details}`);
    }

    const data = await response.json() as any;
    return data.access_token;
}

/*
 * Get the code and state from the authorization response URL
 */
function getLoginResult(responseUrl: URL): [string, string] {

    const args = new URLSearchParams(responseUrl.search);
    const errorCode = args.get('error') || '';
    if (errorCode) {
        
        const error_description = args.get('error_description') || '';
        throw new Error(`Problem encountered during authorization: ${errorCode}, ${error_description}`);
    }
    
    const code = args.get('code') || '';
    const state = args.get('state') || '';
    if (code && state) {
        return [code, state];
    }

    throw new Error('An unrecognized response was returned to the console client');
}
