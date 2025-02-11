import axios from 'axios';

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // Dynamic base URL from environment variables
  withCredentials: true, // Include credentials with the requests
});

export default axiosSecure;
