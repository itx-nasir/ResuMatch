import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Job Description API calls
export const fetchJobs = async () => {
  const response = await api.get('/api/jobs');
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/api/jobs', jobData);
  return response.data;
};

export const uploadJobJSON = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/jobs/upload-json', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// CV File API calls
export const fetchCVs = async () => {
  const response = await api.get('/api/cvs');
  return response.data;
};

export const uploadCVs = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await api.post('/api/cvs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Analysis API calls
export const analyzeCVs = async (jobId, cvIds) => {
  const response = await api.post('/api/analyze', {
    job_id: jobId,
    cv_ids: cvIds,
  });
  return response.data;
};

export const getJobAnalyses = async (jobId) => {
  const response = await api.get(`/api/analyses/${jobId}`);
  return response.data;
};

// Test API call
export const runSystemTest = async () => {
  const response = await api.get('/api/test');
  return response.data;
};

export default api;