# 🎬 Compress.lol – WebAssembly-Powered Media Compression

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=flat&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)

> **Compress.lol** – _"Crushing file sizes, not dreams"_ ⚡
> WebAssembly-powered media compression that runs entirely in your browser.

---

## ✨ Features

### Media Compression
- 🎬 **Video compression** – Target-size compression (8MB, 25MB, 50MB, 100MB) with smart motion detection
- 🎵 **Audio compression** – Convert and compress to MP3, AAC, Opus, OGG, WAV, FLAC, M4A
- 🖼️ **Image compression** – Compress images to WebP, JPEG, PNG with quality control

### User Experience
- 📂 **Drag & drop upload** – Simply drag files onto the page
- 📚 **Batch processing** – Queue multiple files and process them sequentially
- ⚡ **Lightning-fast processing** using WebAssembly FFmpeg
- 🔒 **100% client-side** – your files never leave your device
- 📱 **Responsive design** – works on desktop and mobile
- 🌍 **Multilingual interface** – English, French, Polish, Arabic
- 🎨 **Modern UI** with TailwindCSS, Shadcn/ui components, and Catppuccin themes

---

## 🚀 Quick Start

### 🛠️ Manual Installation

```bash
# Clone the repository
git clone https://github.com/vivekmaru/compress.lol
cd compress.lol

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🎯 How It Works

### Video Compression

1. **Video Analysis**: Automatically detects motion levels, resolution, and encoding characteristics
2. **Target-Based Encoding**: Calculates optimal bitrates and settings for your target file size
3. **Motion-Aware Settings**: Adjusts encoding parameters based on content complexity
4. **WebAssembly Processing**: Uses FFmpeg compiled to WASM for native-speed compression

**Target Sizes**: 8 MB (sharing) • 25 MB (social media) • 50 MB (email) • 100 MB (archival)

### Audio Compression

- Convert between formats: MP3, AAC, Opus, OGG, WAV, FLAC, M4A
- Three quality presets: High, Medium, Low
- Uses FFmpeg.wasm for audio transcoding

### Image Compression

- Output formats: WebP (best compression), JPEG, PNG
- Quality slider from 1-100%
- Optional max width constraint for resizing
- Uses Canvas API for fast, efficient compression

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

- **Maximum file size**: 5GB (browser memory limitation)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run check`
5. Format code: `npm run format`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

---

## 📄 License

Apache 2.0 License – see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Original compress.lol](https://github.com/anhostfr/compress.lol) by [Anhost](https://github.com/anhostfr) – This project is inspired from the original compress.lol
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
