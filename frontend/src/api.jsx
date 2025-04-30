import axios from 'axios';

const API_BASE_URL = "http://localhost:5000";

export const createEmployee = (data) => axios.post(`${API_BASE_URL}/employee`, data);
export const getEmployees = () => axios.get(`${API_BASE_URL}/employee`);
export const updateEmployee = (id, data) => axios.put(`${API_BASE_URL}/employee/${id}`, data);
export const deleteEmployee = (id) => axios.delete(`${API_BASE_URL}/employee/${id}`);
