import { BASE_URL } from '@/utils/authService'
import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId')
  const userId = localStorage.getItem('userId')
  if (sessionId && userId) {
    config.headers["Session-id"] = sessionId
    config.headers["User-Id"] = userId
  }
  return config
})
