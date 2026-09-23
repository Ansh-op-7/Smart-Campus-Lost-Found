import api from './api';

/**
 * Service for administrative management and platform analytics.
 */
export const adminService = {
  /**
   * Fetch aggregate platform statistics.
   */
  async getDashboardStats() {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  /**
   * Fetch all registered users, with optional search term (name or email).
   * @param {string} [search]
   */
  async getUsers(search) {
    const params = {};
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },

  /**
   * Update a user's role (e.g. STUDENT -> ADMIN, or ADMIN -> STUDENT).
   * @param {number|string} userId
   * @param {'STUDENT'|'ADMIN'} role
   */
  async updateUserRole(userId, role) {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Fetch all platform items with optional filtering.
   * @param {{ type?: string, status?: string, categoryId?: number|string, location?: string, search?: string }} [filters]
   */
  async getItems(filters = {}) {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.location && filters.location.trim()) params.location = filters.location.trim();
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const response = await api.get('/api/admin/items', { params });
    return response.data;
  },

  /**
   * Fetch all claims across the campus with optional filtering.
   * @param {{ status?: string, search?: string }} [filters]
   */
  async getClaims(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const response = await api.get('/api/admin/claims', { params });
    return response.data;
  },
};

export default adminService;
