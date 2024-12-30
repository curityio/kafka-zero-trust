/*
 * Configuration settings for the payments service
 */
export interface OAuthConfiguration {
    algorithm: string;
    issuer: string;
    audienceHttp: string;
    audienceAsyncJobs: string;
    jwksEndpoint: string;
}

const identityServerHostName = process.env.IS_LOCAL ? 'localhost' : 'curityserver';

/*
 * In the example deployment, HTTP endpoints and async jobs use distinct token audiences
 * That provides one way to prevent the use of long lived tokens at HTTP endpoints
 */
export const oauthConfiguration: OAuthConfiguration = {
    algorithm: 'RS256',
    issuer: 'http://localhost:8443/oauth/v2/oauth-anonymous',
    audienceHttp: 'api.example.com',
    audienceAsyncJobs: 'jobs.example.com',
    jwksEndpoint: `http://${identityServerHostName}:8443/oauth/v2/oauth-anonymous/jwks`
}
