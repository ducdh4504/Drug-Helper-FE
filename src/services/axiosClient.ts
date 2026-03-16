import axios from 'axios';

let authToken: string | undefined = undefined;

export const setAuthToken = (token?: string) => {
  authToken = token;
};

const axiosClient = axios.create({
  baseURL: 'https://localhost:7029/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
