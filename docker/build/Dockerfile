# ---------- Base Stage ----------
  FROM node:iron-alpine AS base

  WORKDIR /service
  
  ARG CYTUBE_MARIADB_PASSWORD MARIADB_PORT COOLHOLE_URL COOLHOLE_TITLE COOLHOLE_DESC YOUTUBE_V3_API_KEY TWITCH_CLIENT_ID
  
  RUN apk add --no-cache \
      git build-base git mariadb-client python3 npm yq uuidgen ffmpeg bash
  
  WORKDIR /service/coolhole
  COPY . .

  # Copy config template (runtime config happens later)
  RUN cp config.template.yaml config.yaml
  
  # Copy start script
  COPY docker/build/start.sh /usr/local/bin/start.sh
  RUN chmod +x /usr/local/bin/start.sh

  RUN apk add --no-cache dos2unix && dos2unix postinstall.sh

  RUN npm install
  RUN npm run build-server
  
  # ---------- Development Stage ----------
  FROM base AS dev
  
  RUN npm install -g nodemon
  
  ENV NODE_ENV=development
  
  ENTRYPOINT ["/usr/local/bin/start.sh"]
  
  
  # ---------- Production Stage ----------
  FROM base AS prod
  
  RUN npm install -g forever
  
  ENV NODE_ENV=production
  
 ENTRYPOINT ["/usr/local/bin/start.sh"]