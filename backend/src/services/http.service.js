const axios = require('axios');
const NodeCache = require('node-cache');

// Cache configuration (30 minutes TTL)
const cache = new NodeCache({
  stdTTL: 1800,
  checkperiod: 120
});

class HttpService {
  constructor(baseURL = '') {
    this.client = axios.create({
      baseURL,
      timeout: 10000
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || error.message}`);
        }
        throw new Error(`Network Error: ${error.message}`);
      }
    );
  }

  // GET request with caching
  async get(url, params = {}, useCache = true) {
    const cacheKey = this._generateCacheKey(url, params);

    if (useCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await this.client.get(url, { params });
    
    if (useCache) {
      cache.set(cacheKey, response.data);
    }

    return response.data;
  }

  // POST request
  async post(url, data = {}) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  // Generate cache key from URL and params
  _generateCacheKey(url, params) {
    return `${url}:${JSON.stringify(params)}`;
  }

  // Clear cache for specific key
  clearCache(url, params = {}) {
    const cacheKey = this._generateCacheKey(url, params);
    cache.del(cacheKey);
  }

  // Clear entire cache
  clearAllCache() {
    cache.flushAll();
  }
}

module.exports = HttpService; 