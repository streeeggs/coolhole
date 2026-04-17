# Coolhole Docker Setup

Docker containerization for local development of Coolhole (CyTube fork).

## Prerequisites

- Docker Desktop installed with WSL2 backend (Windows)
- Git
- VS Code with Dev Containers extension (optional, for dev container support)

## Dev Container Setup (VS Code)

I've set this up such that:
- All server files watch for changes to rebuild
- Node restarts when backend changes are detected
- Pug will always recompile each page and won't cache so changes should be reflected on refresh

### Setup

Install the [VSCode Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

The `.env` file controls all runtime configuration. Never commit this file to git (it's in `.gitignore`).

See `.env.example` for all available options

### Actually using it

1. `CTRL+Shift+P`
2. `Rebuild and Reopen in Container`

VS Code should reopen within the same window but mounted to the container's file system

## File Structure

**docker-compose.yml** - Orchestrates two services: MariaDB database and Node.js web server. Sets development environment with hot reload enabled and exposes ports 8080 and 1337.

**build/Dockerfile** - Builds the web container with Node.js Iron Alpine, clones the Coolhole repository, installs dependencies, and configures the application with environment variables. Runs with nodemon for automatic restarts on file changes in development mode.

**build/postinst.sh** - MariaDB initialization script that runs on first container startup to set up the database schema.

**build/ch_dump.sql** - Database dump file used by postinst.sh to populate initial database structure.

**.env.example** - Template for environment variables. Copy to `.env` and set secure passwords before first run.

## Ports

- **8080** - Web interface
- **1337** - Alternative port
- **3306** - MariaDB
