# Development Environment Setup Guide

This guide provides detailed instructions for setting up the Typie development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Manual Setup](#manual-setup)
- [Service Configuration](#service-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

1. **Bun** (v1.3.0+)
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Node.js** (v22+, recommended for compatibility)
   ```bash
   # macOS with Homebrew
   brew install node@22
   
   # Or use mise (recommended)
   mise install node@22
   ```

3. **PostgreSQL** (v15+)
   ```bash
   # macOS with Homebrew
   brew install postgresql@17
   brew services start postgresql@17
   
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

4. **Redis** (v7+)
   ```bash
   # macOS with Homebrew
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt install redis-server
   sudo systemctl start redis
   ```

5. **Meilisearch** (optional, for search features)
   ```bash
   # macOS with Homebrew
   brew install meilisearch
   
   # Or download from https://www.meilisearch.com/
   ```

### Optional Tools

- **mise** - Development environment manager (recommended)
- **Docker** - For running services in containers
- **Doppler** - For environment variable management in production

## Quick Setup

Run the automated setup script:

```bash
bun run setup
```

This will guide you through the entire setup process automatically.

## Manual Setup

If you prefer to set up manually or need to troubleshoot:

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd typie

# Install dependencies
bun install
```

### 2. Configure Environment Variables

#### API Environment

Create `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit the file and update the following required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OIDC_JWK` - Generate with `cd apps/api && bun run scripts/generate-jwk.ts`

#### Website Environment

Create `apps/website/.env`:

```bash
cp apps/website/.env.example apps/website/.env
```

The default values should work for local development.

### 3. Set Up PostgreSQL

```bash
# Create database user (if needed)
createuser -s postgres

# Create database
createdb typie

# Or with custom credentials
createdb -U myuser typie
```

Update `DATABASE_URL` in `apps/api/.env`:
```
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/typie
```

### 4. Run Database Migrations

```bash
cd apps/api
bun run drizzle-kit migrate
```

### 5. Seed Database (Optional)

```bash
cd apps/api
bun run scripts/seed.ts
```

### 6. Start Services

Ensure PostgreSQL and Redis are running:

```bash
# Check PostgreSQL
pg_isready

# Check Redis
redis-cli ping
```

If Meilisearch is needed:

```bash
meilisearch --master-key=masterKey
```

### 7. Build Shared Packages

```bash
# Run codegen
bun run turbo run codegen

# Build in order
bun run turbo run build --filter=@typie/styled-system
bun run turbo run build --filter=@typie/sark
bun run turbo run build --filter=@typie/ui
```

### 8. Start Development

```bash
# Start all services
bun run dev

# Or start individually
bun run dev --filter=api
bun run dev --filter=website
```

## Service Configuration

### PostgreSQL Configuration

#### Default Configuration

The setup script assumes PostgreSQL is running on:
- Host: `localhost`
- Port: `5432`
- Database: `typie`
- User: `postgres`
- Password: `postgres`

#### Custom Configuration

To use different credentials:

1. Update `apps/api/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. Create the database:
   ```bash
   createdb -U user database
   ```

#### SSL Configuration

For production or remote databases, enable SSL:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Redis Configuration

#### Default Configuration

- Host: `localhost`
- Port: `6379`
- No authentication

#### Custom Configuration

```env
REDIS_URL=redis://username:password@host:port
```

#### Redis with TLS

```env
REDIS_URL=rediss://username:password@host:port
```

### Meilisearch Configuration

#### Default Configuration

- Host: `localhost`
- Port: `7700`
- Master Key: `masterKey`

#### Custom Configuration

```env
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=your-master-key
```

#### Creating Indexes

After starting the API, create Meilisearch indexes:

```bash
cd apps/api
bun run scripts/create-meilisearch-index.ts
```

## Troubleshooting

### Issue: Port Already in Use

**Symptoms:** Error starting server - "Address already in use"

**Solution:**

```bash
# Find the process using the port
lsof -ti:4000  # API port
lsof -ti:3000  # Website port

# Kill the process
kill -9 <PID>

# Or kill all node/bun processes
pkill -9 bun
```

### Issue: Cannot Connect to PostgreSQL

**Symptoms:** "Connection refused" or "Could not connect to server"

**Solution:**

```bash
# Check if PostgreSQL is running
pg_isready

# If not running (macOS)
brew services start postgresql@17

# If not running (Linux)
sudo systemctl start postgresql

# Check logs
tail -f /usr/local/var/log/postgres.log  # macOS
sudo journalctl -u postgresql            # Linux
```

### Issue: Database Does Not Exist

**Symptoms:** "database does not exist"

**Solution:**

```bash
# Create the database
createdb typie

# Or with credentials
createdb -U postgres typie
```

### Issue: Cannot Connect to Redis

**Symptoms:** "ECONNREFUSED" or "Connection refused"

**Solution:**

```bash
# Check if Redis is running
redis-cli ping

# If not running (macOS)
brew services start redis

# If not running (Linux)
sudo systemctl start redis

# Check logs
tail -f /usr/local/var/log/redis.log  # macOS
sudo journalctl -u redis              # Linux
```

### Issue: Migration Errors

**Symptoms:** "Migration failed" or schema errors

**Solution:**

```bash
# Reset the database (WARNING: deletes all data)
dropdb typie
createdb typie

# Run migrations again
cd apps/api
bun run drizzle-kit migrate

# If still failing, check migration files
ls apps/api/drizzle/
```

### Issue: Build Errors in Shared Packages

**Symptoms:** "Cannot find module" or type errors

**Solution:**

```bash
# Clean everything
rm -rf node_modules .turbo
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Reinstall and rebuild
bun install
bun run turbo run codegen
bun run turbo run build
```

### Issue: TypeScript Errors

**Symptoms:** Type checking errors

**Solution:**

```bash
# Ensure codegen has run
bun run turbo run codegen

# Run type check
bun run lint:typecheck

# If errors persist, check tsconfig.json references
```

### Issue: OIDC/Auth Errors

**Symptoms:** "Invalid JWK" or authentication failures

**Solution:**

```bash
# Generate a new JWK
cd apps/api
bun run scripts/generate-jwk.ts

# Copy the output to apps/api/.env
# OIDC_JWK={"kty":"RSA",...}

# Restart the API server
```

### Issue: Environment Variables Not Loaded

**Symptoms:** "Required environment variable missing"

**Solution:**

```bash
# Check .env files exist
ls apps/api/.env
ls apps/website/.env

# Verify content
cat apps/api/.env | grep DATABASE_URL

# If using Doppler
doppler setup
```

### Issue: Turbo Cache Issues

**Symptoms:** Old code running or inconsistent behavior

**Solution:**

```bash
# Clear Turbo cache
rm -rf .turbo

# Clear all build artifacts
rm -rf apps/*/.svelte-kit
rm -rf packages/*/dist
rm -rf packages/*/.sark

# Rebuild
bun run turbo run codegen
bun run turbo run build
```

### Issue: Permission Denied

**Symptoms:** "EACCES" or "Permission denied" errors

**Solution:**

```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix script permissions
chmod +x scripts/*.ts
chmod +x apps/api/scripts/*.ts
```

## Advanced Setup

### Using Docker Compose

For running services in Docker:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: typie
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  
  meilisearch:
    image: getmeili/meilisearch:latest
    environment:
      MEILI_MASTER_KEY: masterKey
    ports:
      - "7700:7700"
    volumes:
      - meilisearch-data:/meili_data

volumes:
  postgres-data:
  meilisearch-data:
EOF

# Start services
docker compose up -d
```

### Using Doppler

For production-like environment variable management:

```bash
# Install Doppler
brew install dopplerhq/cli/doppler

# Setup Doppler
doppler setup

# Run with Doppler
doppler run -- bun run dev
```

### Multiple Environments

To work with multiple environments:

```bash
# Create environment-specific files
cp apps/api/.env apps/api/.env.dev
cp apps/api/.env apps/api/.env.staging

# Use environment-specific files
ln -sf .env.dev apps/api/.env
bun run dev
```

## Next Steps

After successful setup:

1. **Explore the codebase**: Start with `apps/api/src/main.ts` and `apps/website/src/routes/+page.svelte`
2. **Run tests**: `bun run test`
3. **Check code quality**: `bun run lint:eslint && bun run lint:typecheck`
4. **Read the documentation**: Check files in `docs/`

## Getting Help

If you're still having issues:

1. Check the main [README.md](../README.md)
2. Review the [CLAUDE.md](../CLAUDE.md) for project guidelines
3. Check existing GitHub issues
4. Create a new issue with detailed information about your problem
