import axios from 'axios';

// GANTI IP LAN (192.168...) MENJADI LOCALHOST
export const API_URL = 'http://127.0.0.1:5000'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});