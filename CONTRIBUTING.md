# Contributing to compress.lol

Thank you for your interest in contributing to compress.lol! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, pnpm, or bun
- Git
- A modern browser (Chrome 90+, Firefox 89+, or Safari 15+)

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/compress.lol.git
   cd compress.lol
   ```

3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/anhostfr/compress.lol.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5173 in your browser

### Project Structure

```
compress.lol/
├── src/
│   ├── routes/              # SvelteKit routes
│   │   ├── +layout.svelte   # Root layout
│   │   └── +page.svelte     # Main page (compression UI)
│   ├── lib/
│   │   ├── components/ui/   # UI components (Shadcn)
│   │   ├── paraglide/       # i18n runtime
│   │   └── utils/           # Utility functions
│   ├── hooks.server.ts      # Server-side hooks
│   └── hooks.ts             # Client-side hooks
├── static/                  # Static assets
├── messages/                # i18n message files
└── tests/                   # Test files (add these!)
```

## Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Run the linter and formatter:
   ```bash
   npm run check      # TypeScript checking
   npm run format     # Format code
   npm run lint       # Check formatting
   ```

### Keeping Your Branch Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on upstream/main
git rebase upstream/main
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode (already configured)
- Provide types for all function parameters and return values
- Avoid `any` types unless absolutely necessary

Example:
```typescript
// Good
function compressVideo(file: File, targetSize: number): Promise<Blob> {
  // ...
}

// Avoid
function compressVideo(file: any, targetSize: any) {
  // ...
}
```

### Svelte Components

- Use Svelte 5 runes syntax (`$state`, `$derived`, `$effect`)
- Keep components small and focused
- Extract reusable logic into composables
- Use meaningful prop names

Example:
```svelte
<script lang="ts">
  interface Props {
    targetSize: number;
    onComplete?: (result: Blob) => void;
  }

  let { targetSize, onComplete }: Props = $props();
  let progress = $state(0);
</script>
```

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns
- Use Shadcn/ui components when possible
- Maintain responsive design
- Support both light and dark themes

### File Organization

- One component per file
- Co-locate related files (component + styles + tests)
- Use descriptive file names
- Follow SvelteKit naming conventions (`+page.svelte`, `+layout.svelte`, etc.)

### Naming Conventions

- **Files**: kebab-case (`video-compressor.svelte`)
- **Components**: PascalCase (`<VideoCompressor />`)
- **Variables/Functions**: camelCase (`const targetSize = 100`)
- **Constants**: UPPER_SNAKE_CASE (`const MAX_FILE_SIZE = 2048`)
- **Types/Interfaces**: PascalCase (`interface CompressionOptions`)

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
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(compression): add preset quality settings

Add predefined quality presets (high, medium, low) for quick
compression without manual configuration.

Closes #123
```

```bash
fix(ffmpeg): resolve memory leak in video processing

Free allocated memory after each compression operation to prevent
browser memory exhaustion.

Fixes #456
```

### Scope

Use scopes to indicate which part of the codebase is affected:
- `compression`: Compression logic
- `ui`: User interface
- `i18n`: Internationalization
- `ffmpeg`: FFmpeg.wasm integration
- `config`: Configuration files
- `deps`: Dependencies

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Changes have been tested locally
- [ ] TypeScript checks pass (`npm run check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Commit messages follow conventions
- [ ] Documentation is updated (if needed)
- [ ] No console errors or warnings

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template:
   - **Title**: Clear, concise description
   - **Description**: What changes were made and why
   - **Related Issues**: Link to related issues
   - **Screenshots**: For UI changes
   - **Testing**: How you tested the changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Screenshots (if applicable)
[Add screenshots here]

## Testing
- [ ] Tested locally
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested on mobile

## Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript checks pass
- [ ] Code is formatted
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process

1. At least one maintainer must approve the PR
2. All CI checks must pass
3. Address any requested changes
4. Once approved, a maintainer will merge the PR

## Testing

### Manual Testing

Test your changes in multiple browsers:
- Chrome/Edge 90+
- Firefox 89+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Test Checklist

- [ ] Upload various video formats (MP4, MOV, AVI, etc.)
- [ ] Upload various audio formats (MP3, WAV, FLAC, etc.)
- [ ] Test different target sizes
- [ ] Test with large files (100MB+)
- [ ] Test error handling (invalid files, etc.)
- [ ] Test on slow network (DevTools throttling)
- [ ] Test different screen sizes
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

### Future: Automated Testing

We plan to add automated tests. Consider contributing:
- Unit tests for utility functions
- Component tests for UI components
- E2E tests for critical user flows
- Performance benchmarks

## Documentation

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change existing functionality
- Fix a bug that affects usage
- Add or modify configuration
- Change deployment procedures

### Documentation Files

- `README.md`: Project overview and quick start
- `CLAUDE.md`: AI assistant guide
- `DEPLOYMENT.md`: Deployment instructions
- `CONTRIBUTING.md`: This file
- `ARCHITECTURE.md`: Technical architecture
- Code comments: Complex logic, algorithms, workarounds

### Writing Good Documentation

- Be clear and concise
- Use code examples
- Include screenshots for UI features
- Keep it up to date
- Use proper markdown formatting

## Common Tasks

### Adding a New Compression Preset

1. Define the preset in `src/routes/+page.svelte`
2. Add UI controls for the preset
3. Update compression logic to use preset
4. Test with various files
5. Document in README

### Adding a New Language

1. Create message files in `messages/[lang]/`
2. Update `project.inlang/settings.json`
3. Add language selector option
4. Test all translated strings
5. Document in README

### Adding a UI Component

1. Use Shadcn CLI: `npx shadcn-svelte@latest add [component]`
2. Customize the component as needed
3. Update component documentation
4. Test in light and dark themes

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Test thoroughly after updates
npm run check
npm run build
```

## Getting Help

### Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Documentation](https://svelte.dev/)
- [FFmpeg.wasm Documentation](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Pull Request Comments**: Code review and feedback

### Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Open a new issue with the `question` label

## Recognition

Contributors will be:
- Listed in GitHub contributors
- Credited in release notes (for significant contributions)
- Mentioned in the README (for major features)

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

---

Thank you for contributing to compress.lol! Every contribution helps make video compression more accessible to everyone.
