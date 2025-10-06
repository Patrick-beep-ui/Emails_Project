import api from "./api";

export const getUserNews = (userId, page = 1) => api.get(`/news/user/${userId}?page=${page}`);