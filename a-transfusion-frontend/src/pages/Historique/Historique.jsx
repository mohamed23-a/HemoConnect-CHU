import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import demandeService from '../../services/demandeService'
import Card from '../../components/Common/Card'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const Historique = () => {
  const { user }  = useAuth()
  const { t }     = useTranslation()
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  useEffect(() => { fetchHistorique() }, [])

  const fetchHistorique = async () => {
    setLoading(true)
    try {
      const r = await demandeService.getDemandes({ per_page: 100 })
      setDemandes(r.data || [])
    } catch { } finally { setLoading(false) }
  }

  const filtered = demandes.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return d.patient_name?.toLowerCase().includes(s) ||
             d.blood_type?.toLowerCase().includes(s) ||
             d.hospital?.name?.toLowerCase().includes(s)
    }
    return true
  })

  const statusBadge = (s) => {
    const m = { pending:'badge badge-yellow', approved:'badge badge-blue', rejected:'badge badge-red', completed:'badge badge-green' }
    const l = { pending: t('status.pending'), approved: t('status.approved'), rejected: t('status.rejected'), completed: t('status.completed') }
    return <span className={m[s] || 'badge badge-gray'}>{l[s] || s}</span>
  }

  const urgencyBadge = (u) => {
    const m = { normal:'badge badge-green', urgent:'badge badge-yellow', emergency:'badge badge-red' }
    const l = { normal: t('urgency.normal'), urgent: t('urgency.urgent'), emergency: t('urgency.emergency') }
    return <span className={m[u] || 'badge badge-gray'}>{l[u] || u}</span>
  }

  if (loading) return <div className="flex justify-center items-center h-72"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="page-title">{t('nav.history')}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} {t('demandes.results')}
        </p>
      </motion.div>

      {/* Search & Filter */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ [document.documentElement.dir === 'rtl' ? 'right' : 'left']: '12px', color: 'var(--text-faint)' }} />
            <input
              className="th-input"
              style={{ paddingRight: document.documentElement.dir === 'rtl' ? '36px' : '12px', paddingLeft: document.documentElement.dir === 'rtl' ? '12px' : '36px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('demandes.search_placeholder')}
            />
          </div>
          <select className="th-input" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">{t('common.all')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="approved">{t('status.approved')}</option>
            <option value="rejected">{t('status.rejected')}</option>
            <option value="completed">{t('status.completed')}</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="t-wrap">
          <table className="t-table">
            <thead className="t-head">
              <tr>
                <th className="t-th">{t('common.date')}</th>
                <th className="t-th">{t('demandes.patient')}</th>
                {user?.role !== 'hospital' && <th className="t-th">{t('demandes.hospital')}</th>}
                <th className="t-th">{t('demandes.blood_type')}</th>
                <th className="t-th">{t('demandes.quantity')}</th>
                <th className="t-th">{t('demandes.urgency')}</th>
                <th className="t-th">{t('demandes.status')}</th>
                {user?.role !== 'hospital' && <th className="t-th">{t('historique.processed_at')}</th>}
              </tr>
            </thead>
            <tbody className="t-body">
              {filtered.map(d => (
                <tr key={d.id}>
                  <td className="t-td t-td-muted">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="t-td font-medium">{d.patient_name}</td>
                  {user?.role !== 'hospital' && <td className="t-td t-td-muted">{d.hospital?.name || '—'}</td>}
                  <td className="t-td"><span className="badge badge-red">{d.blood_type}</span></td>
                  <td className="t-td t-td-muted">{d.quantity} {t('demandes.units')}</td>
                  <td className="t-td">{urgencyBadge(d.urgency)}</td>
                  <td className="t-td">{statusBadge(d.status)}</td>
                  {user?.role !== 'hospital' && (
                    <td className="t-td t-td-muted">
                      {d.treated_at ? new Date(d.treated_at).toLocaleDateString() : '—'}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={user?.role !== 'hospital' ? 8 : 6} className="t-td text-center py-10" style={{ color: 'var(--text-faint)' }}>
                    {t('demandes.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Historique