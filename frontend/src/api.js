const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
  async getCsrfToken() {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    return data.csrfToken;
  },

  // Native fetch wrapper to include credentials and CSRF token
  async fetchWithCreds(url, options = {}) {
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase());
    const headers = { ...options.headers };

    if (isStateChanging) {
      // If the token isn't already in the body/FormData, we add it to the header
      // This ensures we support both the "Hidden Input" way and the "Header" way
      if (!headers['X-CSRF-Token']) {
        headers['X-CSRF-Token'] = await this.getCsrfToken();
      }
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  },

  async signup(username, password, _csrf) {
    const res = await this.fetchWithCreds(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': _csrf // Explicitly passing from form
      },
      body: JSON.stringify({ username, password, _csrf }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    return data;
  },

  async login(username, password, _csrf) {
    const res = await this.fetchWithCreds(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': _csrf 
      },
      body: JSON.stringify({ username, password, _csrf }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('username', data.username);
    return data;
  },

  async logout() {
    const res = await this.fetchWithCreds(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    if (!res.ok) throw new Error('Logout failed');
    localStorage.removeItem('username');
  },

  async checkAuth() {
    const res = await this.fetchWithCreds(`${API_BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async getFeed() {
    const res = await this.fetchWithCreds(`${API_BASE_URL}/feed`);
    if (!res.ok) throw new Error('Failed to fetch feed');
    return res.json();
  },

  async getProfile(username) {
    const res = await this.fetchWithCreds(`${API_BASE_URL}/profile/${username}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async upload(imageFile, caption, _csrf) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);
    formData.append('_csrf', _csrf); // Standard field name for csurf

    const res = await this.fetchWithCreds(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': _csrf },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
};
