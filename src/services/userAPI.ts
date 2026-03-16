import axiosClient from './axiosClient';

export const getUserProfile = () => {
  return axiosClient.get('/User/profile');
};

export const updateUserProfile = (profileData: {
  fullName: string;
  dateOfBirth: string; 
  address: string;
  phone: string;
}) => {
  return axiosClient.put('/User/profile', profileData);
};

export const getAllUsers = () => {
  return axiosClient.get('/User');
};

export const getUserById = (userId: string) => {
  return axiosClient.get(`/User/${userId}`);
};

export const getAuthorName = (userId: string) => {
  return axiosClient.get(`/User/author/${userId}`)
};

export const updateUser = (userId: string, data: any) => {
  return axiosClient.put(`/User/${userId}`, data);
};

export const addUser = (data: any) => {
  return axiosClient.post('/User', data);
};

export const getAgeGroupStats = () => {
  return axiosClient.get('/User/statistics/age-groups');
}