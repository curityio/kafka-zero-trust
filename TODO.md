1. Get APIs basically connected:
   - curl to call Orders API using client credentials flow
   - Orders API validates the JWT, checks the scope, forms a claims principal with the subject and returns error responses
   - Orders API publishes to Kafka

2. Implement token exchange:
   - Orders API does token exchange and includes a JWT in the request, containing a request_content_hash and a transaction_id
   - Use a token procedure in deployed Curity and save configuration
   - Payments API validates JWT, content hash and builds a claims principal with the scope and details

3. Update README docs

4. Write a console client listening on a loopback URL and get a user level token
   Then send the message to the API and get a 502
   Client scopes are orders_create



3. Use an API gateway in Docker, running phantom token plugin
   Can route back to host if required

4. Get the message received by the Orders API
   Validate the JWT and handle errors in the client
   Check for orders_create scope
   Read is allowed if the scope has 

5. Do token exchange in the Orders API, perhaps via a client_assertion
   Resulting token has a longer expiry and a payments_create-123 prefix scope

6. Get receiving working in the Payments API
   Validate the JWT and report errors
   Check for payments_create-123 scope

7. The token should be tied to the message on the message broker