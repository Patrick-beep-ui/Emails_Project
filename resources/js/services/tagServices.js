import api from "./api";

export const getTags = () => api.get('/tags');
export const getTagsInfo = () => api.get('/tags/info');
export const getUserTags = (userId) => api.get(`/tags/user/${userId}`);