import axios from "axios";

const API_URL = "http://localhost:5000/api/thuoc";

export const getThuoc = () => axios.get(API_URL);
export const addThuoc = (data) => axios.post(API_URL, data);
export const updateThuoc = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteThuoc = (id) => axios.delete(`${API_URL}/${id}`);
