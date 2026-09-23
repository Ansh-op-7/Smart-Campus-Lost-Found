import api from './api';

/**
 * Service for managing claims and recovery flow.
 */
export const claimService = {
  /**
   * Submit a new claim for a FOUND item.
   * @param {{ itemId: number, message: string }} payload
   */
  async createClaim(payload) {
    const response = await api.post('/api/claims', payload);
    return response.data;
  },

  /**
   * Fetch all claims submitted by current user.
   */
  async getMyClaims() {
    const response = await api.get('/api/claims/my');
    return response.data;
  },

  /**
   * Fetch all claims received for items reported by current user.
   */
  async getReceivedClaims() {
    const response = await api.get('/api/claims/received');
    return response.data;
  },

  /**
   * Fetch single claim by ID.
   * @param {number|string} id
   */
  async getClaimById(id) {
    const response = await api.get(`/api/claims/${id}`);
    return response.data;
  },

  /**
   * Approve or reject a claim (Item reporter or Admin only).
   * @param {number|string} id
   * @param {'APPROVED'|'REJECTED'} status
   */
  async updateClaimStatus(id, status) {
    const response = await api.put(`/api/claims/${id}/status`, { status });
    return response.data;
  },

  /**
   * Mark an approved claim/item as completed and returned.
   * @param {number|string} id
   */
  async completeClaim(id) {
    const response = await api.put(`/api/claims/${id}/complete`);
    return response.data;
  },
};

export default claimService;
