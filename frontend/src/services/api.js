/**
 * API Service - Axios instance with all API calls
 * 
 * All API calls to the Ping Robot backend
 * Base URL: Uses REACT_APP_API_URL environment variable (defaults to localhost for development)
 * Production: https://ping-robot.onrender.com
 */

import axios from 'axios';

// Create axios instance with base configuration
// Use environment variable for API URL (falls back to localhost for development)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Health Check
 * GET /health
 * Returns API health status
 */
export const getHealth = () => 
  api.get('/health').then(response => response.data);

/**
 * Create Target
 * POST /targets
 * Creates a new HTTP target configuration
 */
export const createTarget = (data) => 
  api.post('/targets', data).then(response => response.data);

/**
 * Create Schedule
 * POST /schedules
 * Creates a new schedule for executing a target
 */
export const createSchedule = (data) => 
  api.post('/schedules', data).then(response => response.data);

/**
 * Pause Schedule
 * POST /schedules/{id}/pause
 * Pauses an active schedule
 */
export const pauseScheduleAPI = (id) => 
  api.post(`/schedules/${id}/pause`).then(response => response.data);

/**
 * Get Runs
 * GET /runs
 * Gets run history with optional filtering and pagination
 * @param {Object} params - Query parameters (schedule_id, limit, offset)
 */
export const getRuns = (params = {}) => 
  api.get('/runs', { params }).then(response => response.data);

/**
 * Get Metrics
 * GET /metrics
 * Gets aggregated metrics from run history
 * @param {Object} params - Query parameters (schedule_id)
 */
export const getMetrics = (params = {}) => 
  api.get('/metrics', { params }).then(response => response.data);

export default api;
