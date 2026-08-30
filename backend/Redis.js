const Redis = require('ioredis');

// ============================================================
// ⚙️ REDIS CONFIGURATION
// ============================================================
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  keyPrefix: 'github-app:',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
};

let client = null;
let isConnected = false;

// ============================================================
// 🔌 CONNECTION MANAGEMENT
// ============================================================
function getClient() {
  if (!client) {
    client = new Redis(redisConfig);
    
    client.on('connect', () => {
      console.log('🔴 Redis: Connecting...');
    });
    
    client.on('ready', () => {
      isConnected = true;
      console.log('🔴 Redis: Connected and ready');
    });
    
    client.on('error', (err) => {
      isConnected = false;
      console.error('🔴 Redis Error:', err.message);
    });
    
    client.on('close', () => {
      isConnected = false;
      console.warn('🔴 Redis: Connection closed');
    });
    
    client.on('reconnecting', () => {
      console.warn('🔴 Redis: Reconnecting...');
    });
  }
  
  return client;
}

// ============================================================
// 📦 CACHE OPERATIONS
// ============================================================

/**
 * Get a value from cache
 */
async function get(key) {
  if (!isConnected) return null;
  
  try {
    const value = await getClient().get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn('🔴 Cache get error:', err.message);
    return null;
  }
}

/**
 * Set a value in cache with optional TTL (seconds)
 */
async function set(key, value, ttlSeconds = null) {
  if (!isConnected) return false;
  
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await getClient().setex(key, ttlSeconds, serialized);
    } else {
      await getClient().set(key, serialized);
    }
    return true;
  } catch (err) {
    console.warn('🔴 Cache set error:', err.message);
    return false;
  }
}

/**
 * Delete a key from cache
 */
async function del(key) {
  if (!isConnected) return false;
  
  try {
    await getClient().del(key);
    return true;
  } catch (err) {
    console.warn('🔴 Cache delete error:', err.message);
    return false;
  }
}

/**
 * Check if a key exists
 */
async function exists(key) {
  if (!isConnected) return false;
  
  try {
    return await getClient().exists(key) > 0;
  } catch (err) {
    return false;
  }
}

/**
 * Get and set with a single function (cache-aside pattern)
 */
async function getOrSet(key, fetchFn, ttlSeconds = null) {
  // Try cache first
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch from source
  const value = await fetchFn();
  
  // Cache the result
  if (value !== undefined && value !== null) {
    await set(key, value, ttlSeconds);
  }
  
  return value;
}

// ============================================================
// 🎯 DOMAIN-SPECIFIC CACHE HELPERS
// ============================================================

const CACHE_KEYS = {
  installationToken: (tenantId, installationId) => 
    `token:tenant:${tenantId}:inst:${installationId}`,
  
  appJWT: (tenantId) => 
    `jwt:tenant:${tenantId}`,
  
  tenant: (tenantId) => 
    `tenant:${tenantId}`,
  
  tenantBySlug: (slug) => 
    `tenant:slug:${slug}`,
  
  stats: (tenantId) => 
    `stats:${tenantId || 'global'}`,
  
  installations: (tenantId) => 
    `installations:${tenantId || 'all'}`,
  
  rateLimit: (identifier) => 
    `ratelimit:${identifier}`,
  
  lock: (resource) => 
    `lock:${resource}`
};

const TTL = {
  INSTALLATION_TOKEN: 55 * 60,      // 55 minutes (tokens expire at 60)
  APP_JWT: 8 * 60,                  // 8 minutes (JWT expires at 10)
  TENANT_INFO: 15 * 60,             // 15 minutes
  STATS: 60,                        // 1 minute
  INSTALLATIONS: 5 * 60,            // 5 minutes
  SHORT: 30,                        // 30 seconds
  LONG: 24 * 60 * 60                // 24 hours
};

// ============================================================
// 🔒 DISTRIBUTED LOCK
// ============================================================

/**
 * Acquire a distributed lock (prevents race conditions across instances)
 */
async function acquireLock(resource, timeoutMs = 10000) {
  const key = CACHE_KEYS.lock(resource);
  const lockValue = Date.now() + timeoutMs + 1;
  
  const acquired = await getClient().set(key, lockValue, 'PX', timeoutMs, 'NX');
  
  if (acquired === 'OK') {
    return {
      release: async () => {
        // Only delete if it's still our lock
        const current = await getClient().get(key);
        if (current && parseInt(current) === lockValue) {
          await getClient().del(key);
        }
      }
    };
  }
  
  return null;
}

// ============================================================
// 📊 REDIS HEALTH & METRICS
// ============================================================

async function getHealth() {
  if (!isConnected) {
    return { status: 'disconnected', connected: false };
  }
  
  try {
    const info = await getClient().info();
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const clientsMatch = info.match(/connected_clients:([^\r\n]+)/);
    
    return {
      status: 'healthy',
      connected: true,
      memory: memoryMatch ? memoryMatch[1] : 'unknown',
      connected_clients: clientsMatch ? parseInt(clientsMatch[1]) : 0
    };
  } catch (err) {
    return { status: 'error', connected: false, error: err.message };
  }
}

async function getCacheStats() {
  if (!isConnected) return null;
  
  try {
    const info = await getClient().info('stats');
    const hitsMatch = info.match(/keyspace_hits:([^\r\n]+)/);
    const missesMatch = info.match(/keyspace_misses:([^\r\n]+)/);
    
    const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
    const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) + '%' : 'N/A';
    
    return { hits, misses, total, hitRate };
  } catch {
    return null;
  }
}

// ============================================================
// 📤 EXPORTS
// ============================================================
module.exports = {
  getClient,
  get,
  set,
  del,
  exists,
  getOrSet,
  acquireLock,
  getHealth,
  getCacheStats,
  CACHE_KEYS,
  TTL,
  isConnected: () => isConnected
};
