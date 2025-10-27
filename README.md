# 타이피 (Typie)

작가를 위한 올인원 글쓰기 도구

작성, 정리, 공유까지. 글쓰기의 모든 과정을 하나의 도구로 해결하세요.

---

**⚡ Just want to get started quickly?** → See [QUICKSTART.md](QUICKSTART.md)

---

## 🚀 Quick Start

### Prerequisites

Before setting up the development environment, ensure you have the following tools installed:

- **Bun** 1.3.0+ - JavaScript runtime and package manager
- **Node.js** 22+ - JavaScript runtime (recommended for compatibility)
- **PostgreSQL** 15+ - Database
- **Redis** 7+ - Caching and real-time features
- **Meilisearch** (Optional) - Search functionality

### Automated Setup

The easiest way to set up the development environment is to use the automated setup script:

```bash
bun run setup
```

This script will:

1. ✓ Check that all required tools are installed
2. ✓ Install all monorepo dependencies
3. ✓ Create and configure environment files
4. ✓ Set up the PostgreSQL database
5. ✓ Run database migrations
6. ✓ Build shared packages
7. ✓ Verify service connections
8. ✓ Provide next steps

### Manual Setup

If you prefer to set up the environment manually or if the automated script fails:

#### 1. Install Dependencies

```bash
bun install
```

#### 2. Set Up Environment Variables

Create `.env` files in the following locations:

**apps/api/.env:**

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/typie

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Meilisearch Configuration
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey

# Auth & URLs
AUTH_URL=http://localhost:3000/auth
WEBSITE_URL=http://localhost:3000
USERSITE_URL=http://localhost:3000

# OIDC Configuration (generate with: cd apps/api && bun run scripts/generate-jwk.ts)
OIDC_CLIENT_ID=typie-web
OIDC_CLIENT_SECRET=dev-secret-change-in-production
OIDC_JWK={"kty":"RSA","n":"...","e":"AQAB","d":"..."}

# Server Configuration
LISTEN_PORT=4000
```

**apps/website/.env:**

```env
PUBLIC_API_URL=http://localhost:4000
PUBLIC_AUTH_URL=http://localhost:3000/auth
PUBLIC_WEBSITE_URL=http://localhost:3000
PUBLIC_WS_URL=ws://localhost:4000

PRIVATE_API_URL=http://localhost:4000
```

#### 3. Start Required Services

**PostgreSQL:**
```bash
# macOS with Homebrew
brew services start postgresql@17

# Or manually
postgres -D /usr/local/var/postgres
```

**Redis:**
```bash
# macOS with Homebrew
brew services start redis

# Or manually
redis-server
```

**Meilisearch (Optional):**
```bash
meilisearch --master-key=masterKey
```

#### 4. Set Up Database

```bash
# Create the database
createdb typie

# Run migrations
cd apps/api
bun run drizzle-kit migrate

# Seed initial data (optional)
bun run scripts/seed.ts
```

#### 5. Build Shared Packages

```bash
# Build packages in the correct order
bun run turbo run codegen
bun run turbo run build --filter=@typie/styled-system
bun run turbo run build --filter=@typie/sark
bun run turbo run build --filter=@typie/ui
```

## 💻 Development

### Start Development Servers

```bash
# Start all applications
bun run dev

