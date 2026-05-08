import crypto from 'crypto';

class RouteCache {
  constructor(ttlMs = 1800000) { // 30 minutes default
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  _hash(key) {
    return crypto.createHash('md5').update(JSON.stringify(key)).digest('hex');
  }

  get(key) {
    const hashKey = this._hash(key);
    const item = this.cache.get(hashKey);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(hashKey);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    const hashKey = this._hash(key);
    this.cache.set(hashKey, {
      data,
      timestamp: Date.now()
    });
  }
}

export const routeCache = new RouteCache();
