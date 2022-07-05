/*
 * Configuration settings for the orders service
 */
export interface OAuthConfiguration {
    algorithm: string;
    issuer: string;
    audience: string;
    jwksEndpoint: string;
    clientID: string;
    clientSecret: string;
    tokenEndpoint: string
}

export const oauthConfiguration: OAuthConfiguration = {
    algorithm: 'RS256',
    issuer: 'http://localhost:8443/oauth/v2/oauth-anonymous',
    audience: 'api.example.com',
    jwksEndpoint: 'http://localhost:8443/oauth/v2/oauth-anonymous/jwks',
    clientID: 'orders-api-client',
    clientSecret: 'Password1',
    tokenEndpoint: 'http://localhost:8443/oauth/v2/oauth-token',
}
