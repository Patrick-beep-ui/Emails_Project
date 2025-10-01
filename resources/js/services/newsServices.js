import api from "./api";

export const getUserNews = (userId) => api.get(`/news/user/${userId}`);