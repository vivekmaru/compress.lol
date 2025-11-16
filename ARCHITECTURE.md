# Architecture Documentation

This document provides a comprehensive overview of compress.lol's technical architecture, design decisions, and implementation details.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Application Flow](#application-flow)
- [Core Components](#core-components)
- [FFmpeg Integration](#ffmpeg-integration)
- [Internationalization](#internationalization)
- [State Management](#state-management)
- [Performance Considerations](#performance-considerations)
- [Security](#security)
- [Design Decisions](#design-decisions)

## Overview

compress.lol is a client-side video and audio compression application built with SvelteKit 2 and FFmpeg.wasm. The application runs entirely in the browser, ensuring user privacy by never uploading files to a server.

### Key Characteristics

- **100% Client-Side**: All processing happens in the browser using WebAssembly
- **Zero Backend**: No server-side file processing or storage
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Internationalized**: Multi-language support with type-safe i18n
- **Responsive**: Mobile-first design with desktop enhancements

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   SvelteKit App                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │ │
│  │  │     UI      │  │   State     │  │  i18n        │  │ │
│  │  │ Components  │→ │ Management  │  │ (Paraglide)  │  │ │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │ │
│  │         ↓                                              │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │         Compression Controller                  │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │         ↓                                              │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │            FFmpeg.wasm API                      │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  Web Worker                           │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │         FFmpeg Core (WebAssembly)               │  │ │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │  │ │
│  │  │  │  Core   │  │  WASM   │  │ Worker  │         │  │ │
│  │  │  │  .js    │  │  Binary │  │  .js    │         │  │ │
│  │  │  └─────────┘  └─────────┘  └─────────┘         │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Layers

1. **Presentation Layer**: Svelte components, UI elements
2. **Application Layer**: Business logic, state management
3. **Processing Layer**: FFmpeg.wasm integration
4. **Runtime Layer**: WebAssembly execution environment

## Technology Stack

### Frontend Framework

**SvelteKit 2.x**
- Server-side rendering (SSR) support
- File-based routing
- Automatic code splitting
- Built-in API routes (if needed)

**Svelte 5**
- Runes-based reactivity (`$state`, `$derived`, `$effect`)
- Fine-grained reactivity system
- Compile-time optimization
- Smaller bundle sizes

### Build Tools

**Vite 7**
- Fast HMR (Hot Module Replacement)
- ESM-based development
- Optimized production builds
- Plugin ecosystem

### Styling

**Tailwind CSS 4**
- Utility-first CSS
- JIT (Just-In-Time) compilation
- Custom design system
- Dark mode support

**Shadcn/ui**
- Accessible component library
- Built on Radix UI primitives (bits-ui for Svelte)
- Customizable components
- TypeScript support

### Media Processing

**FFmpeg.wasm 0.12.x**
- FFmpeg compiled to WebAssembly
- Multi-threaded processing via SharedArrayBuffer
- ~30MB total size (core + WASM + worker)
- Supports most FFmpeg features

### Internationalization

**Paraglide JS**
- Type-safe i18n
- Compile-time optimization
- Tree-shakeable translations
- SSR-friendly

### Type System

**TypeScript 5**
- Strict mode enabled
- Full type coverage
- Enhanced IDE support
- Compile-time safety

## Application Flow

### User Journey

```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Select    │
│    File     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Choose    │
│   Target    │
│    Size     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  FFmpeg     │
│   Loads     │
│ (if needed) │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Video     │
│  Analysis   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Calculate   │
│  Settings   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Compress   │
│   Video     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Download   │
│   Result    │
└─────────────┘
```

### Data Flow

```
User Input (File)
    ↓
File Validation
    ↓
Video Analysis (FFprobe)
    ├─ Resolution
    ├─ Duration
    ├─ Bitrate
    └─ Codec Info
    ↓
Compression Settings Calculation
    ├─ Target Bitrate
    ├─ Motion Detection
    ├─ Quality Settings
    └─ Codec Selection
    ↓
FFmpeg Encoding
    ├─ Progress Updates
    └─ Error Handling
    ↓
Output File (Blob)
    ↓
Download/Preview
```

## Core Components

### 1. Main Page (`src/routes/+page.svelte`)

**Responsibilities**:
- File input handling
- Compression UI and controls
- FFmpeg initialization and management
- Progress tracking
- Result display

**Key State**:
```typescript
let selectedFile = $state<File | null>(null);
let targetSize = $state<number>(25);  // MB
let progress = $state<number>(0);
let isCompressing = $state<boolean>(false);
let ffmpegLoaded = $state<boolean>(false);
```

### 2. Layout (`src/routes/+layout.svelte`)

**Responsibilities**:
- Global styles and theme
- Language selector
- Header/footer
- HTML lang attribute injection

### 3. Server Hooks (`src/hooks.server.ts`)

**Responsibilities**:
- CORS header injection for FFmpeg.wasm
- Paraglide middleware for i18n
- Request/response transformation

**Critical Headers**:
```typescript
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
```

### 4. Client Hooks (`src/hooks.ts`)

**Responsibilities**:
- URL rerouting for i18n
- Client-side navigation handling

## FFmpeg Integration

### Initialization

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// Load FFmpeg with explicit URLs
await ffmpeg.load({
  coreURL: await toBlobURL(coreURL, 'text/javascript'),
  wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
  workerURL: await toBlobURL(workerURL, 'text/javascript')
});
```

### File Processing

```typescript
// Write input file to FFmpeg virtual filesystem
await ffmpeg.writeFile('input.mp4', await fetchFile(file));

// Execute FFmpeg command
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  '-b:v', `${bitrate}k`,
  '-c:a', 'aac',
  '-b:a', '128k',
  'output.mp4'
]);

// Read output file
const data = await ffmpeg.readFile('output.mp4');
const blob = new Blob([data.buffer], { type: 'video/mp4' });
```

### Progress Tracking

```typescript
ffmpeg.on('progress', ({ progress, time }) => {
  progressValue = Math.round(progress * 100);
  // Update UI
});

ffmpeg.on('log', ({ message }) => {
  console.log(message);
});
```

### Compression Algorithm

```typescript
// 1. Analyze video
const probeResult = await analyzeVideo(file);
const { duration, bitrate, resolution } = probeResult;

// 2. Calculate target bitrate
const targetSizeBits = targetSizeMB * 8 * 1024 * 1024;
const audioBitrate = 128; // kbps
const videoBitrate = (targetSizeBits / duration) - audioBitrate;

// 3. Adjust for motion and complexity
const motionFactor = detectMotion(file); // 0.7 - 1.3
const adjustedBitrate = videoBitrate * motionFactor;

// 4. Select quality preset
const preset = selectPreset(adjustedBitrate);
// ultrafast, veryfast, faster, fast, medium, slow, slower, veryslow
```

## Internationalization

### Architecture

```
messages/
├── en/
│   └── common.json
├── fr/
│   └── common.json
└── es/
    └── common.json

project.inlang/
├── settings.json       # Language configuration
└── plugin.inlang/      # Build-time compilation
```

### Message Loading

```typescript
// Compile-time: Messages are extracted and compiled
// Runtime: Only active language is loaded
import * as m from '$lib/paraglide/messages';

// Type-safe usage
<h1>{m.welcome()}</h1>
<p>{m.fileSize({ size: formatSize(bytes) })}</p>
```

### Middleware Flow

```
Request
  ↓
Paraglide Middleware
  ├─ Detect language (URL, header, cookie)
  ├─ Set locale context
  └─ Inject lang attribute
  ↓
SvelteKit App
  ├─ Access m.* functions
  └─ Render with correct language
  ↓
Response
```

## State Management

### Svelte 5 Runes

**State**: Reactive primitive
```typescript
let count = $state(0);
let user = $state({ name: 'Alice', age: 30 });
```

**Derived**: Computed values
```typescript
let doubled = $derived(count * 2);
let isAdult = $derived(user.age >= 18);
```

**Effect**: Side effects
```typescript
$effect(() => {
  console.log(`Count is now ${count}`);
  // Cleanup logic
  return () => {
    console.log('Cleanup');
  };
});
```

### Component State Pattern

```typescript
<script lang="ts">
  // Props
  interface Props {
    initialValue: number;
  }
  let { initialValue }: Props = $props();

  // Local state
  let value = $state(initialValue);
  let isLoading = $state(false);

  // Derived state
  let isValid = $derived(value > 0 && value <= 100);

  // Effects
  $effect(() => {
    if (isValid) {
      // Do something
    }
  });

  // Actions
  function increment() {
    value++;
  }
</script>
```

## Performance Considerations

### Bundle Size

- SvelteKit: ~50KB (gzipped)
- FFmpeg.wasm: ~30MB (cached aggressively)
- UI Components: ~20KB
- **Total First Load**: ~100KB + 30MB FFmpeg (one-time)

### Optimization Strategies

1. **Code Splitting**
   - Lazy load FFmpeg only when needed
   - Split UI components by route
   - Dynamic imports for heavy features

2. **Caching**
   - Service Worker for FFmpeg files
   - Browser cache for static assets
   - LocalStorage for user preferences

3. **Web Workers**
   - FFmpeg runs in dedicated worker
   - Prevents UI blocking
   - Utilizes multi-core CPUs

4. **Memory Management**
   - Cleanup FFmpeg virtual filesystem after each operation
   - Release object URLs after download
   - Limit concurrent operations

### Performance Metrics

- **Time to Interactive**: <2s (without FFmpeg)
- **First Contentful Paint**: <1s
- **FFmpeg Load Time**: 3-10s (depends on network)
- **Compression Speed**: ~0.5x - 2x realtime (depends on settings)

## Security

### Threat Model

**What we protect against**:
- XSS attacks (via Content Security Policy)
- Clickjacking (via frame-ancestors)
- Data leaks (client-side only)

**What we don't protect against**:
- Malicious input files (user's responsibility)
- Client-side tampering (open source)

### Security Headers

```typescript
// Required for FFmpeg.wasm
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin

// Recommended security headers
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### Content Security Policy

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
worker-src 'self' blob:;
connect-src 'self';
```

### Data Privacy

- **No Server Uploads**: Files never leave the device
- **No Analytics**: Optional, privacy-respecting analytics only
- **No Tracking**: No third-party tracking scripts
- **Local Storage**: Only for preferences, not file data

## Design Decisions

### Why SvelteKit?

- **Small Bundle Size**: Svelte compiles away, no runtime overhead
- **Developer Experience**: Less boilerplate than React/Vue
- **Performance**: Faster than React for most operations
- **SSR Support**: Better SEO and initial load times

### Why FFmpeg.wasm?

- **Feature Complete**: Full FFmpeg capabilities
- **No Server Required**: Reduces infrastructure costs
- **Privacy**: User data stays on device
- **Cross-Platform**: Works on all modern browsers

### Why Client-Side Only?

**Advantages**:
- Zero hosting costs for processing
- Unlimited scalability
- Complete privacy
- No server maintenance

**Disadvantages**:
- Slower than server-side
- Limited by browser capabilities
- Requires modern browsers

**Decision**: Privacy and cost benefits outweigh performance trade-offs

### Why Paraglide over alternatives?

- **Type Safety**: Compile-time checks for missing translations
- **Performance**: Only active language is loaded
- **Developer Experience**: Auto-completion in IDE
- **Bundle Size**: Tree-shakeable, minimal overhead

### Why Tailwind CSS?

- **Productivity**: Rapid UI development
- **Consistency**: Design system enforced through utilities
- **Bundle Size**: JIT compilation includes only used classes
- **Customization**: Easy to extend with custom theme

## Future Considerations

### Potential Improvements

1. **Service Worker**
   - Offline support
   - Background processing
   - Install as PWA

2. **Batch Processing**
   - Process multiple files
   - Queue management
   - Concurrent operations

3. **Advanced Features**
   - Custom FFmpeg commands
   - Video editing (trim, crop, etc.)
   - Filters and effects

4. **Performance**
   - WebCodecs API for encoding
   - WebGPU for hardware acceleration
   - Streaming compression

5. **Testing**
   - Unit tests for utilities
   - Component tests
   - E2E tests for critical flows
   - Performance benchmarks

### Scalability

The application scales horizontally by nature:
- Each user's browser is a compute node
- No server-side bottlenecks
- CDN handles static file distribution

Limitations:
- Browser memory (~2GB practical limit)
- CPU performance varies by device
- Battery consumption on mobile

---

**Last Updated**: 2025-11-16
**Document Version**: 1.0
