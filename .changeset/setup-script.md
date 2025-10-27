---
"@typie/monorepo": patch
---

Add comprehensive development environment setup automation

This change introduces a complete setup automation system for the Typie monorepo:

**New Scripts:**
- `bun run setup` - Automated development environment setup
- `bun run check-env` - Environment verification and diagnostics

**New Documentation:**
- QUICKSTART.md - Quick start guide for new developers
- docs/SETUP.md - Comprehensive setup guide with troubleshooting
- docs/SETUP_WINDOWS.md - Windows/WSL-specific instructions
- docs/CONTRIBUTING.md - Contribution guidelines
- .github/SETUP_SUMMARY.md - Setup resources summary

**New Environment Templates:**
- apps/api/.env.example - API environment variables template
- apps/website/.env.example - Website environment variables template

**Setup Script Features:**
- Environment check (Bun, Node, PostgreSQL, Redis, Meilisearch)
- Automated dependency installation
- Environment file creation with sensible defaults
- Database setup and migrations
- Service connection verification
- Shared package builds
- Clear progress indicators and error messages
- Cross-platform support (macOS, Linux, Windows/WSL)

**Benefits:**
- Reduces onboarding time for new developers
- Provides consistent development environment setup
- Includes comprehensive troubleshooting guides
- Automates repetitive setup tasks
- Validates environment configuration
