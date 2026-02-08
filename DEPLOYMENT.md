# Deploying Compress.lol to Cloudflare

This application is configured to run on Cloudflare Pages/Workers. Deploying to Cloudflare provides significant performance benefits by enabling **multi-threaded video compression** on the client side through specific security headers (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`).

## Prerequisites

1.  **Cloudflare Account**: You need a free Cloudflare account.
2.  **Node.js**: Ensure you have Node.js installed locally.
3.  **Wrangler**: The Cloudflare CLI tool.

## Deployment Steps

### 1. Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

### 2. Login to Cloudflare

Authenticate Wrangler with your Cloudflare account:

```bash
npx wrangler login
```

This will open a browser window to authorize the CLI.

### 3. Deploy

Run the deploy script:

```bash
npm run deploy
```

This command will:
1.  Build the SvelteKit application using `@sveltejs/adapter-cloudflare`.
2.  Upload the static assets and worker script to Cloudflare Pages.

Follow the prompts in the terminal to create a new project (e.g., `compress-lol`) if this is your first time deploying.

## Why Cloudflare?

Video compression is CPU-intensive. By default, browsers restrict WebAssembly to a single thread for security reasons. To unlock multi-threading (which can speed up compression by 4x-8x), the server must send specific security headers:

-   `Cross-Origin-Opener-Policy: same-origin`
-   `Cross-Origin-Embedder-Policy: require-corp`

This deployment is pre-configured to serve these headers automatically via Cloudflare Workers, ensuring your users get the fastest possible compression speeds.
