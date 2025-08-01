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

// Add this interceptor for handling errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Clear token and redirect to login (or call logout logic)
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("tokenVersion");
      localStorage.removeItem("masterKey");

      window.location.href = "/register"; // or your login route
    }
    return Promise.reject(error);
  }
);

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const updateMasterKey = (data) =>
  API.put("/auth/update-master-key", data);

export const getPeople = () => API.get("/persons");
export const addPerson = (data) => API.post("/persons", data);

export const getTransactions = () => API.get("/transactions");
export const addTransaction = (data) => API.post("/transactions", data);

// Personal Expenses API
export const getPersonalExpenses = () => API.get("/personal-expenses");
export const addPersonalExpense = (data) =>
  API.post("/personal-expenses", data);
export const deletePersonalExpense = (id) =>
  API.delete(`/personal-expenses/${id}`);
// Update personal expense
export const updatePersonalExpense = (id, data) =>
  API.put(`/personal-expenses/${id}`, data);

export const sendFeedback = (data) => API.post("/feedback", data);
