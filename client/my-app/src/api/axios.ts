import axios from 'axios';




const apiUrl = process.env.NODE_ENV === 'production' ? 'https://finance-care-14.onrender.com/api' : 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: `${apiUrl}`,
  withCredentials: true, // Important to send cookies
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});