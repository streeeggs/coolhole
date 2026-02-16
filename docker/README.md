# Coolhole Docker Setup (Development)

A Docker Compose setup for local development of the Coolhole CyTube fork.

## Prerequisites

- Docker Desktop (Windows with WSL2)
- Git

## Setup

1. **Clone into docker directory** (if not already done):

   ```bash
   cd docker
   ```

2. **Copy and configure environment**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to set secure passwords for MariaDB (at minimum).

3. **Build and start containers**:

   ```bash
   docker-compose up -d
   ```

4. **Wait for MariaDB to initialize** (~10-15 seconds):

   ```bash
   docker-compose logs -f db
   ```

5. **Access the application**:

   - Open `http://localhost:8080` in your browser
   - Register an account

6. **Make yourself an admin**:

   ```bash
   docker-compose exec db /bin/sh /make_admin.sh YOUR_USERNAME
   ```

7. **Verify admin status**:
   - Go to Admin Control Panel (ACP) to confirm

## Hot Reload Development

The containers mount your source code directly:

- `/src` - Backend source (Babel-compiled to `/lib`)
- `/www` - Frontend assets
- `/lib` - Compiled output

Changes to these directories are automatically detected. The container runs `nodemon` to watch for changes and rebuild/restart automatically.

### Manual rebuild if needed:

```bash
docker-compose exec web npm run build-server
```

### View logs:

```bash
docker-compose logs -f web
```

## Stopping and Cleanup

```bash
# Stop containers (preserve data)
docker-compose down

# Remove containers and volumes (reset database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

## Database Access

To access MariaDB directly:

```bash
docker-compose exec db mariadb -u cytube3 -p
# Password: (from .env CYTUBE_MARIADB_PASSWORD)

# Or use:
docker-compose exec db mariadb -u root -p
# Password: (from .env MARIADB_ROOT_PASSWORD)
```

## Exposed Ports

- **8080** - Web server (HTTP)
- **1337** - Alt port (available for future use)
- **3306** - MariaDB (accessible from host)

## Adding TOML Configuration

To add email, captcha, or other optional services:

1. Create `.toml` files in `build/toml_configs/`
2. Rebuild: `docker-compose down && docker-compose build && docker-compose up -d`

See [CyTube config examples](https://github.com/calzoneman/sync/tree/3.0/conf/example) for templates.

## Troubleshooting

**Container won't start:**

```bash
docker-compose logs web
docker-compose logs db
```

**Permission errors on Windows:**

- Ensure Docker Desktop is configured for WSL2
- Run from WSL2 terminal, not PowerShell

**Can't connect to database:**

- Verify `.env` passwords are correct
- Wait for healthcheck to pass: `docker-compose logs db`
- Check if container exited: `docker-compose ps`

**Hot reload not working:**

- Verify volumes are mounted: `docker-compose exec web ls -la /service/coolhole/src`
- Check logs: `docker-compose logs -f web`
- Try manual rebuild: `docker-compose exec web npm run build-server`
