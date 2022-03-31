**SCENARIO**

See if we are happy with my scenario and deliverable, or make adjustments.

**MESSAGE DESIGN**

Design event messages, eg where the user has purchased a number of items.\
Messages might contain a signature over the URL / method / payload / date?\
Messages should include a JWT with scopes and claims.

**EXPIRY DESIGN**

See if we can agree behavior related to timing, perhaps along these lines:

- Enforce JWT expiry by default
- In some cases, catch an exception and retry while ignoring expiry
- Represent when this is allowed as some kind of policy perhaps???

**MICROSERVICES DATA**

Each API should store some kind of order object in a memory array.\
Use a repository class, which in a real API would route to a database.\
Node.js is single threaded so this can be done simply.

**KAFKA TOPICS**

Create these when Kafka is deployed, in the `deploy.sh` script.

**BASIC PRODUCING AND CONSUMING**

Do the work to wire up publishing and consuming of simple events.\
These should add to microservices data.\
Duplicates should be avoided, if the request ID already exists.

**TOKEN EXCHANGE**

Design the scopes the UI client would have.\
Ensure that each event message gets a JWT with suitable scopes.\
Get the JWT to add to event messages.

**SIGNATURES**

Implement signatures so that event message contents can be trusted.

**API AUTHORIZATION**

Implement JWT validation for both HTTP and event messages, without duplication.\
Inject a claims principal into business logic.\
Enforce a business rules, perhaps based on user subscription level.

**DEMONSTRATE REPLAYING MESSAGES**

Use the repository data in the Sales API to replay all messages.\
Add an API endpoint that enables this.

**KAFKA SETUP**

Secure Kafka itself in a basic manner and visualize messages / log data.\
This might involve use of an Admin UI or CLI commands.