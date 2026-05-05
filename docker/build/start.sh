#!/bin/bash
set -e

cd /service/coolhole

echo "Starting Coolhole in $NODE_ENV mode"

UUID=$(uuidgen)

echo "Starting Node..."

if [ "$NODE_ENV" = "development" ]; then

else
    exec forever index.js
fi