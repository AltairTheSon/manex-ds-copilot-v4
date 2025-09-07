import axios from 'axios';

const FIGMA_API_BASE_URL = 'https://api.figma.com/v1';

// Create API service with configurable token
const createFigmaApiService = (token) => {
  const api = axios.create({
    baseURL: FIGMA_API_BASE_URL,
    headers: {
      'X-Figma-Token': token
    }
  });

  return {
    // Get file information
    getFile: async (fileId) => {
      try {
        const response = await api.get(`/files/${fileId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get file nodes
    getFileNodes: async (fileId, ids) => {
      try {
        const idsParam = ids.join(',');
        const response = await api.get(`/files/${fileId}/nodes?ids=${idsParam}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get file images
    getFileImages: async (fileId, scale = 1) => {
      try {
        const response = await api.get(`/files/${fileId}/images?scale=${scale}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get file comments
    getFileComments: async (fileId) => {
      try {
        const response = await api.get(`/files/${fileId}/comments`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get file components
    getFileComponents: async (fileId) => {
      try {
        const response = await api.get(`/files/${fileId}/components`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get file styles
    getFileStyles: async (fileId) => {
      try {
        const response = await api.get(`/files/${fileId}/styles`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get team components
    getTeamComponents: async (teamId) => {
      try {
        const response = await api.get(`/teams/${teamId}/components`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get team styles
    getTeamStyles: async (teamId) => {
      try {
        const response = await api.get(`/teams/${teamId}/styles`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get user info
    getUserInfo: async () => {
      try {
        const response = await api.get('/me');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };
};

export default createFigmaApiService;