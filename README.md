# 🎬 Compress.lol – WebAssembly-Powered Video Compression

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub issues](https://img.shields.io/github/issues/anhostfr/compress.lol)](https://github.com/anhostfr/compress.lol/issues)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=flat&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)

> **Compress.lol** – _"Crushing file sizes, not dreams"_ ⚡  
> WebAssembly-powered video compression that runs entirely in your browser.

---

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - AI Developer Guide for working with Claude
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide for all platforms
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and design decisions

---

## ✨ Features

- 🎯 **Target-size compression** with intelligent quality adjustment
- 🧠 **Motion detection** for optimized encoding settings
- ⚡ **Lightning-fast processing** using WebAssembly FFmpeg
- 🔒 **100% client-side** – your videos never leave your device
- 📱 **Responsive design** – works on desktop and mobile
- 🌍 **Multilingual interface** with Paraglide JS
- 🎨 **Modern UI** with TailwindCSS, Shadcn/ui components, and Catppuccin themes

---

## 🚀 Quick Start

### 🛠️ Manual Installation

```bash
# Clone the repository
git clone https://github.com/anhostfr/compress.lol
cd compress.lol

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🎯 How It Works

### Smart Compression Algorithm

1. **Video Analysis**: Automatically detects motion levels, resolution, and encoding characteristics
2. **Target-Based Encoding**: Calculates optimal bitrates and settings for your target file size
3. **Motion-Aware Settings**: Adjusts encoding parameters based on content complexity
4. **WebAssembly Processing**: Uses FFmpeg compiled to WASM for native-speed compression

### Compression Targets

- **8 MB** – Ultra compression for sharing
- **25 MB** – High compression for social media
- **50 MB** – Medium compression for email
- **100 MB** – Low compression for archival

---

## 🏗️ Architecture

compress.lol uses a modern tech stack optimized for performance and developer experience:

- **Frontend**: SvelteKit 2 + Svelte 5 with runes
- **Styling**: Tailwind CSS 4 + Shadcn/ui components
- **Media Processing**: FFmpeg.wasm (WebAssembly)
- **i18n**: Paraglide JS for type-safe translations
- **Build Tool**: Vite 7
- **Deployment**: Vercel, Docker, or Node.js

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🛠️ Development

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run check      # TypeScript check
npm run format     # Prettier formatting
```

### FFmpeg Integration

The app uses FFmpeg.wasm for video processing:

- **Core**: `ffmpeg-core.js` – Main FFmpeg engine
- **WASM**: `ffmpeg-core.wasm` – WebAssembly binary
- **Worker**: `ffmpeg-core.worker.js` – Background processing

---

### Adding Languages

1. Create new message files in `src/lib/paraglide/messages/`
2. Update language configuration
3. Add language selector option

---

## 📱 Browser Support

- **Chrome/Edge**: 90+
- **Firefox**: 89+
- **Safari**: 15+

Requires WebAssembly and SharedArrayBuffer support.

### File Size Limits

- **Maximum file size**: 2GB (browser limitation)

---

## 🚀 Deployment

compress.lol can be deployed to various platforms. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions:

- **Vercel** (Recommended) - One-click deployment with automatic CORS headers
- **Docker** - Self-hosted with multi-stage builds
- **Node.js** - Deploy to any Node.js hosting platform
- **Static** - Cloudflare Pages, Netlify, etc.

**Important**: All deployment platforms must support custom CORS headers for FFmpeg.wasm to work.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Quick start:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run checks: `npm run check && npm run format`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, commit guidelines, and more.

---

## 📄 License

Apache 2.0 License – see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) – FFmpeg compiled to WebAssembly
- [SvelteKit](https://kit.svelte.dev/) – The fastest way to build svelte apps
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) – Type-safe i18n
- [TailwindCSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) – Beautiful UI components
- [Catppuccin](https://catppuccin.com/) – Lovely color palette and themes

---

<div align="center">
    <em>"Making video compression accessible to everyone, one byte at a time"</em>
</div>
