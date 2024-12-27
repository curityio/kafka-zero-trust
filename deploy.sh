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
if [ "$PROFILE" != 'DEPLOYED' ]; then
  PROFILE='LOCAL'
fi

#
# This is for Curity developers only
#
cp ./hooks/pre-commit ./.git/hooks

#
# Check there is a license file
#
if [ ! -f './idsvr/license.json' ]; then
  echo 'Please provide a license.json file in the idsvr folder in order to deploy the system'
  exit 1
fi

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
docker exec -it $KAFKA_CONTAINER_ID sh -c 'kafka-topics --list --bootstrap-server kafka:9092'
RESULT=$?
while [ "$RESULT" -ne '0' ]; do
    sleep 2
    KAFKA_CONTAINER_ID=$(docker container ls | grep cp-server | awk '{print $1}')
    docker exec -it $KAFKA_CONTAINER_ID sh -c 'kafka-topics --list --bootstrap-server kafka:9092'
    RESULT=$?
done

#
# If APIs are deployed there is nothing left to do
#
if [ "$PROFILE" == 'DEPLOYED' ]; then
  exit 0;
fi

#
# Otherwise get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM="MACOS"
 	;;

  MINGW64*)
    PLATFORM="WINDOWS"
	;;

  Linux)
    PLATFORM="LINUX"
	;;
esac

#
# Then run local APIs
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./orders-api/run.sh
  open -a Terminal ./payments-api/run.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then
  
  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./orders-api/run.sh &
  "$GIT_BASH" -c ./payments-api/run.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./orders-api/run.sh
  gnome-terminal -- ./payments-api/run.sh
fi
