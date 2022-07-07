/*
 * Configuration settings for the payments service
 */
export interface OAuthConfiguration {
    algorithm: string;
    issuer: string;
    audience: string;
    jwksEndpoint: string;
}

const identityServerHostName = process.env.IS_LOCAL ? 'localhost' : 'curityserver';
export const oauthConfiguration: OAuthConfiguration = {
    algorithm: 'RS256',
    issuer: 'http://localhost:8443/oauth/v2/oauth-anonymous',
    audience: 'api.example.com',
    jwksEndpoint: `http://${identityServerHostName}:8443/oauth/v2/oauth-anonymous/jwks`
}
