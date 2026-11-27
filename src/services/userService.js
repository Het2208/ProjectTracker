import apiClient from './apiClient';

const endpoint = '/User';

function toFormData(dto) {
  const formData = new FormData();
  formData.append('UserTypeId', String(dto.userTypeId));
  formData.append('FullName', dto.fullName ?? '');
  formData.append('UserCode', dto.userCode ?? '');
  formData.append('Email', dto.email ?? '');
  formData.append('Password', dto.password ?? '');
  formData.append('MobileNumber', dto.mobileNumber ?? '');
  formData.append('IsActive', String(dto.isActive ?? true));
  if (dto.isDeleted !== undefined && dto.isDeleted !== null) {
    formData.append('IsDeleted', String(dto.isDeleted));
  }
  if (dto.userId !== undefined && dto.userId !== null) {
    formData.append('UserId', String(dto.userId));
  }
  if (dto.profilePicturePath) formData.append('ProfilePicturePath', dto.profilePicturePath);
  return formData;
}

export const userService = {
  getAll: async () => (await apiClient.get(`${endpoint}/GetAll`)).data,
  getById: async (id) => (await apiClient.get(`${endpoint}/GetById/${id}`)).data,
  add: async (dto) => (await apiClient.post(`${endpoint}/Add`, toFormData(dto))).data,
  update: async (id, dto) => (await apiClient.put(`${endpoint}/Update/${id}`, toFormData(dto))).data,
  remove: async (id) => (await apiClient.delete(`${endpoint}/Delete/${id}`)).data,
  removePicture: async (id) => (await apiClient.delete(`${endpoint}/Delete/${id}`, { params: { deleteFileOnly: true } })).data,
};
