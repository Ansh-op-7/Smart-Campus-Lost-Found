import api from './api';

/**
 * Service for fetching item categories from backend.
 */
export const categoryService = {
  /**
   * Fetch all active item categories.
   */
  async getCategories() {
    const response = await api.get('/api/categories');
    return response.data;
  },

  /**
   * Fetch single category by ID.
   * @param {number|string} id
   */
  async getCategoryById(id) {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  /**
   * Create a new category (Admin only).
   * @param {{ name: string, description: string }} payload
   */
  async createCategory(payload) {
    const response = await api.post('/api/categories', payload);
    return response.data;
  },

  /**
   * Update an existing category (Admin only).
   * @param {number|string} id
   * @param {{ name: string, description: string }} payload
   */
  async updateCategory(id, payload) {
    const response = await api.put(`/api/categories/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a category (Admin only).
   * @param {number|string} id
   */
  async deleteCategory(id) {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
