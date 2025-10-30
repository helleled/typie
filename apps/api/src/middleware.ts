import { cors as corsMiddleware } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { dev, env } from '@/env';
import type { MiddlewareHandler } from 'hono';

/**
 * CORS middleware configuration for API endpoints
 * In development, allows localhost origins for local testing
 * In production, restricts to configured WEBSITE_URL and USERSITE_URL
 */
export const cors = (): MiddlewareHandler => {
  const allowedOrigins = dev
    ? [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://localhost:4100',
        'http://localhost:4200',
        'http://localhost:4300',
        'http://localhost:5173',
      ]
    : [env.WEBSITE_URL, env.USERSITE_URL];

  return corsMiddleware({
    origin: (origin) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return null;

      // In development, be more permissive with localhost origins
      if (dev && origin.match(/^http:\/\/localhost:\d+$/)) {
        return origin;
      }

      // Check against allowed origins
      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      // In production, check if origin matches USERSITE pattern (wildcard subdomains)
      if (!dev && env.USERSITE_URL.includes('*')) {
        const pattern = env.USERSITE_URL.replace(/\*/g, '[^.]+');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(origin)) {
          return origin;
        }
      }

      return null;
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Device-Id', 'X-Client-IP'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours
  });
};

/**
 * Security headers middleware
 * In development, uses relaxed CSP to allow localhost connections
 * In production, uses stricter security headers
 */
export const security = (): MiddlewareHandler => {
  return secureHeaders({
    contentSecurityPolicy: dev
      ? {
          // Relaxed CSP for development
          defaultSrc: ["'self'", 'localhost:*', 'ws://localhost:*', 'wss://localhost:*'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*'],
          styleSrc: ["'self'", "'unsafe-inline'", 'localhost:*'],
          imgSrc: ["'self'", 'data:', 'blob:', 'localhost:*', 'https:'],
          connectSrc: ["'self'", 'localhost:*', 'ws://localhost:*', 'wss://localhost:*', 'https:'],
          fontSrc: ["'self'", 'data:', 'localhost:*'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'blob:', 'data:', 'localhost:*'],
          frameSrc: ["'self'", 'localhost:*'],
        }
      : undefined, // Use default strict CSP in production
    xFrameOptions: false, // Disable X-Frame-Options in favor of CSP frame-ancestors
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
  });
};
