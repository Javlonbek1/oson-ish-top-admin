// src/api/axiosInstance.js
import axios from "axios";
import { baseURL } from "./path";

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
