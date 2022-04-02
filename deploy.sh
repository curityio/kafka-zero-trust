#!/bin/bash

###################################
# A script to deploy all components
###################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Set to LOCAL when running APIs locally, or to DEPLOYED otherwise
#
if [ "$1" == 'DEPLOYED' ]; then
  PROFILE='DEPLOYED'
else
  PROFILE='LOCAL'
fi

#
# Run the Docker Compose network and clear volumes etc first
#
docker compose rm -svf && docker compose --profile $PROFILE --project-name kakfa up --detach --remove-orphans

#
# Run local APIs if required
#
if [ "$PROFILE" == 'LOCAL' ]; then
    
    #
    # Wait for Kafka in a basic way
    #
    echo 'Waiting for Kafak to come online'
    sleep 30

    #
    # Then run the APIs
    #
    open -a Terminal sales-api/run.sh
    open -a Terminal orders-api/run.sh
    open -a Terminal invoicing-api/run.sh
    open -a Terminal shipping-api/run.sh
fi