# Start specific applications
bun run dev --filter=api      # API only
bun run dev --filter=website  # Website only
bun run dev --filter=desktop  # Desktop app only
```

### Available Scripts

- `bun run setup` - Run the automated setup script
- `bun run check-env` - Verify development environment is ready
- `bun run dev` - Start all development servers
- `bun run build` - Build all packages and apps
- `bun run lint:eslint` - Lint code with ESLint
- `bun run lint:prettier` - Check code formatting
- `bun run lint:typecheck` - Type check with TypeScript
- `bun run lint:svelte` - Check Svelte components
- `bun run test` - Run tests

## 📁 Project Structure

```
typie/
├── apps/                    # Applications
│   ├── api/                # Bun/Hono GraphQL API
│   ├── website/            # SvelteKit web application
│   ├── desktop/            # Tauri desktop application
│   ├── mobile/             # Flutter mobile application
│   ├── literoom/           # AWS Lambda for media processing
│   └── caddy/              # Caddy server configuration
├── packages/               # Shared packages
│   ├── ui/                 # Svelte UI components
│   ├── styled-system/      # PandaCSS tokens and styles
│   ├── sark/               # Custom GraphQL client
│   ├── lib/                # Shared utilities
│   ├── adapter-node/       # Node.js adapter
│   ├── tsconfig/           # Shared TypeScript config
│   └── lintconfig/         # Shared ESLint config
├── crates/                 # Rust crates
│   ├── fondue/             # Font metadata & WOFF2 conversion
│   ├── vermuda/            # macOS virtualization
│   └── vermuda-boot/       # UEFI boot tooling
└── scripts/                # Development scripts
    └── setup.ts            # Automated setup script
```

## 🛠️ Technology Stack

### Backend (API)

- **Runtime:** Bun
- **Framework:** Hono
- **GraphQL:** GraphQL Yoga + Pothos
- **Database:** PostgreSQL + Drizzle ORM
- **Real-time:** Yjs + Redis PubSub + WebSocket
- **Queue:** BullMQ
- **Search:** Meilisearch
- **Auth:** Custom OIDC provider with JWT

### Frontend (Website)

- **Framework:** SvelteKit + Svelte 5
- **Styling:** PandaCSS
- **Editor:** TipTap (ProseMirror)
- **GraphQL:** Sark (custom client)

### Desktop

- **Framework:** Tauri
- **UI:** SvelteKit + Svelte 5

### Mobile

- **Framework:** Flutter/Dart
- **GraphQL:** Ferry client

## 🔧 Common Tasks

### Database Migrations

```bash
cd apps/api

# Generate a new migration
bun run drizzle-kit generate

# Run migrations
bun run drizzle-kit migrate

# View database schema
bun run drizzle-kit studio
```

### GraphQL Schema

The GraphQL schema is automatically generated and available at:
- Development: http://localhost:4000/graphql
- Schema file: `apps/api/schema.graphql`

### Code Generation

```bash
# Run all codegen tasks
bun run turbo run codegen

# Run codegen for specific package
bun run turbo run codegen --filter=@typie/ui
```

## 🐛 Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find and kill the process using the port
lsof -ti:4000 | xargs kill -9  # API port
lsof -ti:3000 | xargs kill -9  # Website port
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Connect to the database manually
psql typie

# Reset the database (WARNING: deletes all data)
dropdb typie && createdb typie
cd apps/api && bun run drizzle-kit migrate
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Build Errors

```bash
# Clean and rebuild everything
rm -rf node_modules .turbo apps/*/node_modules packages/*/node_modules
bun install
bun run turbo run codegen
bun run turbo run build
```

## 📝 Environment Variables Reference

### API Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `MEILISEARCH_URL` | Yes | Meilisearch server URL |
| `MEILISEARCH_API_KEY` | Yes | Meilisearch API key |
| `AUTH_URL` | Yes | Authentication service URL |
| `WEBSITE_URL` | Yes | Website URL |
| `OIDC_CLIENT_ID` | Yes | OIDC client identifier |
| `OIDC_CLIENT_SECRET` | Yes | OIDC client secret |
| `OIDC_JWK` | Yes | JSON Web Key for OIDC |
| `LISTEN_PORT` | No | API server port (default: 4000) |
| `SENTRY_DSN` | No | Sentry error tracking DSN |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | No | OpenTelemetry endpoint |

### Website Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_API_URL` | Yes | API server URL |
| `PUBLIC_AUTH_URL` | Yes | Authentication URL |
| `PUBLIC_WEBSITE_URL` | Yes | Website URL |
| `PUBLIC_WS_URL` | Yes | WebSocket URL |
| `PRIVATE_API_URL` | Yes | Internal API URL |

## 🤝 Contributing

Please read our [Code of Conduct](docs/CODE_OF_CONDUCT) and [Contributor License Agreement](docs/CLA) before contributing.

## 📄 License

See [LICENSE](LICENSE) for more information.
