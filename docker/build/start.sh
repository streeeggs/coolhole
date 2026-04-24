#!/bin/bash
set -e

cd /service/coolhole

# ----- Runtime config generation -----
UUID=$(uuidgen)

yq -i ".mysql.server = \"db\"" config.yaml
yq -i ".mysql.port = \"${MARIADB_PORT}\"" config.yaml
yq -i ".mysql.password = \"${CYTUBE_MARIADB_PASSWORD}\"" config.yaml
yq -i ".http.root-domain = \"${COOLHOLE_URL}\"" config.yaml
yq -i ".http.trust-proxies = [\"loopback\",\"uniquelocal\"]" config.yaml
yq -i ".http.cookie-secret = \"${UUID}\"" config.yaml
yq -i ".io.domain = \"http://${COOLHOLE_URL}\"" config.yaml
yq -i ".ffmpeg.enabled = true" config.yaml
yq -i ".youtube-v3-key = \"${YOUTUBE_V3_API_KEY}\"" config.yaml
yq -i ".twitch-client-id = \"${TWITCH_CLIENT_ID}\"" config.yaml

echo "Starting in $NODE_ENV mode"

if [ "$NODE_ENV" = "development" ]; then
    echo "Waiting for MariaDB to be ready..."

    until mariadb -h db -u root -p"$MARIADB_ROOT_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; do
    sleep 2
    done

    echo "MariaDB is ready."

    npm run server-dev &
    nodemon --inspect=0.0.0.0:9229 --watch src --watch templates --ignore '*.coffee' index.js &
    wait -n
    exit $?
else
    exec forever index.js
fi