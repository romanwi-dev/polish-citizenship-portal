// Comprehensive caching system for maximum performance

// Browser Cache Management
class BrowserCacheManager {
  private cache: Cache | null = null;
  private readonly CACHE_NAME = 'polish-citizenship-v1';
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  async init() {
    if ('caches' in window) {
      this.cache = await caches.open(this.CACHE_NAME);
    }
  }

  async get(url: string): Promise<Response | null> {
    if (!this.cache) return null;
    
    const cached = await this.cache.match(url);
    if (!cached) return null;

    // Check if cache is still valid
    const cachedDate = cached.headers.get('date');
    if (cachedDate) {
      const age = Date.now() - new Date(cachedDate).getTime();
      if (age > this.CACHE_DURATION) {
        await this.cache.delete(url);
        return null;
      }
    }

    return cached;
  }

  async set(url: string, response: Response) {
    if (!this.cache) return;
    
    // Clone response to avoid consuming it
    const clonedResponse = response.clone();
    await this.cache.put(url, clonedResponse);
  }

  async clear() {
    if ('caches' in window) {
      await caches.delete(this.CACHE_NAME);
    }
  }
}

// Session Storage Cache
class SessionCache {
  private readonly PREFIX = 'pcs_';
  
  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.PREFIX + key);
      if (!item) return null;
      
      const { value, expiry } = JSON.parse(item);
      if (expiry && Date.now() > expiry) {
        sessionStorage.removeItem(this.PREFIX + key);
        return null;
      }
      
      return value;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T, ttlMinutes = 30) {
    try {
      const item = {
        value,
        expiry: Date.now() + (ttlMinutes * 60 * 1000)
      };
      sessionStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (e) {
      // Handle quota exceeded
      this.cleanup();
    }
  }

  cleanup() {
    const keys = Object.keys(sessionStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const item = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (item.expiry && now > item.expiry) {
            sessionStorage.removeItem(key);
          }
        } catch {
          sessionStorage.removeItem(key);
        }
      }
    });
  }
}

// Local Storage Cache with LRU eviction
class LocalCache {
  private readonly PREFIX = 'pcl_';
  private readonly MAX_SIZE = 50; // Maximum number of items
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;
      
      const { value, expiry, accessCount = 0 } = JSON.parse(item);
      
      // Check expiry
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }
      
      // Update access count for LRU
      this.updateAccessCount(key, accessCount + 1);
      
      return value;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T, ttlDays = 7) {
    try {
      // Check if we need to evict items
      if (this.getItemCount() >= this.MAX_SIZE) {
        this.evictLRU();
      }
      
      const item = {
        value,
        expiry: Date.now() + (ttlDays * 24 * 60 * 60 * 1000),
        accessCount: 0,
        created: Date.now()
      };
      
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (e) {
      // Handle quota exceeded
      this.cleanup();
      // Try again
      try {
        localStorage.setItem(this.PREFIX + key, JSON.stringify({ value }));
      } catch {}
    }
  }

  private updateAccessCount(key: string, count: number) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item) {
        const data = JSON.parse(item);
        data.accessCount = count;
        data.lastAccessed = Date.now();
        localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
      }
    } catch {}
  }

  private getItemCount(): number {
    return Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX)).length;
  }

  private evictLRU() {
    const items: Array<{ key: string; accessCount: number; lastAccessed: number }> = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          items.push({
            key,
            accessCount: item.accessCount || 0,
            lastAccessed: item.lastAccessed || 0
          });
        } catch {}
      }
    });
    
    // Sort by access count and last accessed
    items.sort((a, b) => {
      if (a.accessCount !== b.accessCount) {
        return a.accessCount - b.accessCount;
      }
      return a.lastAccessed - b.lastAccessed;
    });
    
    // Remove least recently used items (bottom 20%)
    const toRemove = Math.ceil(items.length * 0.2);
    for (let i = 0; i < toRemove && i < items.length; i++) {
      localStorage.removeItem(items[i].key);
    }
  }

  cleanup() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.expiry && now > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Memory Cache for runtime
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  private readonly MAX_SIZE = 100;

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set<T>(key: string, value: T, ttlSeconds = 300) {
    // Implement LRU if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  clear() {
    this.cache.clear();
  }
}

