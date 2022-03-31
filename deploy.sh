#!/bin/bash

###################################
# A script to deploy all components
###################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Run the Docker Compose network and clear volumes etc first
#
docker compose rm -svf && docker compose -p kafka up
