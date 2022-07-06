#!/bin/bash

########################################################################################
# An initial client to be replaced by a client that gets a user level token later
# I will probably implement a simple desktop flow in Node.js, with a loopback return URL
########################################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
set -e

#
# Point to remote systems
#
IDENTITY_SERVER_URL='http://localhost:8443'
ORDERS_API_BASE_URL='http://localhost:3001'
PAYMENTS_API_BASE_URL='http://localhost:3002'

#
# Get a token for the orders API
#
echo 'Getting token for console app ...'
UI_OPAQUE_TOKEN=$(curl -s -X POST $IDENTITY_SERVER_URL/oauth/v2/oauth-token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=console-client" \
    -d "client_secret=Password1" \
    -d "grant_type=client_credentials" \
    -d "scope=orders trigger_payments" | jq -r .access_token)

UI_JWT_TOKEN=$(curl -k -s -X POST $IDENTITY_SERVER_URL/oauth/v2/oauth-introspect \
    -u "introspect-client:Password1" \
    -H "Accept: application/jwt" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "token=$UI_OPAQUE_TOKEN")

#
# Create an order
#
echo 'Calling Orders API to create an order ...'
ORDER_TRANSACTION=$(curl -s -X POST $ORDERS_API_BASE_URL \
-H "content-type: application/json" \
-H "accept: application/json" \
-H "Authorization: Bearer $UI_JWT_TOKEN" \
-d @defaultOrder.json)

#
# List orders
#
echo 'Viewing created orders ...'
curl -s -X GET $ORDERS_API_BASE_URL \
-H "Authorization: Bearer $UI_JWT_TOKEN" \
-H "accept: application/json" \
| jq

#
# Wait and then List payments
#
sleep 2
echo 'Viewing created payments ...'
curl -s -X GET $PAYMENTS_API_BASE_URL \
-H "Authorization: Bearer $UI_JWT_TOKEN" \
-H "accept: application/json" \
| jq