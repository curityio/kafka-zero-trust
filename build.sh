#!/bin/bash

#########################################
# A script to build code to Docker images
#########################################

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
# Build the Sales API
#
cd sales-api
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing Sales API dependencies"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "Problem encountered building Sales API code"
  exit 1
fi

if [ "$PROFILE" == 'DEPLOYED' ]; then
  docker build -t sales-api:1.0.0 .
  if [ $? -ne 0 ]; then
    echo "Problem encountered building the Sales API Docker image"
    exit 1
  fi
fi
cd ..

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
# Build the Invoicing API
#
cd invoicing-api
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing Invoicing API dependencies"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "Problem encountered building Invoicing API code"
  exit 1
fi

if [ "$PROFILE" == 'DEPLOYED' ]; then
  docker build -t invoicing-api:1.0.0 .
  if [ $? -ne 0 ]; then
    echo "Problem encountered building the Invoicing API Docker image"
    exit 1
  fi
fi
cd ..

#
# Build the Shipping API
#
cd shipping-api
npm install
if [ $? -ne 0 ]; then
  echo "Problem encountered installing Shipping API dependencies"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "Problem encountered building Shipping API code"
  exit 1
fi

if [ "$PROFILE" == 'DEPLOYED' ]; then
  docker build -t shipping-api:1.0.0 .
  if [ $? -ne 0 ]; then
    echo "Problem encountered building the Shipping API Docker image"
    exit 1
  fi
fi
cd ..