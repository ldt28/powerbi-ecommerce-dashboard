# Contributing Guidelines

Thank you for your interest in contributing to PowerBI Ecommerce Dashboard! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment. All contributors should:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unethical or unprofessional conduct

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/powerbi-ecommerce-dashboard.git
cd powerbi-ecommerce-dashboard
```

### 2. Set Up Development Environment

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

### 3. Create a Branch

```bash
# Always branch from main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Make Changes

- Follow coding standards (see below)
- Write tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 2. Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- path/to/test.test.ts

# Run tests in watch mode
pnpm test -- --watch
```

### 3. Check Code Quality

```bash
# TypeScript type checking
pnpm check

# Format code
pnpm format

# Lint (if configured)
pnpm lint
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new dashboard export feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for function parameters and return values
- Avoid `any` type; use proper interfaces or `unknown`
- Use strict null checks

```typescript
// ✅ Good
interface User {
  id: string;
  name: string | null;
  email: string;
}

function getUser(id: string): User | null {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Follow naming conventions (PascalCase for components)

```typescript
// ✅ Good
interface DashboardCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down';
}

export function DashboardCard({ title, value, trend }: DashboardCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `DashboardCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Tests: `*.test.ts` or `*.test.tsx`
- Configuration files: lowercase (e.g., `vite.config.ts`)

### Imports

- Absolute imports from root using `@/` alias
- Group imports: external libraries, internal modules, styles
- Sort imports alphabetically within groups

```typescript
// ✅ Good
import { useState } from 'react';
import { motion } from 'framer-motion';

import { DashboardCard } from '@/components/DashboardCard';
import { formatCurrency } from '@/lib/utils';

import './styles.css';
```

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases

```typescript
try {
  const data = await fetchData();
  return { success: true, data };
} catch (error) {
  console.error('Failed to fetch data:', error);
  return { 
    success: false, 
    error: 'Unable to load data. Please try again.' 
  };
}
```

## Testing

### Writing Tests

- Write tests for all new features
- Aim for high test coverage
- Use descriptive test names
- Test both happy paths and edge cases

```typescript
describe('DashboardCard', () => {
  it('should display title and value correctly', () => {
    render(<DashboardCard title="Revenue" value={1000} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('should show upward trend indicator when trend is up', () => {
    render(<DashboardCard title="Revenue" value={1000} trend="up" />);
    expect(screen.getByTestId('trend-up')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run in watch mode during development
pnpm test -- --watch
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(dashboard): add revenue export to Excel

Implemented Excel export functionality for revenue reports.
Includes formatting, charts, and multiple sheets.

Closes #123

---

fix(auth): resolve session timeout issue

Fixed premature session expiration by extending token refresh interval.

---

docs(readme): update installation instructions

Added detailed steps for MySQL configuration.
```

## Pull Requests

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Changes are tested locally

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots of UI changes

## Related Issues
Fixes #123
```

### Review Process

1. Maintainer reviews code
2. Automated checks must pass
3. Address review feedback
4. PR is merged by maintainer

## Issue Reporting

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check if the issue is fixed in the latest version
- Gather relevant information (browser, OS, versions)

### Bug Reports

Include:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120.0]
- Node.js: [e.g., 20.10.0]

**Screenshots**
If applicable

**Additional Context**
Any other relevant information
```

### Feature Requests

Include:

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you've thought about

**Use Cases**
Who will benefit from this feature?

**Additional Context**
Mockups, examples, references
```

## Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update API.md for endpoint changes
- Include inline comments for complex logic

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use proper formatting (Markdown)

## Release Process

Releases are managed by maintainers following semantic versioning:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

Thank you for contributing! 🎉
