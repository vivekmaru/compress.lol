# Deployment Guide

This guide covers deploying compress.lol to various platforms. The application is a SvelteKit app with special requirements for FFmpeg.wasm support.

## Prerequisites

Before deploying, ensure:
- Node.js 20+ is available on the target platform
- The platform supports setting custom HTTP headers
- The platform has sufficient memory for FFmpeg.wasm operations

## Critical Requirement: CORS Headers

**IMPORTANT**: FFmpeg.wasm requires specific CORS headers to function. Without these, the application will fail to load FFmpeg.

Required headers:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin
```

These headers enable `SharedArrayBuffer`, which FFmpeg.wasm needs for performance.

---

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest deployment option for SvelteKit apps and is already configured.

#### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Configuration

The `vercel.json` file is already configured with the required CORS headers:

```json
{
  "github": {
    "silent": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    }
  ]
}
```

#### Environment Variables

No environment variables are required for basic deployment. The app runs entirely client-side.

#### Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `.svelte-kit/output` (automatic)
- **Install Command**: `npm install`
- **Node Version**: 20.x

#### Custom Domains

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

---

### 2. Docker

Use Docker for self-hosted deployments or cloud platforms that support containers.

#### Build the Image

```bash
# Build the Docker image
docker build -t compress-lol .

# Run the container
docker run -p 3000:3000 compress-lol
```

#### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  compress-lol:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

#### Dockerfile Details

The included Dockerfile uses multi-stage builds:

1. **base**: Sets up Node.js 20 Alpine
2. **deps**: Installs dependencies
3. **builder**: Builds the application
4. **runner**: Production runtime (minimal size)

Key features:
- Uses `pnpm` for faster installs
- Runs as non-root user (`sveltekit`)
- Exposes port 3000
- Production-optimized build

#### Deploying to Container Platforms

**AWS ECS/Fargate**:
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag compress-lol:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/compress-lol:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/compress-lol:latest
```

**Google Cloud Run**:
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/<project-id>/compress-lol
gcloud run deploy compress-lol --image gcr.io/<project-id>/compress-lol --platform managed
```

Remember to configure CORS headers in your platform's ingress/load balancer settings.

---

### 3. Node.js Server

Deploy to any Node.js hosting platform (Heroku, Railway, Render, etc.).

#### Build for Node

The project uses `adapter-auto` which will automatically use the Node adapter when needed. Alternatively, explicitly use the Node adapter:

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

const config = {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
      envPrefix: ''
    })
  }
};
```

#### Build and Run

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
node build
```

#### Environment Variables

```bash
PORT=3000              # Server port
HOST=0.0.0.0          # Bind address
NODE_ENV=production   # Environment
ORIGIN=https://your-domain.com  # Optional: Set origin for CORS
```

#### Process Management

Use PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start the app
pm2 start build/index.js --name compress-lol

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

PM2 ecosystem file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'compress-lol',
    script: './build/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    }
  }]
};
```

#### Reverse Proxy (Nginx)

Configure Nginx to add required CORS headers:

```nginx
server {
    listen 80;
    server_name compress.lol;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Required CORS headers for FFmpeg.wasm
        add_header Cross-Origin-Opener-Policy "same-origin" always;
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Resource-Policy "cross-origin" always;
    }
}
```

---

### 4. Static Hosting (Cloudflare Pages, Netlify)

The app can be deployed as a static site, but you'll lose SSR benefits.

#### Build Static Site

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false
    })
  }
};
```

#### Cloudflare Pages

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add custom headers in `_headers` file:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: cross-origin
```

#### Netlify

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Resource-Policy = "cross-origin"
```

---

## Platform-Specific Instructions

### Railway

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `node build`
4. Add environment variable: `PORT=3000`
5. Configure headers in Railway's proxy settings or use Nginx

### Render

1. Create new Web Service
2. Connect repository
3. Build Command: `npm run build`
4. Start Command: `node build`
5. Add CORS headers via Render's header configuration

### Heroku

```bash
# Create Heroku app
heroku create compress-lol

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=1
```

Add `Procfile`:
```
web: node build
```

Configure headers using middleware or Heroku's edge features.

---

## Monitoring and Maintenance

### Health Checks

Add a health check endpoint in `src/routes/health/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';

export const GET = () => {
  return json({ status: 'ok', timestamp: new Date().toISOString() });
};
```

### Logging

For production, add structured logging:

```bash
npm install pino pino-pretty
```

### Performance Monitoring

Consider adding:
- Sentry for error tracking
- Google Analytics for usage metrics
- Cloudflare Analytics for CDN performance

### Updating

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart service
pm2 restart compress-lol  # or your process manager
```

---

## Troubleshooting

### FFmpeg.wasm Not Loading

**Symptom**: Console errors about SharedArrayBuffer

**Solution**:
1. Verify CORS headers are set correctly
2. Check browser DevTools Network tab for header values
3. Test with `curl -I https://your-domain.com`

### Memory Issues

**Symptom**: Out of memory errors or crashes

**Solution**:
1. Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" node build`
2. Use Docker with memory limits
3. Add file size restrictions in UI

### Build Failures

**Symptom**: Build fails with TypeScript errors

**Solution**:
1. Run `npm run check` locally first
2. Ensure Node 20+ is used
3. Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`

### CORS Errors in Production

**Symptom**: Different behavior in production vs development

**Solution**:
1. Verify headers are actually being sent (use browser DevTools)
2. Check for conflicting headers from CDN/proxy
3. Ensure headers are set on all routes, including static assets

---

## Security Checklist

- [ ] CORS headers are correctly configured
- [ ] HTTPS is enabled (required for SharedArrayBuffer in some browsers)
- [ ] No sensitive data in environment variables
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Rate limiting implemented (if needed)
- [ ] File size limits enforced

---

## Performance Optimization

### CDN Configuration

1. Cache static assets aggressively
2. Don't cache HTML/API routes
3. Precompress assets (Brotli/Gzip)

### SvelteKit Optimizations

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'ffmpeg': ['@ffmpeg/ffmpeg', '@ffmpeg/util']
        }
      }
    }
  }
});
```

### Asset Optimization

- Optimize images in `static/`
- Minify CSS/JS (done automatically)
- Use lazy loading for heavy components

---

## Cost Estimation

### Vercel
- **Hobby**: Free (100GB bandwidth, good for testing)
- **Pro**: $20/month (1TB bandwidth)

### Railway
- **Free**: $5 credit/month
- **Developer**: ~$5-20/month depending on usage

### Render
- **Free**: Limited hours, sleeps after inactivity
- **Starter**: $7/month for always-on service

### Self-hosted (VPS)
- **DigitalOcean/Linode**: $5-20/month
- **AWS Lightsail**: $3.50-20/month

---

## Support

For deployment issues:
1. Check this guide first
2. Review [SvelteKit deployment docs](https://kit.svelte.dev/docs/adapters)
3. Open an issue on GitHub
4. Check FFmpeg.wasm documentation

---

**Last Updated**: 2025-11-16
