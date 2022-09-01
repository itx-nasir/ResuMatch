import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://resumatch-qd38.onrender.com/api'
  : process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Job Description API calls
export const fetchJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const uploadJobJSON = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/jobs/upload-json', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// CV File API calls
export const fetchCVs = async () => {
  const response = await api.get('/cvs');
  return response.data;
};

export const uploadCVs = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await api.post('/cvs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Analysis API calls
export const analyzeCVs = async (jobId, cvIds) => {
  const response = await api.post('/analyze', {
    job_id: jobId,
    cv_ids: cvIds,
  });
  return response.data;
};

export const getJobAnalyses = async (jobId) => {
  const response = await api.get(`/analyses/${jobId}`);
  return response.data;
};

// Test API call
export const runSystemTest = async () => {
  const response = await api.get('/test');
  return response.data;
};

export default api;