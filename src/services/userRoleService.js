import apiClient from './apiClient';

const endpoint = '/UserRole';

export const userRoleService = {
  getAll: async () => (await apiClient.get(`${endpoint}/GetAll`)).data,
  getById: async (id) => (await apiClient.get(`${endpoint}/GetById/${id}`)).data,
  add: async (payload) => (await apiClient.post(`${endpoint}/Add`, payload)).data,
  update: async (id, payload) => (await apiClient.put(`${endpoint}/Update/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`${endpoint}/Delete/${id}`)).data,
};
