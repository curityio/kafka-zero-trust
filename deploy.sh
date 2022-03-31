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
if [ $? -ne 0 ]; then
  echo "Problem encountered building the Sales API Docker image"
  exit 1
fi
