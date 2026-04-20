FROM node:18-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/coolhole

COPY . .

# Fix CRLF line endings from Windows
RUN sed -i 's/\r$//' postinstall.sh && chmod +x postinstall.sh

# Install deps, rebuild native modules, build all transpiled code
RUN npm install --ignore-scripts && \
    npm rebuild bcrypt && \
    cd node_modules/@cytube/mediaquery && npx babel -D --source-maps --out-dir lib/ src/ && cd /opt/coolhole && \
    npx babel -D --source-maps --out-dir lib/ src/ && \
    node bin/build-player.js

EXPOSE 8080 1337

CMD ["node", "index.js"]
