// frontend/src/api/racksService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (accessToken) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
});

export const racksService = {
  /**
   * Busca todas as rotas conectadas a um rack específico.
   * @param {number} rackId - O ID do rack.
   * @param {string} accessToken - O token de acesso do usuário.
   * @returns {Promise<Array>} - Uma promessa que resolve para a lista de rotas.
   */
  getRackRoutes: async (rackId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/racks/${rackId}/rotas`, {
      method: 'GET',
      headers: getHeaders(accessToken),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    return data;
  },
};
