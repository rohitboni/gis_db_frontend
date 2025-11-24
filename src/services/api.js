import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gis-portal.1acre.in';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes default timeout (for large file uploads)
});

// Files API
export const filesApi = {
  // Upload file with progress tracking
  uploadFile: async (file, state, district = null, onUploadProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (state) {
      formData.append('state', state);
    }
    if (district) {
      formData.append('district', district);
    }
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes for large file uploads
      maxBodyLength: Infinity, // Allow unlimited file size
      maxContentLength: Infinity, // Allow unlimited response size
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // Upload multiple files with progress tracking
  uploadMultipleFiles: async (files, state, district = null, onUploadProgress = null) => {
    const formData = new FormData();
    // Append all files
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (state) {
      formData.append('state', state);
    }
    if (district) {
      formData.append('district', district);
    }
    const response = await api.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes for large file uploads
      maxBodyLength: Infinity, // Allow unlimited file size
      maxContentLength: Infinity, // Allow unlimited response size
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // List files
  getFiles: async (params = {}) => {
    const response = await api.get('/files', { params });
    return response.data;
  },

  // Get single file
  getFile: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  // Get file features
  getFileFeatures: async (fileId, params = {}, config = {}) => {
    const response = await api.get(`/files/${fileId}/features`, { 
      params,
      ...config,
      timeout: 30000,
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (id) => {
    await api.delete(`/files/${id}`);
  },

  // Get states
  getStates: async () => {
    const response = await api.get('/files/states');
    return response.data;
  },

  // Get districts
  getDistricts: async (state = null) => {
    const params = state ? { state } : {};
    const response = await api.get('/files/districts', { params });
    return response.data;
  },

  // Download single file with format conversion
  downloadFile: async (fileId, format = 'geojson') => {
    const response = await api.get(`/files/${fileId}/download`, {
      params: { format },
      responseType: 'blob', // Important for file downloads
      timeout: 600000, // 10 minutes for large files
    });
    return response.data;
  },

  // Batch download multiple files
  downloadBatch: async (params = {}) => {
    const response = await api.get('/files/download/batch', {
      params,
      responseType: 'blob', // Important for file downloads
      timeout: 600000, // 10 minutes for large files
    });
    return response.data;
  },
};

// Features API
export const featuresApi = {

  // List features with filters
  // Set include_geometry=false for list views to reduce payload size
  getFeatures: async (params = {}, config = {}) => {
    const requestParams = {
      include_geometry: false, // Don't include full geometry in list view to reduce payload
      ...params,
    };
    const response = await api.get('/features', { 
      params: requestParams,
      ...config,
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  },

  // Get single feature
  getFeature: async (id) => {
    const response = await api.get(`/features/${id}`);
    return response.data;
  },

  // Update feature
  updateFeature: async (id, data) => {
    const response = await api.put(`/features/${id}`, data);
    return response.data;
  },

  // Delete feature
  deleteFeature: async (id) => {
    await api.delete(`/features/${id}`);
  },

  // Get states
  getStates: async () => {
    const response = await api.get('/features/states');
    return response.data;
  },

  // Get districts
  getDistricts: async (state = null) => {
    const params = state ? { state } : {};
    const response = await api.get('/features/districts', { params });
    return response.data;
  },

  // Get taluks
  getTaluks: async (district = null) => {
    const params = district ? { district } : {};
    const response = await api.get('/features/taluks', { params });
    return response.data;
  },

  // Get villages
  getVillages: async (district = null, taluk = null) => {
    const params = {};
    if (district) params.district = district;
    if (taluk) params.taluk = taluk;
    const response = await api.get('/features/villages', { params });
    return response.data;
  },
};

export default api;

