import axios from "axios";

const API_BASE = "http://localhost:5000/api/admin"; // adjust if different

export const fetchUsers = async () => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
};

export const createUser = async (userData: any) => {
  const res = await axios.post(`${API_BASE}/users`, userData);
  return res.data;
};

export const updateUser = async (id: string, userData: any) => {
  const res = await axios.put(`${API_BASE}/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axios.delete(`${API_BASE}/users/${id}`);
  return res.data;
};
