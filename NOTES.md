# THREATS

We should start with threats that need to be protected against.\
A log based message broker is similar to a SQL database, except for listener endpoints in APIs.\
Can a party inside the cluster call a listener endpoint and supply malicious messages?

## PERIMETER SECURITY

Originally Kafka relied on a locked down network.\
Kafka now has its own [built in security features](https://www.confluent.io/blog/apache-kafka-security-authorization-authentication-encryption/).

## KAFKA CONNECTIONS

I need to better understand how [listener connections](https://rmoff.net/2018/08/02/kafka-listeners-explained/) are managed.

# SCENARIO

See if we are happy with my scenario and deliverable, or make adjustments.

<<<<<<< HEAD:NOTES.md
## MESSAGE DESIGN
=======
**ARTICULATE THREATS**

In some ways a system like Kafka is a trusted database.\
We should understand whether a consuming connection can be abused.\
Could an attacker inside the network pass in messages to a TCP port in the API?\
However, it looks like APIs make just an outbound connection like this:

```javascript
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092'],
  sasl: {
    mechanism: 'plain',
    username: 'my-username',
    password: 'my-password'
  },
});

const consumer = kafka.consumer({ groupId: 'test-group' });
await consumer.connect();
await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
await consumer.run( ... );
```

**MESSAGE DESIGN**
>>>>>>> 0aea699e2e17e18f9adb91f534ed8e528d5970db:TODO.md

Design event messages, eg where the user has purchased a number of items.\
Messages might contain a signature over the URL / method / payload / date?\
Messages should include a JWT with scopes and claims.

## EXPIRY DESIGN

See if we can agree behavior related to timing, perhaps along these lines:

- Enforce JWT expiry by default
- In some cases, catch an exception and retry while ignoring expiry
- Represent when this is allowed as some kind of policy perhaps???

## TOKEN EXCHANGE

Design the scopes the UI client would have.\
Ensure that each event message gets a JWT with suitable scopes.\
Get the JWT to add to event messages.

## SIGNATURES

Implement signatures so that event message contents can be trusted.

## API AUTHORIZATION

Implement JWT validation for both HTTP and event messages, without duplication.\
Inject a claims principal into business logic.\
Enforce a business rules, perhaps based on user subscription level.

## DEMONSTRATE REPLAYING MESSAGES

Use the repository data in the Sales API to replay all messages.\
Add an API endpoint that enables this.

## KAFKA SETUP

Secure Kafka itself in a basic manner and visualize messages / log data.\
This might involve use of an Admin UI or CLI commands.
