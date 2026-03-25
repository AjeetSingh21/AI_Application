import axios from 'axios';

// Get base URL - works in both browser and Electron
const getBaseUrl = async () => {
  // Check if we're running in Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      return await window.electronAPI.getBackendUrl();
    } catch (error) {
      console.warn('Electron API failed, falling back to localhost:', error);
    }
  }
  
  // For browser development with Vite proxy
  // Return empty string to use relative URLs (proxied by Vite)
  return '';
};

// Create axios instance with dynamic base URL
let apiClient;
const getApiClient = async () => {
  if (!apiClient) {
    const baseUrl = await getBaseUrl();
    console.log('Initializing API client with base URL:', baseUrl);
    
    apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Add request interceptor for debugging
    apiClient.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    apiClient.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          console.error('❌ Backend server is not running on port 8000');
          console.error('Please start the backend: py -m uvicorn main:app --reload --port 8000');
        } else if (error.code === 'ERR_NETWORK') {
          console.error('❌ Network error - check if backend is accessible');
        }
        return Promise.reject(error);
      }
    );
  }
  return apiClient;
};

// API endpoints
export const ordersAPI = {
  getAll: async () => {
    const client = await getApiClient();
    return client.get('/orders');
  },
  create: async (order) => {
    const client = await getApiClient();
    return client.post('/orders', order);
  },
  delete: async (id) => {
    const client = await getApiClient();
    return client.delete(`/orders/${id}`);
  },
};

export const warehousesAPI = {
  getAll: async () => {
    const client = await getApiClient();
    return client.get('/warehouses');
  },
};

export const driversAPI = {
  getAll: async () => {
    const client = await getApiClient();
    return client.get('/drivers');
  },
};

export const vehiclesAPI = {
  getAll: async () => {
    const client = await getApiClient();
    return client.get('/vehicles');
  },
};

export const optimizationAPI = {
  optimize: async (orderId = null) => {
    const client = await getApiClient();
    const params = orderId ? { order_id: orderId } : {};
    return client.post('/optimize', null, { params });
  },
  simulate: async (orderId = null) => {
    const client = await getApiClient();
    const params = orderId ? { order_id: orderId } : {};
    return client.post('/simulate', null, { params });
  },
};

export const alertsAPI = {
  getAll: async () => {
    const client = await getApiClient();
    return client.get('/alerts');
  },
};

export default getApiClient;
