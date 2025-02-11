// hooks/useAxiosSecure.js
import axios from "axios";
const baseURL = import.meta.env.VITE_BASE_URL;  // Use VITE_ prefix here
const axiosSecure = axios.create({
  baseURL: baseURL,
});

const useAxiosSecure = () => {
  return axiosSecure;
};

export default useAxiosSecure;
