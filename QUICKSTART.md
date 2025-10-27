# Typie Quick Start Guide

Get up and running with Typie in minutes! 🚀

## Prerequisites Checklist

- [ ] Bun 1.3.0+ installed
- [ ] PostgreSQL 15+ installed and running
- [ ] Redis 7+ installed and running
- [ ] Git configured

## 30-Second Setup

```bash
# 1. Install dependencies and set up environment
bun run setup

# 2. Start development servers
bun run dev
```

That's it! Your development environment is ready.

## What Just Happened?

The setup script automatically:

✓ Checked your development environment  
✓ Installed all dependencies  
✓ Created `.env` files with sensible defaults  
✓ Set up the PostgreSQL database  
✓ Ran database migrations  
✓ Built shared packages  
✓ Verified service connections  

## Accessing the Application

| Service | URL | Purpose |
|---------|-----|---------|
| Website | http://localhost:3000 | Main web application |
| API | http://localhost:4000 | GraphQL API |
| GraphQL Playground | http://localhost:4000/graphql | Test GraphQL queries |

## Essential Commands

```bash
# Setup & Environment
bun run setup                   # Initial setup
bun run check-env               # Verify environment

# Development
bun run dev                     # Start all apps
bun run dev --filter=api        # Start API only
bun run dev --filter=website    # Start website only

# Code Quality
bun run lint:typecheck          # Type checking
bun run lint:eslint             # Linting
bun run test                    # Run tests

# Database
cd apps/api
bun run drizzle-kit migrate     # Run migrations
bun run drizzle-kit studio      # Database UI

# Build
bun run build                   # Build all packages
```

## Project Structure Overview

```
typie/
├── apps/
│   ├── api/         → GraphQL API (Bun + Hono)
│   ├── website/     → Web App (SvelteKit)
│   ├── desktop/     → Desktop App (Tauri)
│   └── mobile/      → Mobile App (Flutter)
├── packages/
│   ├── ui/          → Shared UI Components
│   ├── styled-system/ → Design Tokens
│   └── sark/        → GraphQL Client
└── docs/            → Documentation
```

## Common Tasks

### Create a New Database Migration

```bash
cd apps/api
# 1. Edit schema in src/db/schemas/tables.ts
# 2. Generate migration
bun run drizzle-kit generate
# 3. Apply migration
bun run drizzle-kit migrate
```

### Add a New UI Component

```bash
# 1. Create component in packages/ui/src/components/
# 2. Export from packages/ui/src/components/index.ts
# 3. Import in your app
# import { MyComponent } from '@typie/ui/components'
```

### Update Dependencies

```bash
bun update
```

## Troubleshooting Quick Fixes

### Port Already in Use
```bash
lsof -ti:4000 | xargs kill -9  # Kill API
lsof -ti:3000 | xargs kill -9  # Kill website
```

### Database Connection Failed
```bash
# Check PostgreSQL
pg_isready

# Restart PostgreSQL (macOS)
brew services restart postgresql@17
```

### Redis Connection Failed
```bash
# Check Redis
redis-cli ping

# Restart Redis (macOS)
brew services restart redis
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .turbo
bun run turbo run codegen
bun run turbo run build
```

## Need More Help?

- 📚 **Detailed Setup**: See [docs/SETUP.md](docs/SETUP.md)
- 🪟 **Windows/WSL**: See [docs/SETUP_WINDOWS.md](docs/SETUP_WINDOWS.md)
- 🤝 **Contributing**: See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- 📖 **Full README**: See [README.md](README.md)

## Installation from Scratch

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install bun postgresql@17 redis

# Start services
brew services start postgresql@17
brew services start redis

# Clone and setup
git clone <repository-url>
cd typie
bun run setup
bun run dev
```

### Ubuntu/Linux

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl start redis

# Setup PostgreSQL user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Clone and setup
git clone <repository-url>
cd typie
bun run setup
bun run dev
```

### Windows (WSL)

```bash
# 1. Install WSL 2 (PowerShell as Admin)
wsl --install

# 2. Open Ubuntu and run:
curl -fsSL https://bun.sh/install | bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib redis-server
sudo service postgresql start
sudo service redis-server start

# 3. Setup and run
git clone <repository-url>
cd typie
bun run setup
bun run dev
```

## Next Steps

1. ✏️ Explore the codebase starting with `apps/api/src/main.ts`
2. 🎨 Check out UI components in `packages/ui/src/components/`
3. 📝 Read the full documentation in `docs/`
4. 🚀 Start building!

---

**Happy coding!** 🎉

For questions or issues, please check the documentation or create an issue on GitHub.
