import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartBarIcon, BeakerIcon, ClipboardDocumentListIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import dashboardService from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import Card from '../../components/Common/Card'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../animations/variants'

const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
    className="rounded-2xl border p-5 flex items-center gap-4"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{title}</p>
      <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text)' }}>{value ?? '—'}</p>
    </div>
  </motion.div>
)

const Statistiques = () => {
  const { t } = useTranslation()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await dashboardService.getStats()
        setStats(r.data)
      } catch { setError(t('errors.load_failed')) }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
  if (error)   return <div className="text-center text-red-500 mt-10 text-sm">{error}</div>

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="page-title">{t('nav.statistics')}</h1>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title={t('stats.total_requests')} value={stats?.total_demandes ?? stats?.demandes_count}
          icon={ClipboardDocumentListIcon} gradient="bg-blue-500" />
        <StatCard title={t('stats.pending')}        value={stats?.pending_demandes}
          icon={ClipboardDocumentListIcon} gradient="bg-amber-500" />
        <StatCard title={t('stats.total_users') || 'Utilisateurs'} value={stats?.total_users ?? stats?.users_count}
          icon={UserGroupIcon} gradient="bg-emerald-500" />
        <StatCard title={t('stats.blood_types_available') || 'Types de sang'} value={stats?.blood_types_count ?? stats?.blood_stock_count}
          icon={BeakerIcon} gradient="bg-red-500" />
      </motion.div>

      {/* Blood stock table */}
      {stats?.blood_stock && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <Card title={t('stock.title')}>
            <div className="t-wrap">
              <table className="t-table">
                <thead className="t-head">
                  <tr>
                    <th className="t-th">{t('stock.blood_type')}</th>
                    <th className="t-th">{t('stock.quantity')} ({t('stock.units')})</th>
                    <th className="t-th">{t('stock.status')}</th>
                  </tr>
                </thead>
                <tbody className="t-body">
                  {stats.blood_stock.map(item => (
                    <tr key={item.blood_type}>
                      <td className="t-td font-bold text-red-500">{item.blood_type}</td>
                      <td className="t-td">
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                      </td>
                      <td className="t-td">
                        {item.quantity === 0
                          ? <span className="badge badge-red">{t('stock.empty')}</span>
                          : item.quantity <= (item.minimum_threshold || 5)
                            ? <span className="badge badge-yellow">{t('stock.low')}</span>
                            : <span className="badge badge-green">{t('stock.available')}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Demandes by status */}
      {stats?.demandes_by_status && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <Card title={t('stats.by_status')}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(stats.demandes_by_status).map(([status, count]) => {
                const gradients = { pending:'bg-amber-500', approved:'bg-blue-500', rejected:'bg-red-500', completed:'bg-emerald-500' }
                const labels = { pending: t('status.pending'), approved: t('status.approved'), rejected: t('status.rejected'), completed: t('status.completed') }
                return (
                  <div key={status} className="rounded-xl p-4 border" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                    <div className={`w-8 h-1.5 rounded-full mb-3 ${gradients[status] || 'bg-gray-400'}`} />
                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{count}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{labels[status] || status}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default Statistiques
