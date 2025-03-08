// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';  //Centralize base URL

/**
 * Configured Axios instance for API requests.
 * @constant api
 */
const api = axios.create({ ///////// WAG MUNA LAGYAN TEST DI GUMAGANA TO BOSS
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor (OPTIONAL, but very useful)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default api;