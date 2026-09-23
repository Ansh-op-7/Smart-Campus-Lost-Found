import api from './api';

/**
 * Service for interacting with Lost & Found item endpoints.
 */
export const itemService = {
  /**
   * Fetch items matching query filters.
   * @param {Object} params - { type, categoryId, location, status, search, page, size }
   */
  async getItems(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/api/items', { params: cleanParams });
    return response.data;
  },

  /**
   * Fetch single item by ID.
   * @param {number|string} id
   */
  async getItemById(id) {
    const response = await api.get(`/api/items/${id}`);
    return response.data;
  },

  /**
   * Fetch items reported by current logged-in user.
   */
  async getMyItems() {
    const response = await api.get('/api/items/my');
    return response.data;
  },

  /**
   * Create a new item (with pre-uploaded imageUrl).
   * @param {Object} itemData
   */
  async createItem(itemData) {
    const response = await api.post('/api/items', itemData);
    return response.data;
  },

  /**
   * Create a new item with direct multipart image file.
   * @param {FormData} formData
   */
  async createItemWithImage(formData) {
    const response = await api.post('/api/items/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing item by ID.
   * @param {number|string} id
   * @param {Object} updateData
   */
  async updateItem(id, updateData) {
    const response = await api.put(`/api/items/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete an item by ID.
   * @param {number|string} id
   */
  async deleteItem(id) {
    const response = await api.delete(`/api/items/${id}`);
    return response.data;
  },
};

export default itemService;
