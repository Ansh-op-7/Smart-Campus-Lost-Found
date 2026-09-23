import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getStoredToken() {
    return localStorage.getItem('findit_token');
  },

  getStoredUser() {
    const user = localStorage.getItem('findit_user');
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setStoredAuth(token, user) {
    localStorage.setItem('findit_token', token);
    localStorage.setItem('findit_user', JSON.stringify(user));
  },

  clearStoredAuth() {
    localStorage.removeItem('findit_token');
    localStorage.removeItem('findit_user');
  }
};

export default authService;
