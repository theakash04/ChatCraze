import axios from 'axios';

const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const useAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/v1',
  timeout: 3000,
  headers: { token: getAccessToken() },
  withCredentials: true,
});
