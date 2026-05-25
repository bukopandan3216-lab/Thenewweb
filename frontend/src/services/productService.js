import api from '../api'

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const getFarmers = (params) => api.get('/products/farmers', { params })
export const getFarmer = (id) => api.get(`/products/farmers/${id}`)
export const getFarmerDashboard = () => api.get('/products/farmer/dashboard')
