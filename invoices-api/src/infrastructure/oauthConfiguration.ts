/*
 * Configuration settings for the invoices service
 */
export interface OAuthConfiguration {
    algorithm: string;
    issuer: string;
    audience: string;
    scope: string;
    jwksEndpoint: string;
}

const identityServerHostName = process.env.IS_LOCAL ? 'localhost' : 'curityserver';

export const oauthHttpConfiguration: OAuthConfiguration = {
    algorithm: 'RS256',
    issuer: 'http://localhost:8443/oauth/v2/oauth-anonymous',
    audience: 'api.example.com',
    scope: 'invoices',
    jwksEndpoint: `http://${identityServerHostName}:8443/oauth/v2/oauth-anonymous/jwks`
}

export const oauthJobsConfiguration: OAuthConfiguration = {
    algorithm: 'RS256',
    issuer: 'http://localhost:8443/oauth/v2/oauth-anonymous',
    audience: 'jobs.example.com',
    scope: 'trigger_invoicing',
    jwksEndpoint: `http://${identityServerHostName}:8443/oauth/v2/oauth-anonymous/jwks`
}