// API Response Cache
class APICache {
  private browserCache = new BrowserCacheManager();
  private memoryCache = new MemoryCache();
  
  async init() {
    await this.browserCache.init();
  }

  async get(url: string): Promise<any> {
    // Check memory cache first (fastest)
    const memCached = this.memoryCache.get(url);
    if (memCached) {
      console.log('Cache hit: memory', url);
      return memCached;
    }

    // Check browser cache
    const browserCached = await this.browserCache.get(url);
    if (browserCached) {
      console.log('Cache hit: browser', url);
      const data = await browserCached.json();
      // Store in memory cache for faster subsequent access
      this.memoryCache.set(url, data, 60);
      return data;
    }

    return null;
  }

  async set(url: string, data: any) {
    // Store in memory cache
    this.memoryCache.set(url, data, 300);
    
    // Store in browser cache
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Date': new Date().toISOString()
      }
    });
    await this.browserCache.set(url, response);
  }
}

// Prefetch manager for critical resources
class PrefetchManager {
  private prefetched = new Set<string>();

  prefetchLink(url: string, as: 'script' | 'style' | 'image' | 'font' = 'script') {
    if (this.prefetched.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = as;
    link.href = url;
    document.head.appendChild(link);
    this.prefetched.add(url);
  }

  preconnect(origin: string) {
    if (this.prefetched.has(origin)) return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    this.prefetched.add(origin);
  }

  dnsPrefetch(hostname: string) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${hostname}`;
    document.head.appendChild(link);
  }
}

// Main cache manager singleton
class CacheManager {
  private static instance: CacheManager;
  
  public browser = new BrowserCacheManager();
  public session = new SessionCache();
  public local = new LocalCache();
  public memory = new MemoryCache();
  public api = new APICache();
  public prefetch = new PrefetchManager();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async init() {
    await this.browser.init();
    await this.api.init();
    
    // Cleanup old cache entries
    this.session.cleanup();
    this.local.cleanup();
    
    // Prefetch critical resources
    this.prefetchCriticalResources();
    
    // Set up periodic cleanup
    setInterval(() => {
      this.session.cleanup();
      this.local.cleanup();
    }, 60 * 60 * 1000); // Every hour
  }

  private prefetchCriticalResources() {
    // Prefetch critical routes
    const criticalRoutes = [
      '/api/testimonials/public',
      '/api/auth/user',
      '/citizenship-test',
      '/polish-passport',
      '/polish-citizenship'
    ];
    
    criticalRoutes.forEach(route => {
      this.prefetch.prefetchLink(route, 'script');
    });
    
    // Preconnect to external domains
    this.prefetch.preconnect('https://fonts.googleapis.com');
    this.prefetch.preconnect('https://fonts.gstatic.com');
    this.prefetch.dnsPrefetch('polishcitizenship.typeform.com');
  }

  // Aggressive caching for static assets
  cacheStaticAssets() {
    if ('caches' in window) {
      // Cache all images
      const images = document.querySelectorAll('img[src]');
      images.forEach(async (img) => {
        const src = (img as HTMLImageElement).src;
        if (src && !src.startsWith('data:')) {
          try {
            const response = await fetch(src);
            await this.browser.set(src, response);
          } catch {}
        }
      });
      
      // Cache all stylesheets
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      styles.forEach(async (link) => {
        const href = (link as HTMLLinkElement).href;
        if (href) {
          try {
            const response = await fetch(href);
            await this.browser.set(href, response);
          } catch {}
        }
      });
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Initialize cache on import
export const initializeCache = () => {
  cacheManager.init();
  
  // Cache static assets after page load
  if (document.readyState === 'complete') {
    cacheManager.cacheStaticAssets();
  } else {
    window.addEventListener('load', () => {
      cacheManager.cacheStaticAssets();
    });
  }
};