import api from './api'

const stockService = {
  // الحصول على المخزون
  getStock: async () => {
    const response = await api.get('/blood-stock')
    return response.data
  },

  // الحصول على مخزون فصيلة محددة
  getStockByType: async (bloodType) => {
    const response = await api.get(`/blood-stock/${bloodType}`)
    return response.data
  },

  // تحديث المخزون
  updateStock: async (bloodType, data) => {
    const response = await api.put(`/blood-stock/${bloodType}`, data)
    return response.data
  },

  // إضافة مخزون
  addStock: async (data) => {
    const response = await api.post('/blood-stock/add', data)
    return response.data
  },

  // خصم مخزون
  deductStock: async (data) => {
    const response = await api.post('/blood-stock/deduct', data)
    return response.data
  },
}

export default stockService