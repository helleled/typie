# Development Setup Resources

This document summarizes all available setup resources for the Typie monorepo.

## 📚 Documentation

### Quick References
- **[QUICKSTART.md](../../QUICKSTART.md)** - Fast setup guide (30 seconds)
- **[README.md](../../README.md)** - Complete project documentation

### Detailed Guides
- **[docs/SETUP.md](../../docs/SETUP.md)** - Comprehensive setup guide with troubleshooting
- **[docs/SETUP_WINDOWS.md](../../docs/SETUP_WINDOWS.md)** - Windows/WSL-specific instructions
- **[docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md)** - Contribution guidelines

## 🛠️ Setup Scripts

### Automated Setup
```bash
bun run setup
```
Location: `scripts/setup.ts`

**What it does:**
- ✓ Checks development environment
- ✓ Installs dependencies
- ✓ Creates environment files
- ✓ Sets up PostgreSQL database
- ✓ Runs migrations
- ✓ Builds shared packages
- ✓ Verifies service connections

### Environment Check
```bash
bun run check-env
```
Location: `scripts/check-env.ts`

**What it does:**
- ✓ Verifies tools are installed
- ✓ Checks service connections
- ✓ Validates configuration files
- ✓ Confirms database setup

## 📝 Environment Templates

### API Environment
- **Template:** `apps/api/.env.example`
- **Target:** `apps/api/.env`
- **Contains:** Database, Redis, Meilisearch, auth configuration

### Website Environment
- **Template:** `apps/website/.env.example`
- **Target:** `apps/website/.env`
- **Contains:** API URLs, auth configuration

## 🚀 Getting Started

### First Time Setup

1. **Prerequisites:**
   - Install Bun 1.3.0+
   - Install PostgreSQL 15+
   - Install Redis 7+

2. **Run Setup:**
   ```bash
   bun run setup
   ```

3. **Start Development:**
   ```bash
   bun run dev
   ```

### Verify Setup

```bash
bun run check-env
```

## 📖 Documentation Structure

```
typie/
├── QUICKSTART.md              # Quick start guide
├── README.md                  # Main documentation
├── CLAUDE.md                  # AI assistant guidelines
├── docs/
│   ├── SETUP.md              # Detailed setup guide
│   ├── SETUP_WINDOWS.md      # Windows-specific guide
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── CODE_OF_CONDUCT       # Code of conduct
│   └── CLA                   # Contributor agreement
└── scripts/
    ├── setup.ts              # Automated setup script
    └── check-env.ts          # Environment verification
```

## 🔧 Troubleshooting

Common issues and solutions:

| Issue | Solution | Reference |
|-------|----------|-----------|
| Port in use | `lsof -ti:4000 \| xargs kill -9` | [SETUP.md](../../docs/SETUP.md#troubleshooting) |
| Database connection | Check PostgreSQL is running | [SETUP.md](../../docs/SETUP.md#issue-cannot-connect-to-postgresql) |
| Redis connection | Check Redis is running | [SETUP.md](../../docs/SETUP.md#issue-cannot-connect-to-redis) |
| Build errors | Clean and rebuild | [SETUP.md](../../docs/SETUP.md#issue-build-errors-in-shared-packages) |

## 📋 Checklist

Use this checklist to ensure your environment is ready:

- [ ] Bun installed and working
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Dependencies installed (`bun install`)
- [ ] Environment files created (`.env`)
- [ ] Database created and migrated
- [ ] Shared packages built
- [ ] Development servers start successfully

## 🆘 Getting Help

1. **Check Documentation:**
   - Start with [QUICKSTART.md](../../QUICKSTART.md)
   - Review [SETUP.md](../../docs/SETUP.md) for detailed instructions
   - See platform-specific guides if needed

2. **Run Diagnostics:**
   ```bash
   bun run check-env
   ```

3. **Common Commands:**
   ```bash
   bun run setup      # Re-run setup
   bun run dev        # Start development
   bun install        # Reinstall dependencies
   ```

4. **Still Stuck?**
   - Check existing GitHub issues
   - Create a new issue with:
     - Output of `bun run check-env`
     - Error messages
     - Your operating system
     - Steps to reproduce

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run setup` | Run automated setup |
| `bun run check-env` | Verify environment |
| `bun run dev` | Start development servers |
| `bun run build` | Build all packages |
| `bun run lint:typecheck` | Type check |
| `bun run lint:eslint` | Lint code |
| `bun run test` | Run tests |

## 🔄 Updating

To update your development environment:

```bash
# Pull latest changes
git pull

# Update dependencies
bun update

# Rebuild
bun run turbo run codegen
bun run turbo run build

# Run migrations (if any)
cd apps/api
bun run drizzle-kit migrate
```

## 🌟 Best Practices

1. **Run setup after cloning:** Always run `bun run setup` on first clone
2. **Check environment regularly:** Use `bun run check-env` if things break
3. **Keep services running:** PostgreSQL and Redis should be running during development
4. **Update regularly:** Keep dependencies and tools up to date
5. **Clean when stuck:** Remove `.turbo` and rebuild if issues persist

---

**Ready to contribute?** See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
