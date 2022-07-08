#!/bin/bash

###################################
# A script to deploy all components
###################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Default to running APIs locally, with Kafka always running in Docker
#
if [ "$1" == 'DEPLOYED' ]; then
  PROFILE='DEPLOYED'
else
  PROFILE='LOCAL'
fi

#
# This is for Curity developers only
#
cp ./hooks/pre-commit ./.git/hooks

#
# Configure the API gateway to point to the correct API URL
#
if [ "$PROFILE" == 'DEPLOYED' ]; then
  # When APIs run in Docker, the API gateway uses the API container's docker host name
  export ORDERS_API_HOST_NAME='ordersapi'
else
  # When APIs run locally, the API gateway calls out to the host computer
  export ORDERS_API_HOST_NAME='host.docker.internal'
fi
envsubst < ./api-gateway/kong-template.yml > ./api-gateway/kong.yml

#
# Run the Docker Compose network and clear volumes etc first
#
docker compose --project-name kakfa down &&
docker compose rm -svf && \
docker compose --profile $PROFILE --project-name kakfa up --detach --remove-orphans

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
# Run local APIs if required
#
if [ "$PROFILE" == 'LOCAL' ]; then
    open -a Terminal orders-api/run.sh
    open -a Terminal payments-api/run.sh
fi
