import apiClient from './apiClient';

// TaskStatusController uses [Route("api/[controller]")] — no [action] segment in URLs.
const endpoint = '/TaskStatus';

export const taskStatusService = {
  getAll: async () => (await apiClient.get(endpoint)).data,
  getById: async (id) => (await apiClient.get(`${endpoint}/${id}`)).data,
  add: async (payload) => (await apiClient.post(endpoint, payload)).data,
  update: async (id, payload) => (await apiClient.put(`${endpoint}/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`${endpoint}/${id}`)).data,
};
