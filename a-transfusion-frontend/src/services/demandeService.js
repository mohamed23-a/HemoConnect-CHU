import api from './api'

const demandeService = {
  // الحصول على قائمة الطلبات
  getDemandes: async (params = {}) => {
    const response = await api.get('/demandes', { params })
    return response.data
  },

  // الحصول على طلب محدد
  getDemande: async (id) => {
    const response = await api.get(`/demandes/${id}`)
    return response.data
  },

  // إنشاء طلب جديد
  createDemande: async (data) => {
    const response = await api.post('/demandes', data)
    return response.data
  },

  // تحديث طلب
  updateDemande: async (id, data) => {
    const response = await api.put(`/demandes/${id}`, data)
    return response.data
  },

  // قبول طلب
  approveDemande: async (id, notes) => {
    const response = await api.post(`/demandes/${id}/approve`, { notes })
    return response.data
  },

  // رفض طلب
  rejectDemande: async (id, rejection_reason) => {
    const response = await api.post(`/demandes/${id}/reject`, { rejection_reason })
    return response.data
  },

  // إكمال طلب
  completeDemande: async (id, notes) => {
    const response = await api.post(`/demandes/${id}/complete`, { notes })
    return response.data
  },

  // إلغاء طلب
  cancelDemande: async (id) => {
    const response = await api.put(`/demandes/${id}/cancel`)
    return response.data
  },
}

export default demandeService