# Contributing to Typie

Thank you for your interest in contributing to Typie! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)

## Getting Started

### Prerequisites

Before contributing, make sure you have:

1. Read the [Code of Conduct](CODE_OF_CONDUCT)
2. Signed the [Contributor License Agreement](CLA)
3. Set up your development environment (see below)

### Development Environment Setup

Follow the setup guide appropriate for your operating system:

- **macOS/Linux**: See [SETUP.md](SETUP.md)
- **Windows (WSL)**: See [SETUP_WINDOWS.md](SETUP_WINDOWS.md)

**Quick setup:**
```bash
bun run setup
```

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/typie.git
cd typie

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/typie.git
```

### 2. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Build process or auxiliary tool changes

### 3. Make Changes

```bash
# Start development servers
bun run dev

# Run in specific workspace
bun run dev --filter=api
bun run dev --filter=website
```

### 4. Test Your Changes

```bash
# Run tests
bun run test

# Type check
bun run lint:typecheck

# Lint
bun run lint:eslint

# Format check
bun run lint:prettier
```

### 5. Commit Your Changes

See [Commit Guidelines](#commit-guidelines) below.

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feat/your-feature-name

# Create a Pull Request on GitHub
```

## Code Style

### General Guidelines

- Follow the existing code style in the file you're editing
- Use TypeScript for all new code
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused

### TypeScript

```typescript
// Good: Descriptive names, proper typing
async function fetchUserDocuments(userId: string): Promise<Document[]> {
  const documents = await db.query.Documents.findMany({
    where: eq(Documents.userId, userId),
  });
  return documents;
}

// Bad: Unclear names, missing types
async function get(id) {
  const d = await db.query.Documents.findMany({
    where: eq(Documents.userId, id),
  });
  return d;
}
```

### Svelte Components

```svelte
<!-- Good: Clear structure, semantic HTML -->
<script lang="ts">
  interface Props {
    title: string;
    items: Item[];
  }
  
  let { title, items }: Props = $props();
</script>

<section class={container}>
  <h2>{title}</h2>
  <ul>
    {#each items as item (item.id)}
      <li>{item.name}</li>
    {/each}
  </ul>
</section>

<style>
  /* Component-specific styles */
</style>
```

### PandaCSS Styling

Always use semantic tokens from `@typie/styled-system`:

```typescript
import { css } from '@typie/styled-system/css';

// Good: Using semantic tokens
const styles = css({
  color: 'text.default',
  backgroundColor: 'surface.default',
  borderColor: 'border.subtle',
  padding: '4',
  borderRadius: 'md',
});

// Bad: Hardcoded values
const styles = css({
  color: '#000000',
  backgroundColor: '#ffffff',
  border: '1px solid #cccccc',
  padding: '16px',
});
```

### GraphQL

```typescript
// Schema definition with Pothos
builder.queryField('user', (t) =>
  t.field({
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      return ctx.loaders.user.load(args.id);
    },
  })
);
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, or tooling changes
- `ci`: CI/CD changes

### Scopes

- `api`: API/backend changes
- `website`: Website/frontend changes
- `desktop`: Desktop app changes
- `mobile`: Mobile app changes
- `ui`: Shared UI components
- `db`: Database changes
- `deps`: Dependency updates

### Examples

```bash
# Feature
git commit -m "feat(api): add user profile endpoint"

# Bug fix
git commit -m "fix(website): resolve editor cursor position issue"

# Documentation
git commit -m "docs: update setup instructions for Windows"

# Refactoring
git commit -m "refactor(ui): simplify button component props"

# Breaking change
git commit -m "feat(api)!: change authentication flow

BREAKING CHANGE: OAuth endpoints now require PKCE"
```

## Pull Request Process

### Before Creating a PR

1. **Update from upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks:**
   ```bash
   bun run lint:eslint
   bun run lint:typecheck
   bun run lint:prettier
   bun run test
   ```

3. **Update documentation** if needed

4. **Test manually** in browser/app

### PR Title and Description

Use the same format as commit messages for PR titles:

```
feat(api): add user profile endpoint
```

In the description, include:

- **What**: What changes does this PR introduce?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How has this been tested?
- **Screenshots**: If UI changes, include before/after screenshots

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] Manual testing completed
- [ ] All checks passing

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** from maintainers required
3. **Address review comments** promptly
4. **Squash commits** if requested
5. **Keep PR focused** - one feature/fix per PR

## Project Structure

```
typie/
├── apps/
│   ├── api/              # GraphQL API (Bun + Hono)
│   │   ├── src/
│   │   │   ├── db/       # Database schemas and utilities
│   │   │   ├── graphql/  # GraphQL schema and resolvers
│   │   │   ├── services/ # Business logic
│   │   │   └── main.ts   # Entry point
│   │   └── scripts/      # Utility scripts
│   ├── website/          # Web app (SvelteKit)
│   │   ├── src/
│   │   │   ├── routes/   # Pages and API routes
│   │   │   ├── lib/      # Shared utilities
│   │   │   └── app.html  # HTML template
│   ├── desktop/          # Desktop app (Tauri + SvelteKit)
│   └── mobile/           # Mobile app (Flutter)
├── packages/
│   ├── ui/               # Shared Svelte components
│   ├── styled-system/    # PandaCSS tokens and utilities
│   ├── sark/             # GraphQL client
│   └── lib/              # Shared utilities
└── docs/                 # Documentation
```

## Testing

### Unit Tests

```typescript
// Example test
import { describe, it, expect } from 'bun:test';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('2024년 1월 1일');
  });
});
```

### Integration Tests

```typescript
// API integration test
import { describe, it, expect } from 'bun:test';
import { testClient } from './test-utils';

describe('User API', () => {
  it('should create user', async () => {
    const result = await testClient.mutation.createUser({
      input: { email: 'test@example.com' },
    });
    
    expect(result.data?.createUser.id).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
bun run test

# Run tests for specific package
bun run test --filter=@typie/api

# Run tests in watch mode
bun run test --watch
```

## Common Tasks

### Adding a New Database Table

1. Create schema in `apps/api/src/db/schemas/tables.ts`
2. Generate migration: `cd apps/api && bun run drizzle-kit generate`
3. Review migration in `apps/api/drizzle/`
4. Apply migration: `bun run drizzle-kit migrate`

### Adding a New GraphQL Type

1. Define type in `apps/api/src/graphql/types/`
2. Add resolvers in `apps/api/src/graphql/resolvers/`
3. Generate schema: `bun run dev` will auto-generate
4. Update frontend queries in respective apps

### Adding a UI Component

1. Create component in `packages/ui/src/components/`
2. Export from `packages/ui/src/components/index.ts`
3. Use in apps: `import { Component } from '@typie/ui/components'`

### Updating Dependencies

```bash
# Update all dependencies
bun update

# Update specific package
bun update <package-name>

# Check for outdated packages
bun outdated
```

## Getting Help

- **Documentation**: Check files in `docs/`
- **Code examples**: Look at existing code for patterns
- **Ask questions**: Open a discussion on GitHub
- **Report bugs**: Create an issue with detailed information

## License

By contributing, you agree that your contributions will be licensed under the project's license.
