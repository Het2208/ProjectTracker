import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    const loginResponse = await apiClient.post('/User/Login', { email, password });
    
    // API returns APIResponse<AuthResponseDTO> with Data: { Token, User }
    const apiData = loginResponse.data?.data ?? loginResponse.data?.Data ?? loginResponse.data;
    const token = apiData?.token ?? apiData?.Token;
    const userRecord = apiData?.user ?? apiData?.User ?? null;

    if (!token) throw new Error('No token returned from the server.');

    return {
      token,
      userRecord: userRecord ? {
        userId: userRecord.userId ?? userRecord.UserId,
        fullName: userRecord.fullName ?? userRecord.FullName,
        email: userRecord.email ?? userRecord.Email,
        role: userRecord.userTypeName ?? userRecord.UserTypeName,
        userCode: userRecord.userCode ?? userRecord.UserCode,
        mobileNumber: userRecord.mobileNumber ?? userRecord.MobileNumber,
        profilePicturePath: userRecord.profilePicturePath ?? userRecord.ProfilePicturePath,
      } : null,
    };
  },

  register: async (formData) => {
    const response = await apiClient.post('/User/Register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
