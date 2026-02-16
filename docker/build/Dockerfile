FROM alpine:latest
WORKDIR /tmp

ARG CYTUBE_MARIADB_PASSWORD COOLHOLE_URL COOLHOLE_TITLE COOLHOLE_DESC YOUTUBE_V3_API_KEY TWITCH_CLIENT_ID

RUN apk add --no-cache \
    build-base \
    git \
    mariadb-client \
    python3 \
    npm \
    yq \
    uuidgen \
    ffmpeg \
    nodejs \
    bash

# Clone coolhole repo
RUN git clone https://github.com/streeeggs/coolhole
RUN cd coolhole && npm install

# Build babel transpilation
RUN cd coolhole && npm run build-server

# Setup service directory
RUN mkdir -p /service/coolhole && cp -r /tmp/coolhole /service/

RUN cd /service/coolhole && npm install -g forever nodemon

# Copy and configure config.yaml
RUN cp /service/coolhole/config.template.yaml /service/coolhole/config.yaml

# Configure with environment variables
RUN export UUID=$(uuidgen) && \
    cd /service/coolhole && \
    yq -i ".mysql.server = \"db\"" config.yaml && \
    yq -i ".mysql.password = \"$CYTUBE_MARIADB_PASSWORD\"" config.yaml && \
    yq -i ".http.root-domain = \"$COOLHOLE_URL\"" config.yaml && \
    yq -i ".http.trust-proxies[0] = \"loopback\"" config.yaml && \
    yq -i ".http.trust-proxies[1] = \"uniquelocal\"" config.yaml && \
    yq -i ".http.cookie-secret = \"$UUID\"" config.yaml && \
    yq -i ".io.domain = \"http://$COOLHOLE_URL\"" config.yaml && \
    yq -i ".ffmpeg.enabled = \"true\"" config.yaml && \
    yq -i ".youtube-v3-key = \"$YOUTUBE_V3_API_KEY\"" config.yaml && \
    yq -i ".twitch-client-id = \"$TWITCH_CLIENT_ID\"" config.yaml

WORKDIR /service/coolhole

# Development entry point with nodemon for hot reload
ENV NODE_ENV=development
CMD ["sh", "-c", "nodemon --watch src --watch www --ext js,json,coffee --delay 1000 --exec 'npm run build-server && node index.js'"]
