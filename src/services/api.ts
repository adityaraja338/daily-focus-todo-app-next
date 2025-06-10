import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data;
    Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    return response.data;
  },
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
  },
  getCurrentUser: (): User | null => {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: (): boolean => {
    return !!Cookies.get('token');
  },
};

export const taskService = {
  getTasks: async (page: number = 1, limit: number = 10, search?: string) => {
    const response = await api.get('/tasks', {
      params: { page, limit, search },
    });
    return response.data;
  },
  createTask: async (data: CreateTaskData) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  updateTask: async (id: string, data: Partial<Task>) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
}; 