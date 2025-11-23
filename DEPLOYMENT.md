# Deployment Guide for compress.lol

This guide covers deploying compress.lol to **Vercel** (recommended for simplicity) and **VPS + Docker** (for full control).

## Prerequisites

Before deploying, ensure you understand the critical requirements:

### Required HTTP Headers

FFmpeg WASM requires these headers for SharedArrayBuffer support:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These headers are:
- Automatically set by SvelteKit in `src/hooks.server.ts`
- Configured in `vercel.json` for Vercel deployments
- Configured in `nginx.conf` for VPS deployments

---

## Option 1: Vercel (Recommended)

Vercel offers the simplest deployment with zero configuration needed.

### Step 1: Prepare Your Repository

Ensure your repository includes the `vercel.json` file (already configured):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "sveltekit",
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

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub/GitLab/Bitbucket repository
4. Vercel auto-detects SvelteKit - no configuration needed
5. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

### Step 3: Configure Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Domains**
3. Add your custom domain
4. Update DNS records as instructed

### Step 4: Verify Deployment

After deployment, verify the headers are working:

```bash
curl -I https://your-domain.vercel.app
```

You should see:
```
cross-origin-embedder-policy: require-corp
cross-origin-opener-policy: same-origin
```

### Vercel Environment Variables

No environment variables are required for basic deployment. Optional variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ORIGIN` | Override the origin URL | Auto-detected |

---

## Option 2: VPS + Docker

For full control over your deployment, use Docker on a VPS.

### Prerequisites

- A VPS with at least 1GB RAM (2GB recommended)
- Docker and Docker Compose installed
- A domain name pointing to your VPS IP
- (Optional) SSL certificates

### Step 1: Server Setup

#### Install Docker (Ubuntu/Debian)

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER

# Logout and login again, then verify
docker --version
docker compose version
```

#### Install Docker (Other distros)

- **Fedora/CentOS**: `sudo dnf install docker docker-compose`
- **Arch**: `sudo pacman -S docker docker-compose`

### Step 2: Clone and Deploy

```bash
# Clone the repository
git clone https://github.com/yourusername/compress.lol.git
cd compress.lol

# Build and start the container
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

The app will be available at `http://your-server-ip:3000`

### Step 3: Set Up Reverse Proxy with SSL

For production, use Nginx with SSL. Two options:

#### Option A: Caddy (Easiest - Auto SSL)

Create `docker-compose.prod.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: compress-lol
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0

  caddy:
    image: caddy:alpine
    container_name: compress-lol-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app

volumes:
  caddy_data:
  caddy_config:
```

Create `Caddyfile`:

```
compress.lol {
    reverse_proxy app:3000
}
```

Deploy:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### Option B: Nginx with Let's Encrypt

1. Edit `docker-compose.yml` to uncomment the nginx service
2. Update `nginx.conf` with your domain
3. Generate SSL certificates:

```bash
# Install certbot
sudo apt install certbot -y

# Generate certificates (stop any service on port 80 first)
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
mkdir -p certs
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem certs/
sudo chown -R $USER:$USER certs/
```

4. Start with Nginx:
```bash
docker compose up -d --build
```

5. Set up auto-renewal:
```bash
# Add to crontab
echo "0 0 * * * certbot renew --quiet && docker compose restart nginx" | sudo tee -a /etc/crontab
```

### Step 4: Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# firewalld (Fedora/CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Step 5: Maintenance Commands

```bash
# View logs
docker compose logs -f app

# Restart the app
docker compose restart app

# Update to latest version
git pull
docker compose up -d --build

# Stop everything
docker compose down

# Remove all data and rebuild
docker compose down -v
docker compose up -d --build

# Check resource usage
docker stats
```

---

## Verification Checklist

After deploying, verify everything works:

### 1. Check Headers

```bash
curl -I https://yourdomain.com
```

Expected headers:
```
cross-origin-embedder-policy: require-corp
cross-origin-opener-policy: same-origin
```

### 2. Test FFmpeg Loading

1. Open the app in your browser
2. Open DevTools Console (F12)
3. Try to compress a small video
4. Verify no SharedArrayBuffer errors appear

### 3. Test File Upload

1. Upload a video file
2. Select compression settings
3. Verify compression completes successfully
4. Download the compressed file

### 4. Test Large Files

1. Try uploading a file > 100MB
2. Monitor memory usage
3. Verify WORKERFS mounting works correctly

---

## Troubleshooting

### "SharedArrayBuffer is not defined"

**Cause**: COOP/COEP headers not being sent correctly.

**Solutions**:
1. Verify headers with `curl -I https://yourdomain.com`
2. Check `vercel.json` or `nginx.conf` configuration
3. Ensure no CDN is stripping headers

### FFmpeg fails to load

**Cause**: WASM files not accessible or CORS issues.

**Solutions**:
1. Verify `/ffmpeg/` static files are deployed
2. Check browser console for specific errors
3. Ensure CORS headers allow same-origin

### Out of Memory errors

**Cause**: Large video files exceeding browser memory limits.

**Solutions**:
1. Recommend users to compress smaller files
2. Increase VPS RAM if self-hosting
3. Use Chrome/Chromium for better memory management

### Slow compression on Safari

**Cause**: Safari doesn't support multi-threading with SharedArrayBuffer in all cases.

**Solutions**:
1. This is expected behavior
2. Recommend Chrome/Firefox for better performance
3. The app automatically disables threading on non-Chromium browsers

---

## Performance Optimization

### For Vercel

- Enable Edge Functions for better global performance
- Use Vercel Analytics to monitor performance
- Consider Pro plan for higher bandwidth limits

### For VPS

- Use a CDN (Cloudflare) in front of your server
- Enable HTTP/2 or HTTP/3 in Nginx
- Consider using a larger instance for heavy usage
- Monitor with `docker stats` and set up alerts

---

## Cost Comparison

| Platform | Free Tier | Estimated Monthly Cost |
|----------|-----------|------------------------|
| Vercel | 100GB bandwidth, unlimited deploys | $0 - $20/mo |
| DigitalOcean Droplet | None | $4 - $12/mo |
| Hetzner Cloud | None | ¬3.79 - ¬8/mo |
| AWS Lightsail | First 3 months free | $3.50 - $10/mo |

---

## Security Considerations

1. **No server-side file storage**: All processing happens client-side
2. **HTTPS required**: Always use SSL in production
3. **Keep Docker updated**: Regularly update base images
4. **Monitor logs**: Check for suspicious activity
5. **Rate limiting**: Consider adding rate limiting for public deployments
