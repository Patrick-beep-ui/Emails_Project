import api from "./api";

export const getTags = () => api.get('/tags');
export const getTagsInfo = () => api.get('/tags/info');
export const getUserTags = (userId) => api.get(`/tags/user/${userId}`);
export const requestSubscription = (data) => api.post('/tags/subscription/request', data);
export const approveSubscription = (data) => api.post('/tags/subscription/approve', data);
export const rejectSubscription = (requestId) => api.post(`/tags/subscription/reject/${requestId}`);
export const toggleTagStatus = (data) => api.post('/tags/toggle-status', data);