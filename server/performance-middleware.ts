import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import compression from 'compression';
import zlib from 'zlib';

// ETag generation for caching
export const generateETag = (content: string): string => {
  return crypto.createHash('md5').update(content).digest('hex');
};

// Cache control headers
export const setCacheHeaders = (res: Response, maxAge: number = 3600, isPublic: boolean = true) => {
  const cacheControl = isPublic 
    ? `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
    : `private, max-age=${maxAge}`;
  
  res.set({
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block'
  });
};

// ETag middleware
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      const etag = generateETag(body.toString());
      res.set('ETag', etag);
      
      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304).end();
        return res;
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Override send to add timing header before sending
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.set('X-Response-Time', `${duration}ms`);
    }
    
    // Log slow requests
    if (duration > 1000) {
      console.log(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Enhanced compression middleware with Brotli support
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    // Compress everything except pre-compressed and images
    const contentType = res.getHeader('Content-Type');
    if (contentType && typeof contentType === 'string') {
      if (contentType.includes('image/') || contentType.includes('video/')) {
        return false;
      }
    }
    return compression.filter(req, res);
  },
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress files larger than 1KB
  brotliOptions: {
    level: 6,
    chunkSize: 1024,
  },
  // Prefer Brotli over gzip when supported
  preferBrotli: true
});

// Static asset caching middleware
export const staticCacheMiddleware = (maxAge: number = 31536000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if request is for static asset
    const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.path);
    
    if (isStaticAsset) {
      // Set aggressive caching for static assets
      setCacheHeaders(res, maxAge, true);
      res.set('Vary', 'Accept-Encoding');
      
      // Add immutable flag for versioned assets
      if (req.path.includes('.') && req.path.includes('?v=')) {
        res.set('Cache-Control', `public, max-age=${maxAge}, immutable`);
      }
    }
    
    next();
  };
};

// API response caching middleware
export const apiCacheMiddleware = (duration: number = 300) => {
  const cache = new Map<string, { data: any; timestamp: number; etag: string }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      
      if (age < duration * 1000) {
        // Check ETag
        const clientETag = req.headers['if-none-match'];
        if (clientETag === cached.etag) {
          return res.status(304).end();
        }
        
        // Serve from cache
        setCacheHeaders(res, duration, true);
        res.set('ETag', cached.etag);
        res.set('X-Cache', 'HIT');
        return res.json(cached.data);
      } else {
        // Cache expired
        cache.delete(key);
      }
    }
    
    // Intercept response to cache it
    const originalJson = res.json;
    res.json = function(data: any) {
      const etag = generateETag(JSON.stringify(data));
      
      // Store in cache
      cache.set(key, {
        data,
        timestamp: Date.now(),
        etag
      });
      
      // Set cache headers
      setCacheHeaders(res, duration, true);
      res.set('ETag', etag);
      res.set('X-Cache', 'MISS');
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// HTML performance optimization middleware
export const htmlOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only optimize HTML responses for landing pages
  if (!req.path.includes('/landing') && !req.path.includes('/landing-spanish') && !req.path.includes('/')) {
    return next();
  }

  const originalSend = res.send;
  res.send = function(body: any) {
    if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
      // Inject performance optimizations into HTML head
      const performanceHints = `
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="//fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <meta name="theme-color" content="#1e40af">
    <style>body{font-display:swap;}</style>
      `;
      
      // Inject hints right after <head> tag
      body = body.replace('<head>', `<head>${performanceHints}`);
      
      // Add resource hints for critical assets if not already present
      if (!body.includes('rel="preload"')) {
        const preloadHints = `
    <link rel="preload" as="style" href="/assets/index.css" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/assets/index.css"></noscript>
        `;
        body = body.replace('</head>', `${preloadHints}</head>`);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Advanced static asset optimization
export const advancedStaticCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/i.test(req.path);
  
  if (isStaticAsset) {
    // Aggressive caching for static assets
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff',
    });
    
    // Add HTTP/2 Server Push hints for critical resources
    if (req.path.includes('.js') || req.path.includes('.css')) {
      res.set('Link', '</assets/main.css>; rel=preload; as=style, </assets/main.js>; rel=preload; as=script');
    }
    
    // Set proper MIME types for modern formats
    if (req.path.includes('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
    if (req.path.includes('.avif')) {
      res.set('Content-Type', 'image/avif');
    }
  }
  
  next();
};

// Memory optimization middleware
export const memoryOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add response cleanup
  res.on('finish', () => {
    // Force garbage collection on large responses
    if (res.get('Content-Length') && parseInt(res.get('Content-Length')!) > 100000) {
      if (global.gc) {
        global.gc();
      }
    }
  });
  
  next();
};

// HTTP/2 Server Push middleware
export const http2PushMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only push for initial page loads (both English and Spanish landing pages)
  if (req.path === '/landing' || req.path === '/landing-spanish' || req.path === '/') {
    // Server push critical resources
    res.set('Link', [
      '</assets/index.js>; rel=preload; as=script',
      '</assets/index.css>; rel=preload; as=style',
      '<https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap>; rel=preload; as=style'
    ].join(', '));
  }
  
  next();
};

// Cleanup old cache entries periodically
export const startCacheCleanup = () => {
  setInterval(() => {
    // Force memory cleanup
    if (global.gc) {
      global.gc();
    }
    console.log('Cache cleanup completed');
  }, 30 * 60 * 1000); // Every 30 minutes for better performance
};