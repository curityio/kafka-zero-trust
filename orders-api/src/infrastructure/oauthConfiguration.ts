/*
 * Configuration settings for the orders service
 */
export interface OAuthConfiguration {
    algorithm: string;
    issuer: string;
    audience: string;
    jwksEndpoint: string;
    scope: string;
    clientID: string;
    clientSecret: string;
    tokenEndpoint: string
}

const identityServerHostName = process.env.IS_LOCAL ? 'localhost' : 'curityserver';
export const oauthConfiguration: OAuthConfiguration = {
    algorithm: 'RS256',
    issuer: 'http://localhost:8443/oauth/v2/oauth-anonymous',
    audience: 'api.example.com',
    scope: 'orders',
    jwksEndpoint: `http://${identityServerHostName}:8443/oauth/v2/oauth-anonymous/jwks`,
    clientID: 'orders-api-client',
    clientSecret: 'Password1',
    tokenEndpoint: `http://${identityServerHostName}:8443/oauth/v2/oauth-token`,
}
