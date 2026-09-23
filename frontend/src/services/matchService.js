import api from './api';

/**
 * Service for smart lost & found item matching.
 */
export const matchService = {
  /**
   * Fetch potential matches of opposite type for a given item ID.
   * @param {number|string} itemId
   */
  async getMatches(itemId) {
    const response = await api.get(`/api/items/${itemId}/matches`);
    return response.data;
  },
};

export default matchService;
