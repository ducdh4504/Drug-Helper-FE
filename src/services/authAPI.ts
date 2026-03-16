import axiosClient from './axiosClient';

// Function to send login request to Backend
export const login = (data: { usernameOrEmail: string; password: string }) => {
  return axiosClient.post('/Auth/login', data);
};

// Function to send register request to Backend
export const register = (data: {
  userName: string;
  email: string;
  birthday: string;
  password: string;
}) => {
  return axiosClient.post('/Auth/register', data);
};

// Function to send idToken to Backend for Google login
export const googleLogin = (credential: string) => {
  return axiosClient.post('/Auth/google-login', { idToken:credential });
};

export const resetPassword = (data: {
  email: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  return axiosClient.post('/Auth/reset-password', data);
}