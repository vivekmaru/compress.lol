# CLAUDE.md - AI Developer Guide

This document provides essential context for AI assistants (like Claude) working on the compress.lol project.

## Project Overview

**compress.lol** is a WebAssembly-powered video and audio compression application that runs entirely in the browser. It uses FFmpeg.wasm to provide client-side media processing without uploading files to any server.

### Key Features
- Target-size compression with intelligent quality adjustment
- Motion detection for optimized encoding
- 100% client-side processing (privacy-first)
- Multilingual support via Paraglide JS
- Modern UI with Tailwind CSS and Shadcn/ui components
- Audio compression support (added recently)

## Technology Stack

### Core Framework
- **SvelteKit 2.x**: Full-stack framework with SSG/SSR capabilities
- **Svelte 5**: Latest version with runes and improved reactivity
- **TypeScript**: Type-safe development
- **Vite 7**: Build tool and dev server

### Key Dependencies
- **@ffmpeg/ffmpeg** (0.12.x): WebAssembly FFmpeg for media processing
- **@inlang/paraglide-js**: Type-safe i18n library
- **Tailwind CSS 4**: Utility-first CSS framework
- **bits-ui**: Headless UI components for Svelte

### Build & Deployment
- **adapter-auto**: Automatic platform detection (Vercel, Node, etc.)
- **adapter-node**: Available for manual Node.js deployment
- Docker support with multi-stage builds

## Architecture

### Directory Structure

```
compress.lol/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte      # Root layout with i18n
│   │   └── +page.svelte         # Main compression interface
│   ├── lib/
│   │   ├── components/ui/       # Shadcn/ui components
│   │   ├── paraglide/           # i18n runtime and messages
│   │   └── utils/               # Utility functions
│   ├── hooks.server.ts          # Server hooks (i18n + CORS)
│   ├── hooks.ts                 # Client hooks (routing)
│   └── app.d.ts                 # TypeScript declarations
├── static/                      # Static assets
├── messages/                    # i18n message files
├── project.inlang/              # Paraglide configuration
├── Dockerfile                   # Multi-stage Docker build
├── vercel.json                  # Vercel deployment config
└── svelte.config.js             # SvelteKit configuration
```

### Critical Configuration

#### 1. CORS Headers (Required for FFmpeg.wasm)

FFmpeg.wasm requires specific CORS headers to enable SharedArrayBuffer:

```javascript
// src/hooks.server.ts
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
```

These headers are also configured in `vercel.json` for Vercel deployments.

**Important**: Without these headers, FFmpeg.wasm will fail to initialize.

#### 2. Internationalization (i18n)

The app uses Paraglide JS for type-safe i18n:
- Messages are in `messages/` directory
- Server middleware handles locale detection
- HTML lang attribute is injected via `%paraglide.lang%` placeholder

#### 3. Adapter Configuration

Currently using `adapter-auto` which automatically detects the deployment platform:
- Vercel: Uses Vercel adapter
- Node: Falls back to Node adapter
- Static: Can generate static files

## Development Workflow

### Setup
```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run check      # Type checking
npm run format     # Format code with Prettier
```

### Building
```bash
npm run build      # Production build
npm run preview    # Preview production build locally
```

### Code Style
- Prettier for formatting (configured in `.prettierrc`)
- TypeScript strict mode
- ESM modules only (type: "module" in package.json)

## Common Tasks

### Adding a New Language

1. Create message files in `messages/[lang]/`
2. Update `project.inlang/settings.json` with new language code
3. Import and configure in paraglide setup
4. Add language selector option in UI

### Modifying Compression Logic

The main compression interface is in `src/routes/+page.svelte`:
- FFmpeg initialization and loading
- Compression algorithm with target size calculation
- Motion detection and bitrate adjustment
- Progress tracking and UI updates

### Adding New UI Components

1. Use Shadcn/ui CLI to add components: `npx shadcn-svelte@latest add [component]`
2. Components are added to `src/lib/components/ui/`
3. Configure in `components.json`
4. Use Tailwind for styling

### Deployment Considerations

1. **Vercel**: Requires `vercel.json` with CORS headers
2. **Docker**: Multi-stage build reduces image size
3. **Node**: Adapter-node builds to `build/` directory
4. **Static**: May work but loses SSR benefits

## Important Notes

### Performance
- FFmpeg.wasm loads ~30MB of WASM files
- First-time load includes core, worker, and WASM binary
- Files are cached for subsequent visits
- Processing is CPU-intensive (uses Web Workers)

### Browser Support
- Requires SharedArrayBuffer support
- Chrome/Edge 90+, Firefox 89+, Safari 15+
- Mobile support varies (iOS Safari has limitations)

### File Size Limits
- Browser memory limits apply (~2GB practical limit)
- Large files may cause browser to become unresponsive
- Consider adding file size warnings in UI

### Security
- All processing is client-side
- No file uploads to server
- CORS headers are required but should be restrictive

## Troubleshooting

### FFmpeg.wasm fails to load
- Check CORS headers in browser DevTools
- Verify `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` are set
- Check browser compatibility

### Build errors
- Run `npm run check` to identify TypeScript issues
- Check for missing dependencies
- Verify Svelte 5 syntax (runes like `$state`, `$derived`, etc.)

### i18n not working
- Verify Paraglide middleware in `hooks.server.ts`
- Check message files exist for all locales
- Ensure HTML lang placeholder is in `+layout.svelte`

## Testing Strategy

Currently no automated tests exist. Consider adding:
- Unit tests for compression algorithms
- Integration tests for FFmpeg.wasm
- E2E tests for user workflows
- Visual regression tests for UI

## Future Improvements

Potential areas for enhancement:
- Batch processing multiple files
- Custom compression presets
- Video preview before/after comparison
- Advanced FFmpeg options for power users
- Progress persistence (resume interrupted compressions)
- PWA support for offline use

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/)
- [FFmpeg.wasm Docs](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Shadcn Svelte](https://www.shadcn-svelte.com/)

---

**Last Updated**: 2025-11-16
