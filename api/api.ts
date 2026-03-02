import axios from 'axios';
import { Platform } from 'react-native';

// Use your computer's local IP address to ensure connectivity from physical devices
// We use 192.168.1.9 as it's your machine's local address on the Wi-Fi
const BASE_URL = 'http://192.168.1.9:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData),
};

export default api;
