// frontend/src/api/eletrocalhasService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Default to localhost if not set

const getHeaders = (accessToken) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
});

export const eletrocalhasService = {
  // GET all eletrocalhas for a project
  getEletrocalhas: async (projectId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/eletrocalhas?project_id=${projectId}`, {
      method: 'GET',
      headers: getHeaders(accessToken),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // GET an eletrocalha by ID
  getEletrocalhaById: async (eletrocalhaId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/eletrocalhas/${eletrocalhaId}`, {
      method: 'GET',
      headers: getHeaders(accessToken),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // POST a new eletrocalha
  createEletrocalha: async (eletrocalhaData, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/eletrocalhas`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(eletrocalhaData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // PUT (update) an existing eletrocalha
  updateEletrocalha: async (eletrocalhaId, eletrocalhaData, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/eletrocalhas/${eletrocalhaId}`, {
      method: 'PUT',
      headers: getHeaders(accessToken),
      body: JSON.stringify(eletrocalhaData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // DELETE an eletrocalha
  deleteEletrocalha: async (eletrocalhaId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/eletrocalhas/${eletrocalhaId}`, {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
