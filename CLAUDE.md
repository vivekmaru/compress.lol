# CLAUDE.md - AI Assistant Guide

## Project Overview

This is a WebAssembly-powered media compression application that runs entirely in the browser. It uses FFmpeg compiled to WebAssembly (via `@ffmpeg/ffmpeg`) to compress video and audio files client-side, ensuring user privacy as no files are uploaded to any server.

### Key Features
- Target-size video compression (8MB, 25MB, 50MB, 100MB)
- Smart motion detection for optimized encoding
- Audio compression with format conversion (MP3, AAC, Opus, OGG, WAV, FLAC, M4A)
- Image compression with format conversion (WebP, JPEG, PNG) using Canvas API
- Drag & drop file upload with visual feedback
- Batch file processing (queue multiple files, process sequentially)
- Multi-language support (English, French, Polish, Arabic)
- Catppuccin theme support (Latte, Frappe, Macchiato, Mocha)
- 100% client-side processing

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | SvelteKit 2.x with Svelte 5 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4.x |
| UI Components | shadcn-svelte (bits-ui) |
| Media Processing | FFmpeg.wasm (@ffmpeg/ffmpeg) |
| i18n | Paraglide JS (@inlang/paraglide-js) |
| Build Tool | Vite 7.x |
| Package Manager | npm (bun.lock also present) |

## Codebase Structure

```
project-root/
├── src/
│   ├── routes/
│   │   ├── +page.svelte          # Main page with video/audio/image compression tabs
│   │   └── +layout.svelte        # Root layout
│   ├── lib/
│   │   ├── components/
│   │   │   ├── audio-compressor.svelte  # Audio compression component
│   │   │   ├── image-compressor.svelte  # Image compression component (Canvas API)
│   │   │   └── ui/                       # shadcn-svelte UI components
│   │   │       ├── alert/
│   │   │       ├── badge/
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── drop-zone/     # Drag & drop file upload component
│   │   │       ├── file-queue/    # Batch file queue component
│   │   │       ├── input/
│   │   │       ├── label/
│   │   │       ├── progress/
│   │   │       ├── select/
│   │   │       ├── selector/      # Language & theme selectors
│   │   │       ├── separator/
│   │   │       └── tabs/
│   │   ├── paraglide/            # Auto-generated i18n files
│   │   ├── utils/
│   │   │   └── shadcn.ts         # Utility functions (cn, type helpers)
│   │   └── assets/
│   │       └── favicon.svg
│   ├── hooks.server.ts           # Server hooks (Paraglide middleware, COOP/COEP headers)
│   ├── hooks.ts                  # Client hooks
│   ├── app.css                   # Global styles, Tailwind config, Catppuccin themes
│   ├── app.html                  # HTML template
│   └── app.d.ts                  # TypeScript declarations
├── messages/                     # i18n translation files
│   ├── en.json
│   ├── fr.json
│   ├── pl.json
│   └── ar.json
├── static/
│   └── ffmpeg/                   # FFmpeg WASM files (ffmpeg-core.js, .wasm, .worker.js)
├── project.inlang/               # Paraglide/inlang configuration
│   └── settings.json
├── .claude/                      # Claude Code agents and skills
│   ├── agents/
│   └── skills/
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── components.json               # shadcn-svelte configuration
├── Dockerfile                    # Multi-stage Docker build
└── .prettierrc                   # Code formatting config
```

## Development Workflow

### Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:5173)

# Build
npm run build        # Production build
npm run preview      # Preview production build

# Type Checking
npm run check        # Run svelte-check for TypeScript errors
npm run check:watch  # Watch mode

# Code Formatting
npm run format       # Format code with Prettier
npm run lint         # Check formatting
```

### Important Notes

1. **COOP/COEP Headers Required**: FFmpeg.wasm requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. These are configured in:
   - `src/hooks.server.ts` (production)
   - `vite.config.ts` (development)

2. **FFmpeg Exclusion**: FFmpeg packages are excluded from Vite's optimizeDeps to prevent bundling issues.

## Code Conventions

### Svelte 5 Runes

This project uses Svelte 5's new runes syntax:

```svelte
<script lang="ts">
  // State
  let count = $state(0);

  // Derived values
  const doubled = $derived(count * 2);

  // Props with bindable
  let { value = $bindable() }: { value: number } = $props();
</script>
```

### Component Imports

```typescript
// UI Components (use index.ts barrel exports)
import { Button } from '$lib/components/ui/button/index.js';
import * as Card from '$lib/components/ui/card/index.js';
import * as Select from '$lib/components/ui/select/index.js';

// i18n messages
import * as m from '$lib/paraglide/messages.js';

// Icons (from @lucide/svelte)
import Loader from '@lucide/svelte/icons/loader-circle';
```

### Styling

- Use Tailwind CSS utility classes
- Use the `cn()` utility from `$lib/utils/shadcn` for conditional classes
- Follow shadcn-svelte patterns for component styling
- CSS variables are defined in `src/app.css` for theming

### TypeScript

- Strict mode enabled
- Define interfaces for complex types
- Use `$state<Type>()` for typed reactive state
- Suppress FFmpeg type issues with `// @ts-ignore` when necessary

