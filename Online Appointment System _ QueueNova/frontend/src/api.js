import { showToast } from './components/toaster.js';

const API_BASE = 'https://xhek5qtugvbotial2wopkiweiy0aoyvq.lambda-url.us-east-1.on.aws/api';
const WS_URL = 'ws://localhost:5000';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  const { silent = false, ...fetchOptions } = options;
  const finalOptions = { ...defaultOptions, ...fetchOptions };
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // ... (auth loop protection logic remains same)
        const currentHash = window.location.hash;
        if (currentHash !== '#/login' && currentHash !== '#/signup' && currentHash !== '#/home' && currentHash !== '') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.hash = '#/login';
          window.location.reload(); 
        }
        return new Promise(() => {}); 
      }
  
      if (response.status === 404) {
        return Array.isArray(data) ? data : {};
      }

      // Throw error with message - let the catch block handle the single toast
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  } catch (error) {
    if (!silent) {
      // Single point of contact for error toasts
      showToast(error.message, 'error');
    }
    throw error;
  }
};

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Skip WebSockets in the cloud for now (as Lambda URLs don't support them directly)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('Skipping WebSocket connection in cloud environment');
      return;
    }
    
    this.ws = new WebSocket(`${WS_URL}?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        
        if (this.listeners.has(type)) {
          this.listeners.get(type).forEach(callback => callback(payload));
        }
        
        if (this.listeners.has('all')) {
          this.listeners.get('all').forEach(callback => callback(data));
        }
      } catch (e) {
        console.error('WS message parse error:', e);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, 2000 * this.reconnectAttempts);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager();
