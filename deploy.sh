#!/bin/bash

###################################
# A script to deploy all components
###################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Run the Docker Compose network
#
docker compose -p kafka up

#
# Wait for Kafka to come up, then create topics
#