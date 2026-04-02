import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import dashboardService from '../../services/dashboardService'
import demandeService from '../../services/demandeService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import Card from '../../components/Common/Card'
import Button from '../../components/Common/Button'
import { motion } from 'framer-motion'
import {
  ClipboardDocumentListIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon, PlusCircleIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#f59e0b','#10b981','#ef4444','#3b82f6']

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
    className="rounded-2xl border p-5 flex items-center gap-4"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{title}</p>
      <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text)' }}>{value ?? 0}</p>
    </div>
  </motion.div>
)

const HospitalDashboard = () => {
  const { user }  = useAuth()
  const { t }     = useTranslation()
  const [stats, setStats]         = useState(null)
  const [demandes, setDemandes]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sR, dR] = await Promise.all([
        dashboardService.getStats(),
        demandeService.getDemandes({ per_page: 5 }),
      ])
      setStats(sR.data)
      setDemandes(dR.data || [])
    } catch { } finally { setLoading(false) }
  }

  const statusBadge = (s) => {
    const m = { pending:'badge badge-yellow', approved:'badge badge-blue', rejected:'badge badge-red', completed:'badge badge-green' }
    const l = { pending: t('status.pending'), approved: t('status.approved'), rejected: t('status.rejected'), completed: t('status.completed') }
    return <span className={m[s] || 'badge badge-gray'}>{l[s] || s}</span>
  }

  if (loading) return <div className="flex justify-center items-center h-72"><LoadingSpinner size="lg" /></div>

  const pieData = [
    { name: t('status.pending'),   value: stats?.pending_demandes   || 0 },
    { name: t('status.approved'),  value: stats?.approved_demandes  || 0 },
    { name: t('status.rejected'),  value: stats?.rejected_demandes  || 0 },
    { name: t('status.completed'), value: stats?.completed_demandes || 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">{t('nav.dashboard')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('common.welcome')}, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} icon={ArrowPathIcon}>{t('common.refresh')}</Button>
          <Link to="/demandes/create">
            <Button variant="primary" size="sm" icon={PlusCircleIcon}>{t('demandes.new_request')}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('stats.total_requests')}   value={stats?.total_demandes}    icon={ClipboardDocumentListIcon} colorClass="bg-blue-500" />
        <StatCard title={t('stats.pending')}          value={stats?.pending_demandes}  icon={ClockIcon}                 colorClass="bg-amber-500" />
        <StatCard title={t('stats.approved')}         value={stats?.approved_demandes} icon={CheckCircleIcon}           colorClass="bg-emerald-500" />
        <StatCard title={t('stats.rejected')}         value={stats?.rejected_demandes} icon={XCircleIcon}               colorClass="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title={t('stats.by_status')}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('stats.by_blood_type')}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats?.demandes_by_blood_type || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="blood_type" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title={t('demandes.recent')}>
        <div className="t-wrap">
          <table className="t-table">
            <thead className="t-head">
              <tr>
                <th className="t-th">{t('demandes.patient')}</th>
                <th className="t-th">{t('demandes.blood_type')}</th>
                <th className="t-th">{t('demandes.quantity')}</th>
                <th className="t-th">{t('demandes.status')}</th>
                <th className="t-th">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="t-body">
              {demandes.map(d => (
                <tr key={d.id}>
                  <td className="t-td font-medium">{d.patient_name}</td>
                  <td className="t-td"><span className="badge badge-red">{d.blood_type}</span></td>
                  <td className="t-td t-td-muted">{d.quantity}</td>
                  <td className="t-td">{statusBadge(d.status)}</td>
                  <td className="t-td t-td-muted">{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {demandes.length === 0 && (
                <tr><td colSpan="5" className="t-td text-center py-8" style={{ color: 'var(--text-faint)' }}>{t('demandes.empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {demandes.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/demandes">
              <Button variant="outline" size="sm">{t('demandes.view_all')}</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

export default HospitalDashboard