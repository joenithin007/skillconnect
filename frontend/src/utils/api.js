import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Cache storage
const cache = {};
const CACHE_TIME = 30000; // 30 seconds

export const apiGet = async (url, forceRefresh = false) => {
  const fullUrl = `${API}${url}`;
  const now = Date.now();
  
  // Return cached data immediately if available
  if (!forceRefresh && cache[url] && (now - cache[url].time) < CACHE_TIME) {
    return cache[url].data;
  }

  const { data } = await axios.get(fullUrl);
  cache[url] = { data, time: now };
  return data;
};

export const clearCache = (url) => {
  if (url) delete cache[url];
  else Object.keys(cache).forEach(k => delete cache[k]);
};

export default API;