### Prettier Configuration

```json
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100
}
```

## Internationalization (i18n)

### Adding Translations

1. Add message keys to all files in `messages/`:
   - `en.json` (English - base locale)
   - `fr.json` (French)
   - `pl.json` (Polish)
   - `ar.json` (Arabic)

2. Use translations in components:
```svelte
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
</script>

<p>{m.some_message_key()}</p>
<!-- With HTML content -->
<p>{@html m.footer_text()}</p>
```

3. The Paraglide Vite plugin auto-generates types in `src/lib/paraglide/`

### Translation File Format

```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "message_key": "Translated text here"
}
```

## FFmpeg Integration

### Loading FFmpeg

FFmpeg is loaded client-side using blob URLs for the core files:

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
await ffmpeg.load({
  coreURL: await toBlobURL('ffmpeg/ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
  workerURL: await toBlobURL('ffmpeg/ffmpeg-core.worker.js', 'text/javascript')
});
```

### File Processing Pattern

```typescript
// Mount input file using WORKERFS for large file support
const inputDir = '/input';
await ffmpeg.createDir(inputDir);
await ffmpeg.mount('WORKERFS' as any, { files: [selectedFile] }, inputDir);

// Process
await ffmpeg.exec(['-i', `${inputDir}/${selectedFile.name}`, /* args */, 'output.mp4']);

// Read output
const data = await ffmpeg.readFile('output.mp4') as Uint8Array;

// Cleanup
await ffmpeg.unmount(inputDir);
await ffmpeg.deleteDir(inputDir);
await ffmpeg.deleteFile('output.mp4');
```

### Browser Detection

The app detects Chromium browsers for multi-threading optimization:

```typescript
const isChromium = !!(navigator as any).userAgentData;
const threadCount = isChromium ? getOptimalThreadCount() : 0;
```

## UI Components (shadcn-svelte)

### Available Components

Located in `src/lib/components/ui/`:
- `alert` - Alert messages
- `badge` - Status badges
- `button` - Action buttons
- `card` - Content cards
- `drop-zone` - Drag & drop file upload with visual feedback
- `file-queue` - Batch file queue with status indicators
- `input` - Form inputs
- `label` - Form labels
- `progress` - Progress bars
- `select` - Dropdown selects
- `separator` - Visual separators
- `tabs` - Tab navigation

### Custom Components

Located in `src/lib/components/`:
- `audio-compressor.svelte` - Audio compression with format conversion
- `image-compressor.svelte` - Image compression using Canvas API

### Adding New Components

Use the shadcn-svelte CLI:
```bash
npx shadcn-svelte@latest add [component-name]
```

Configuration is in `components.json`:
- Components path: `$lib/components`
- UI path: `$lib/components/ui`
- Utils path: `$lib/utils/shadcn`

## Theming

### Catppuccin Themes

The app supports Catppuccin themes defined in `src/app.css`:
- `theme-latte` - Light theme
- `theme-frappe` - Dark theme
- `theme-macchiato` - Dark theme
- `theme-mocha` - Dark theme

Theme is applied via class on the root element.

### CSS Variables

All colors use CSS custom properties:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`

## Docker Deployment

Multi-stage build with Node.js 20 Alpine:

```bash
# Build image
docker build -t media-compressor .

# Run container
docker run -p 3000:3000 media-compressor
```

The container runs on port 3000 with a non-root user (`sveltekit`).

## Common Patterns

### Error Handling

```svelte
<script lang="ts">
  let errorMessage = $state('');

  try {
    // operation
  } catch (error) {
    errorMessage = 'User-friendly error message';
  }
</script>

{#if errorMessage}
  <Alert.Root class="border-destructive">
    <Alert.Description>{errorMessage}</Alert.Description>
  </Alert.Root>
{/if}
```

### File Size Formatting

```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

### Progress Tracking

```svelte
<script lang="ts">
  let progress = $state(0);
  let startTime = $state<number>(0);
  let estimatedTimeRemaining = $state<number>(0);

  ffmpeg.on('progress', ({ progress: prog }) => {
    progress = Math.round(prog * 100);
    // Calculate ETA based on elapsed time and progress
  });
</script>
```

## Testing

Currently no test framework is configured. When adding tests:
- Consider Vitest for unit tests
- Consider Playwright for E2E tests
- Mock FFmpeg for faster test execution

## Performance Considerations

1. **Large Files**: Use WORKERFS mounting instead of `writeFile` for files over 100MB
2. **Threading**: Enable multi-threading only on Chromium browsers
3. **Memory**: FFmpeg WASM can be memory-intensive; monitor for OOM on large videos
4. **FPS Detection**: Runs in background after metadata load to avoid blocking UI

## Known Limitations

- Maximum file size: 5GB (browser memory limitation)
- Safari requires 15+ for SharedArrayBuffer support
- Multi-threading may be slower on some Chromium configurations

## Contributing

1. Follow existing code style (Prettier handles formatting)
2. Add translations for all supported languages
3. Use TypeScript strict typing
4. Test on multiple browsers (Chrome, Firefox, Safari)
5. Ensure COOP/COEP headers work correctly
