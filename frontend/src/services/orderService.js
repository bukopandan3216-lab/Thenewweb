import api from '../api'

export const createOrder = (payload) => api.post('/orders', payload)
export const getMyOrders = () => api.get('/orders/my')
export const cancelOrder = (id, payload) => api.post(`/orders/${id}/cancel`, payload)
export const markReceived = (id) => api.post(`/orders/${id}/received`)
