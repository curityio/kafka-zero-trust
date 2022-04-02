#!/bin/bash

###################################
# A script to deploy all components
###################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Set to LOCAL to run APIs locally, or to DEPLOYED to deploy them to the Docker Compose network
#
PROFILE=LOCAL

#
# Run the Docker Compose network and clear volumes etc first
#
docker compose rm -svf && docker compose --profile $PROFILE --project-name kakfa up
