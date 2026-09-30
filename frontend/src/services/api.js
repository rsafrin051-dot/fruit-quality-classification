/**
 * Central API configuration for Fruit Quality Classification frontend.
 * Communicates with Flask backend via configurable base URL.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const API_ENDPOINTS = {
  PREDICT: `${API_BASE_URL}/api/predict`,
  PREDICTIONS: `${API_BASE_URL}/api/predictions`,
  DASHBOARD: `${API_BASE_URL}/api/dashboard/stats`,
  HEALTH: `${API_BASE_URL}/api/health`,
  MODEL_PERFORMANCE: `${API_BASE_URL}/api/model-performance`,
  UPLOADS: `${API_BASE_URL}/api/uploads`,
  GENERATED: `${API_BASE_URL}/api/generated`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS
};
