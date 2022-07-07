#!/bin/bash

#########################################
# A script to build code to Docker images
#########################################

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
# Build the Docker image for the API gateway
#
docker build --no-cache -f api-gateway/Dockerfile -t custom_kong:2.8.1-alpine .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the API gateway Docker image"
  exit 1
fi

#
# Build Docker images for deployed APIs if required
#
if [ "$PROFILE" == 'DEPLOYED' ]; then

  #
  # Build the Orders API
  #
  cd orders-api
  npm install
  if [ $? -ne 0 ]; then
    echo "Problem encountered installing Orders API dependencies"
    exit 1
  fi

  npm run build
  if [ $? -ne 0 ]; then
    echo "Problem encountered building Orders API code"
    exit 1
  fi

  if [ "$PROFILE" == 'DEPLOYED' ]; then
    docker build -t orders-api:1.0.0 .
    if [ $? -ne 0 ]; then
      echo "Problem encountered building the Orders API Docker image"
      exit 1
    fi
  fi
  cd ..

  #
  # Build the Payments API
  #
  cd payments-api
  npm install
  if [ $? -ne 0 ]; then
    echo "Problem encountered installing Payments API dependencies"
    exit 1
  fi

  npm run build
  if [ $? -ne 0 ]; then
    echo "Problem encountered building Payments API code"
    exit 1
  fi

  if [ "$PROFILE" == 'DEPLOYED' ]; then
    docker build -t payments-api:1.0.0 .
    if [ $? -ne 0 ]; then
      echo "Problem encountered building the Orders API Docker image"
      exit 1
    fi
  fi
  cd ..
fi