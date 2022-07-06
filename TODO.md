TOMORROW
--------
1. Update README
   Include a shipping service
   Then merge code

2. Article
   First zero trust base is to avoid unprotected event endpoints inside the cluster
   Then mention expiry differrences for events
   Different event processing times, eg scheduled end of day jobs
   Browse Jacob article
   Include notes on concepts of extra data in token exchange requests
   Mention further scopes for downstream microservices

3. Code polishing
   Add an API gateway to do introspection which can route to local computer, then remove introspection from the client bash script
   Only make the token procedure apply to the orders-api-client via properties - see Jacob token issuer video
   Use a long time to live for token

4. Final client
   Write a console client listening on a loopback URL and get a user level token
   Must route back to host when running DEPLOYED

5. Code Example Doc
   Easy to run instructions
   Visual results
