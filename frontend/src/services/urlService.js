import api from './api';

export const createUrl = async (urlData) => {
    const response = await api.post('/urls', urlData);
    return response.data;
};

export const getUrls = async () => {
    const response = await api.get('/urls');
    return response.data;
};

export const deleteUrl = async (urlId) => {
    await api.delete(`/urls/${urlId}`);
};

export const getAnalytics = async (urlId) => {
    const response = await api.get(`/analytics/${urlId}`);
    return response.data;
};
