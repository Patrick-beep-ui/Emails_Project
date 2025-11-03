import api from "./api";

// services/newsServices.ts
export const getUserNews = (userId, page = 1, month = 10, year = 2025) =>
    api.get(`/news/user/${userId}`, {
      params: { page, month, year },
    });

    export const saveNews = (userId, newsId) =>
        api.post("/saved-news/save", { user_id: userId, news_id: newsId });
      
      export const unsaveNews = (userId, newsId) =>
        api.post("/saved-news/unsave", { user_id: userId, news_id: newsId });
      
      export const getSavedNews = (userId, page = 1) =>
        api.get(`/saved-news/user/${userId}?page=${page}`);