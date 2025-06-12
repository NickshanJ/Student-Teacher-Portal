// src/axiosConfig.js
import axios from 'axios';
import { BASE_URL } from './config';
import { logout } from './utils/logout';

const instance = axios.create({
  baseURL: BASE_URL,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.message === 'Session expired. Please log in again.'
    ) {
      logout(); // Auto logout on token expiry
    }
    return Promise.reject(error);
  }
);

export default instance;