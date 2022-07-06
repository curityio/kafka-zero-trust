TOMORROW
--------
1. Article
   Include notes on concepts of extra data in token exchange requests
   Mention further scopes for downstream microservices

2. Code polishing
   
   - payments scope token must not be usable if it has an order_transaction_id or request_content_hash

   Only make the token procedure apply to the orders-api-client via properties - see Jacob token issuer video
   Use a long time to live for token

3. API gateway
   Do introspection which can route to local computer, then remove introspection from the client bash 

4. Final client
   Write a console client listening on a loopback URL and get a user level token
   Must route back to host when running DEPLOYED

5. Code Example Doc
   Easy to run instructions
   Visual results
