import api from "./api";

export const getUsers = () => api.get('/users'); 
export const addUser = (user) => api.post('/users/add', user);
export const getUserStats = (userId) => api.get(`/users/user/stats/${userId}`);
export const getUserRequests = () => api.get(`/users/subscriptions/requests`);