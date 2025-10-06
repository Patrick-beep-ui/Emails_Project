import api from "./api";

export const getUserRecipients = (userId) => api.get(`/recipients/${userId}`);
export const addUserRecipients = (data) => api.post('/recipients/add', data);