// src/services/api.js
import axios from "axios";
import { BACKEND_URL } from "../constants/globle";

const API = axios.create({
  baseURL: BACKEND_URL, // Adjust if deployed
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

export const getPeople = () => API.get("/persons");
export const addPerson = (data) => API.post("/persons", data);

export const getTransactions = () => API.get("/transactions");
export const addTransaction = (data) => API.post("/transactions", data);
