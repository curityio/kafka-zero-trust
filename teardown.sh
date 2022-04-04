#!/bin/bash

#####################################
# A script to teardown all components
#####################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Tear down the Docker Compose network
#
docker compose --project-name kakfa down
