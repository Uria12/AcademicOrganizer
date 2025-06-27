import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class Cache {
  private store: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
      }
    }
  }
}

const cache = new Cache();

// Clean up expired cache entries every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000);

// Cache middleware for GET requests
export const cacheMiddleware = (ttl: number = 5 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and user ID
    const userKey = req.user?.id || 'anonymous';
    const cacheKey = `${userKey}:${req.originalUrl}`;

    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('📦 Cache hit for:', cacheKey);
      return res.json(cachedData);
    }

    // Store original send method
    const originalSend = res.json;

    // Override res.json to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        console.log('💾 Caching response for:', cacheKey);
        cache.set(cacheKey, data, ttl);
      }
      
      // Call original send method
      return originalSend.call(this, data);
    };

    next();
  };
};

// Cache invalidation middleware
export const invalidateCache = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userKey = req.user?.id || 'anonymous';
    const cacheKey = `${userKey}:${pattern}`;
    
    cache.delete(cacheKey);
    console.log('🗑️ Cache invalidated for:', cacheKey);
    
    next();
  };
};

// Cache control headers middleware
export const cacheControl = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set cache control headers
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    res.set('ETag', `"${Date.now()}"`);
    
    next();
  };
};

// Export cache instance for manual operations
export { cache }; 