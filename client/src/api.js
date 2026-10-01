import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const runSimulation = (payload) =>
  api.post("/simulations/run", payload).then((r) => r.data);

export const saveSimulation = (payload) =>
  api.post("/simulations", payload).then((r) => r.data);

export const fetchHistory = () =>
  api.get("/simulations").then((r) => r.data);

export const fetchSimulation = (id) =>
  api.get(`/simulations/${id}`).then((r) => r.data);

export const deleteSimulation = (id) =>
  api.delete(`/simulations/${id}`).then((r) => r.data);

export const predictBurstTime = (payload) =>
  api.post("/predict", payload).then((r) => r.data);

export const fetchBurstHistory = () =>
  api.get("/predict/history").then((r) => r.data);

export const deleteBurstHistory = (id) =>
  api.delete(`/predict/history/${id}`).then((r) => r.data);

export default api;
