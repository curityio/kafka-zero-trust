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
if [ "$1" == 'LOCAL' ]; then
  PROFILE='LOCAL'
else
  PROFILE='DEPLOYED'
fi

#
# Run the Docker Compose network and clear volumes etc first
#
docker compose --project-name kakfa down && \
docker compose rm -svf && \
docker compose --profile $PROFILE --project-name kakfa up --detach --remove-orphans

#
# Run local APIs if required
#
if [ "$PROFILE" == 'LOCAL' ]; then
    
    #
    # Wait for Kafka to come online
    #
    echo 'Waiting for Kafka to come online ...'
    KAFKA_CONTAINER_ID=$(docker container ls | grep cp-server | awk '{print $1}')
    docker exec -it $KAFKA_CONTAINER_ID sh -c 'kafka-topics --list --zookeeper zookeeper:2181'
    RESULT=$?
    while [ "$RESULT" -ne '0' ]; do
        sleep 2
        KAFKA_CONTAINER_ID=$(docker container ls | grep cp-server | awk '{print $1}')
        docker exec -it $KAFKA_CONTAINER_ID sh -c 'kafka-topics --list --zookeeper zookeeper:2181'
        RESULT=$?
    done
    
    #
    # Then run the APIs
    #
    open -a Terminal sales-api/run.sh
    open -a Terminal orders-api/run.sh
    open -a Terminal invoicing-api/run.sh
    open -a Terminal shipping-api/run.sh
fi



