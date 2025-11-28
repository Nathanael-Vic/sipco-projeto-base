// frontend/src/api/routesService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (accessToken) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
});

export const routesService = {
  /**
   * Pede ao backend para encontrar a melhor rota entre dois racks.
   * @param {number} projectId - O ID do projeto.
   * @param {number} sourceRackId - O ID do rack de origem.
   * @param {number} destinationRackId - O ID do rack de destino.
   * @param {string} accessToken - O token de acesso do usuário.
   * @returns {Promise<object>} - Uma promessa que resolve para o objeto da rota encontrada.
   */
  findRoute: async (projectId, sourceRackId, destinationRackId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/rotas/find?project_id=${projectId}`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify({
        source_rack_id: sourceRackId,
        destination_rack_id: destinationRackId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    return data;
  },

  /**
   * Confirma e salva uma rota planejada.
   * @param {object} routeData - Os dados da rota a serem salvos.
   * @param {string} accessToken - O token de acesso do usuário.
   * @returns {Promise<object>} - A resposta do backend.
   */
  confirmRoute: async (routeData, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/rotas/confirm`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(routeData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }
    return data;
  },

  getProjectRoutes: async (projectId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/rotas?project_id=${projectId}`, {
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
