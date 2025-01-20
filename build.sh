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
if [ "$PROFILE" != 'DEPLOYED' ]; then
  PROFILE='LOCAL'
fi

#
# Build the Docker image for the API gateway
#
docker build --no-cache -f api-gateway/Dockerfile -t custom_kong:3.8 .
if [ $? -ne 0 ]; then
  echo "Problem encountered building the API gateway Docker image"
  exit 1
fi

#
# Install dependencies
#
cd orders-api
npm install
if [ $? -ne 0 ]; then
    echo "Problem encountered installing Orders API dependencies"
    exit 1
fi
cd ..

#
# Install dependencies
#
cd invoices-api
npm install
if [ $? -ne 0 ]; then
    echo "Problem encountered installing Invoices API dependencies"
    exit 1
fi
cd ..

#
# Build Docker images for deployed APIs if required
#
if [ "$PROFILE" == 'DEPLOYED' ]; then

  #
  # Build the Orders API Docker image
  #
  cd orders-api
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
  # Build the Invoices API  Docker image
  #
  cd invoices-api
  npm run build
  if [ $? -ne 0 ]; then
    echo "Problem encountered building Invoices API code"
    exit 1
  fi

  if [ "$PROFILE" == 'DEPLOYED' ]; then
    docker build -t invoices-api:1.0.0 .
    if [ $? -ne 0 ]; then
      echo "Problem encountered building the Orders API Docker image"
      exit 1
    fi
  fi
  cd ..
fi