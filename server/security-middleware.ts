import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction, Express } from 'express';
import crypto from 'crypto';

// Extend Request type to include session
declare module 'express-serve-static-core' {
  interface Request {
    session?: {
      csrfToken?: string;
      [key: string]: any;
    };
  }
}

// Global rate limiting - equivalent to Wordfence protection
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting for health checks, static assets, and development
    return req.path.includes('/health') || 
           req.path.includes('/static') || 
           process.env.NODE_ENV === 'development';
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // only 5 attempts per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// API endpoint protection
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // API calls per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Progressive delay for suspicious activity
export const progressiveDelay = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // allow 10 requests per windowMs without delay
  delayMs: () => 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // max delay of 20 seconds
  validate: { delayMs: false } // disable warning
});

// Custom CSRF protection (csurf package is deprecated)
const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and static assets
  if (req.method === 'GET' || req.path.includes('/static') || req.path.includes('/api/csrf-token')) {
    return next();
  }

  // Check for required headers on state-changing requests
  const customHeader = req.headers['x-requested-with'];
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

  if (!customHeader || customHeader !== 'XMLHttpRequest') {
    return res.status(403).json({ 
      error: 'Forbidden: Missing required security headers' 
    });
  }

  // Generate and validate CSRF tokens
  if (!req.session) {
    return res.status(403).json({ 
      error: 'Forbidden: No session found' 
    });
  }

  // Simple CSRF token validation
  const sessionToken = req.session.csrfToken;
  if (!csrfToken || csrfToken !== sessionToken) {
    return res.status(403).json({ 
      error: 'Forbidden: Invalid CSRF token' 
    });
  }

  next();
};

// Generate CSRF token endpoint
const generateCSRFToken = (req: Request, res: Response) => {
  if (!req.session) {
    return res.status(500).json({ error: 'Session not available' });
  }

  // Generate a simple CSRF token
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = token;

  res.json({ csrfToken: token });
};

// Input validation middleware
const validateInput = [
  // Sanitize and validate common inputs
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('name').optional().isLength({ min: 1, max: 100 }).trim().escape(),
  body('surname').optional().isLength({ min: 1, max: 100 }).trim().escape(),
  body('passportNumber').optional().isLength({ min: 5, max: 20 }).trim(),
  
  // Handle validation errors
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Security headers middleware
const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

// File upload security
const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Restrict file types
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (req.file && !allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only PDF and image files allowed.'
    });
  }

  // File size limit (handled by multer config)
  next();
};

// IP whitelist for admin endpoints
const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP || '')) {
      return res.status(403).json({
        error: 'Access denied: IP not authorized'
      });
    }

    next();
  };
};

// Security monitoring middleware
export const securityMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /\bexec\b/i,  // Command injection
  ];

  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  // Check for suspicious patterns
  const suspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
  
  if (suspicious) {
    console.warn(`🚨 SECURITY ALERT - Suspicious request from ${req.ip}:`, {
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

    // Log but don't block - could be false positive
    // In production, you might want to block and alert
  }

  next();
};

// Setup comprehensive security
export const setupSecurity = (app: Express) => {
  // Trust proxy for rate limiting (needed in Replit environment)
  app.set('trust proxy', 1);

  // Helmet for various security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: false // Allow PDFs and images
  }));

  // Custom security headers
  app.use(securityHeaders);

  // Rate limiting
  app.use(globalRateLimit);
  app.use(progressiveDelay);

  // Security monitoring
  app.use(securityMonitoring);

  // CSRF token endpoint
  app.get('/api/csrf-token', generateCSRFToken);

  // Apply stricter limits to specific endpoints
  app.use('/api/auth/', authRateLimit);
  app.use('/api/', apiRateLimit);
};

export {
  validateInput,
  fileUploadSecurity,
  ipWhitelist,
  csrfProtection
};