// authService.js
import api from './api'

export const login = async (credentials) => {
  const { data } = await api.post('/login', credentials)
  // Save token 
  localStorage.setItem('token', data.token)
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
  return data.user
}

export const getUser = async () => {
  const { data } = await api.get('/user', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  return data
}

export const logout = async () => {
  await api.post('/logout', null, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  localStorage.removeItem('token')
  delete api.defaults.headers.common['Authorization']
}
