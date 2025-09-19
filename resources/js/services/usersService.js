import api from "./api";

export const getUsers = () => api.get('/users'); 
export const addUser = (user) => api.post('/users/add', user);