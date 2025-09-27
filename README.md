# Polish Citizenship Application Platform

A comprehensive full-stack web application for Polish citizenship by descent services.

## Performance Pack

This application is optimized for production performance with the following enhancements:

### Build Configuration
- **Sourcemaps**: Disabled in production for faster builds
- **CSS Code Splitting**: Enabled for optimal loading
- **Minification**: Using esbuild for fastest builds
- **Target**: ES2018 for broad compatibility
- **Chunk Size**: Warning limit set to 1500KB
- **Manual Chunks**: Vendor libraries separated for better caching

### Server Optimizations
- **Compression**: Gzip/Brotli compression enabled
- **Static Asset Caching**: 
  - `/assets/*` files cached for 1 year (immutable)
  - HTML files cached for 1 hour
  - ETag support enabled by default
- **Performance Middleware**: Advanced caching and optimization

### Frontend Optimizations
- **Critical Bundle Preloads**: Vendor and main bundles preloaded
- **DNS Prefetch**: Enabled for faster connections
- **Resource Hints**: Preconnect for critical resources
- **Development Code Removal**: Console logs and dev tools removed in production

## Running the Application

### Development
```bash
npm run dev
```
This runs both the Express server and Vite development server concurrently.

### Production
```bash
# Build both client and server
npm run build

# Start production server
npm start
```

### Build Commands
```bash
# Build client only
npm run build:client

# Build server only
npm run build:server

# Build everything
npm run build
```

## Performance Verification

In production, verify these optimizations are active:

1. **Compression**: Check response headers for `content-encoding: gzip`
2. **Static Caching**: `/assets/*` should have `Cache-Control: public, max-age=31536000, immutable`
3. **HTML Caching**: HTML files should have `Cache-Control: public, max-age=3600`
4. **No Source Maps**: No `.map` files should be served
5. **Bundle Splitting**: Vendor chunks should be separate from application code

## Environment Configuration

### Dropbox OAuth Setup

The application uses Dropbox for document storage and requires OAuth2 authentication. Configure the following environment variables:

```bash
# Dropbox OAuth2 Application Credentials
DROPBOX_APP_KEY=your_app_key_here
DROPBOX_APP_SECRET=your_app_secret_here
DROPBOX_REFRESH_TOKEN=your_refresh_token_here
```

#### Getting Dropbox OAuth Credentials:

1. **Create a Dropbox App**:
   - Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Click "Create app" 
   - Choose "Scoped access"
   - Select "App folder" or "Full Dropbox" based on your needs
   - Name your app and click "Create app"

2. **Configure App Settings**:
   - Note your **App key** (`DROPBOX_APP_KEY`)
   - Note your **App secret** (`DROPBOX_APP_SECRET`)
   - Add your redirect URI in OAuth2 settings

3. **Generate Refresh Token**:
   - Use OAuth2 flow to get initial authorization code
   - Exchange authorization code for access token and refresh token
   - Save the **refresh token** (`DROPBOX_REFRESH_TOKEN`)

#### Authentication Features:
- **Auto-refresh**: Access tokens are automatically refreshed when expired
- **Fallback**: Falls back to Replit connection system if OAuth2 fails
- **Caching**: In-memory token caching with 60-second expiry buffer
- **Health checks**: Built-in connection testing and diagnostics

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Dropbox integration with OAuth2 auto-refresh
- **Deployment**: Optimized for Replit production deployment

The application serves pre-built assets from `/dist/public` in production mode with aggressive caching strategies for optimal performance.

## Admin Command Executor

This application includes a secure command executor system that allows administrators to run predefined maintenance and optimization commands.

### Available Commands

| Command | Description | Actions |
|---------|-------------|---------|
| **CLEAN** | Clear caches and temporary files | Removes dist, node_modules/.vite, .vite directories; verifies npm cache; pings server |
| **FIX** | Code quality fixes | Runs ESLint with --fix, Prettier formatting, TypeScript type checking |
| **UI/UX** | UI audit (no visual changes) | Style linting, checks for fixed width anti-patterns |
| **PERFORM** | Performance optimization | Builds client and server, analyzes bundle sizes |
| **SECURITY** | Security audit | NPM vulnerability audit, security headers verification |
| **VISUAL** | Visual hygiene (no theme changes) | Font rendering optimizations, responsive image settings |
| **ANALYZE** | Analysis and reporting | Full build analysis, bundle reporting, health checks |
| **DEPLOY** | Deployment preparation | Environment checks, full build, boot testing |

### Security & Setup

#### Backend Configuration

1. **Set Admin Token Environment Variable:**
   ```bash
   export ADMIN_TOKEN="your-secure-admin-token-here"
   ```

#### Frontend Configuration (Admin Preview Only)

⚠️ **Important:** In production, this should be server-only. For internal admin preview:

1. **Set Frontend Admin Token:**
   ```bash
   export VITE_ADMIN_TOKEN="your-secure-admin-token-here"
   ```

2. **Access Admin Interface:**
   - Navigate to the System Checks admin page
   - Use the Admin Command Executor section
   - Enter commands manually or click the command buttons

### Usage

#### Via Admin Interface
1. Go to System Checks admin page
2. Find the "Admin Command Executor" section
3. Type a command or click a command button
4. View live execution logs with step-by-step progress
5. Results are automatically saved to localStorage

#### Via API (Programmatic)
```bash
curl -X POST http://localhost:5000/api/admin/execute \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{"command": "CLEAN"}'
```

### Command Safety

- **Safe Operations:** All commands are designed to be safe for production use
- **No Breaking Changes:** Commands don't modify product visuals except minor hygiene fixes
- **No Secrets Logged:** Output is truncated and sanitized
- **Timeout Protection:** Each step has a 30-second timeout
- **Error Handling:** Failed steps don't break the entire command execution

### Response Format

Commands return structured JSON with timing and execution details:

```json
{
  "ok": true,
  "command": "CLEAN",
  "startedAt": "2025-09-20T03:24:29.123Z",
  "finishedAt": "2025-09-20T03:24:35.456Z",
  "steps": [
    {
      "name": "Clear tmp",
      "ok": true,
      "ms": 1234,
      "outTail": "removed dist/, removed .vite/"
    }
  ],
  "summary": {
    "notes": "caches cleared",
    "totalSteps": 3,
    "successfulSteps": 3
  }
}
```

### Production Recommendations

- Keep `VITE_ADMIN_TOKEN` server-only in production
- Implement proper authentication before exposing admin panel
- Use commands for internal maintenance and CI/CD pipelines
- Monitor command execution logs for security auditing