import axiosInstance from './axiosInstance';

export const signupBonusApi = {
    list: (params) => axiosInstance.get('/admin/signup-bonus', { params }),
    get: (id) => axiosInstance.get(`/admin/signup-bonus/${id}`),
    createGeneral: (data) => axiosInstance.post('/admin/signup-bonus/create-general', null, { params: data }),
    createPromo: (params) => axiosInstance.post('/admin/signup-bonus/create-promo', {}, { params }),
    cancel: (campaignId) => axiosInstance.delete('/admin/signup-bonus/cancel', { params: { campaignId } }),
};