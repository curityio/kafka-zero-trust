# Kafka Zero Trust

A project to demonstrate event based messaging between APIs with zero trust:

- Publishing APIs include a long lived reduced privilege access token in event messages.
- Consuming APIs validate the access token before processing event messages.
- User identity and other secure values flows securely between async APIs.

This code example uses [Apache Kafka](https://kafka.apache.org/) for event based messaging.

## Behavior Overview

To demonstrate the approach, the code example uses a flow where a user facing app triggers a purchase.\
The user facing app calls an Orders API which publishes an event to a message broker.\
An Invoices API then consumes the event and makes additional security checks before processing the data.\
The following diagram illustrates the components involved and the key behaviors:

![Components](./doc/components.svg)

## Prerequisites

The solution provides two simple Node.js microservices and some deployment resources.\
First ensure that these prerequisites are installed:

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js 20 or higher](https://nodejs.org/en/download/)

Also get a `license.json` file for the Curity Identity Server and copy it to the `idsvr` folder:

- If required sign up to the [Curity Developer Portal](https://developer.curity.io/) with your Github account
- You can get a [Free Community Edition License](https://curity.io/product/community/) if you are new to the Curity Identity Server

## Run the Code

Execute these commands to run the APIs locally and all other components in a Docker Compose network.\
On the initial run it will take some minutes to download all third party containers:

```bash
./build.sh
./deploy.sh
```

Then run a minimal console client which acts as the user facing app:

```bash
cd console-client
npm install
npm start
```

The client will run a code flow that opens the system browser.\
Sign in as `demouser / Password1` to get the initial user level access token:

![Login](./doc/login.png)

The console client then simply calls the Orders API to create an order transaction and exits.\
Meanwhile the Orders API raises a secure event consumed at a later time by the Invoices API.

## URLs

The following external URLs are available on the development computer.\
The Invoices API and Apache Kafka run inside the cluster.

| Component | Location |
| --------- | -------- |
| API Gateway | http://localhost:3000 |
| Orders API | http://localhost:3000/orders |
| Curity Identity Server Runtime | http://localhost:8443 |
| Curity Identity Server Admin UI | http://localhost:6749 |

## Data and Identity Flow

The client application sends an example order request to the Orders API.\
The Orders API calculates prices and saves the transaction in its own data as follows:

```json
{
  "transactionID": "6b69df74-339f-416b-84bb-f1f4f32d8f1a",
  "userID": "demouser",
  "utcTime": "2025-01-06T09:01:12.405Z",
  "items": [
    {
      "itemID": 1,
      "quantity": 1,
      "price": 100
    },
    {
      "itemID": 3,
      "quantity": 3,
      "price": 100
    }
  ]
}
```

The Orders API then performs a token exchange and publishes an `OrderCreated` event with the following structure.\
A long lived access token that contains the `userID` and `transactionID` is included in the event message's headers:

```json
{
  "eventID": "e80be47d-7282-4f3c-898a-709ca5393aa5",
  "utcTime": "2025-01-02T10:23:56.258Z",
  "items": [
    {
      "itemID": 1,
      "quantity": 1,
      "price": 100
    },
    {
      "itemID": 3,
      "quantity": 3,
      "price": 100
    }
  ]
}
```

The Invoices API consumes the event and validates the JWT access token before processing it.\
The Invoices API then saves the transaction in its own data in the following format:

```json
{
  "invoiceID": "43f99a41-f50b-443d-813f-3f5eee21851b",
  "transactionID": "0d2e8437-d4e3-40e1-8d6e-a6e17d2c04c7",
  "userID": "demouser",
  "utcTime": "2025-01-06T09:01:13.686Z",
  "amount": 400
}
```

## Security and Tokens

The client gets a normal access token with a 15 minute expiry similar to the following example.\
The audience and scope allows the token to be sent to the Orders API.

```json
{
  "jti": "3ed02b8d-503d-46f1-bffa-e38d30a4c9d3",
  "delegationId": "9dd15191-9441-4056-9e56-52b7ad116b18",
  "exp": 1736154372,
  "nbf": 1736154072,
  "scope": "openid profile orders",
  "iss": "http://localhost:8443/oauth/v2/oauth-anonymous",
  "sub": "demouser",
  "aud": "api.example.com",
  "iat": 1736154072,
  "purpose": "access_token"
}
```

The Orders API makes a token exchange request with the original access token.\
The Orders API upscopes the token to get a long lived access token with a lifetime of 1 week.\
The token has limited invoicing privileges, sufficient to resume asynchronous processing:

```text
POST http://localhost:8443/oauth/v2/oauth-token

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&client_id=orders-api-client
&client_secret=Password1
&subject_token=eyJraWQiOiItMTcyNTQxNzE2NyIsIng...
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&scope=trigger_invoicing
&audience=jobs.example.com
&transaction_id=6b69df74-339f-416b-84bb-f1f4f32d8f1a
&event_id=e80be47d-7282-4f3c-898a-709ca5393aa5
```

The Invoices API then receives the following JWT access token payload.\
The audience of `jobs.example.com` and the `trigger_invoicing` are only accepted at messaging endpoints.\
The access token is bound to a precise event message and transaction to reduce token privileges.

```json
{
  "jti": "14c4ac0c-7806-401b-b6db-94ae1b6f8d4a",
  "delegationId": "9dd15191-9441-4056-9e56-52b7ad116b18",
  "exp": 1736758872,
  "nbf": 1736154072,
  "scope": "trigger_invoicing",
  "iss": "http://localhost:8443/oauth/v2/oauth-anonymous",
  "sub": "demouser",
  "aud": "jobs.example.com",
  "iat": 1736154072,
  "purpose": "access_token",
  "transaction_id": "0d2e8437-d4e3-40e1-8d6e-a6e17d2c04c7",
  "event_id": "5a704593-6f1f-45e4-886a-e37fe5848dc7"
}
```

## Further Information

See the following Curity website resources for further details:

- [Zero Trust API Events Article](https://curity.io/resources/learn/zero-trust-api-events)
- [Kafka Zero Trust Code Example](https://curity.io/resources/learn/securing-api-events-using-jwts)

Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.
