import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Common/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../animations/variants'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [shake, setShake]     = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation()

  const demos = [
    { role: t('auth.role_admin') + " (Super)",   email: 'admin@transfusion.com',       color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800' },
    { role: t('auth.role_admin') + " (View)",    email: 'view@admin.com',              color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' },
    { role: t('auth.role_hospital'),             email: 'ibnsina@hospital.com',        color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800' },
    { role: t('auth.role_blood_center'),         email: 'bloodcenter@transfusion.com', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || t('auth.invalid_credentials'))
      setShake(true); setTimeout(() => setShake(false), 600)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-login.png')" }}
      />
      {/* Dark overlay */}
      <div className="login-bg-overlay" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl shadow-2xl p-8 border"
          style={{ border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {/* Logo */}
          <div className="text-center mb-7">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
            >
              <img src="/logo.png" alt="HemoConnect CHU Logo" className="w-full h-full object-contain drop-shadow-2xl rounded-2xl" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">{t('auth.title')}</h1>
            <p className="text-white/60 text-sm mt-1">{t('auth.subtitle')}</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm rounded-xl px-4 py-3">
                  ⚠️ {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <motion.div variants={staggerItem} className="space-y-1.5">
              <label className="block text-sm font-medium text-white/80">{t('auth.email')}</label>
              <div className="relative">
                <EnvelopeIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  dir="ltr" placeholder="example@domain.com"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-white/50 focus:ring-2 focus:ring-white/20"
                  style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-1.5">
              <label className="block text-sm font-medium text-white/80">{t('auth.password')}</label>
              <div className="relative">
                <LockClosedIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  dir="ltr" placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-white/50 focus:ring-2 focus:ring-white/20"
                  style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 ripple-container"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}
              >
                {loading ? t('auth.logging_in') : t('auth.login')}
              </button>
            </motion.div>
          </motion.form>

          {/* Demo accounts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            <p className="text-xs text-white/40 text-center mb-3 font-medium uppercase tracking-wide">
              {t('auth.demo_accounts')}
            </p>
            <div className="space-y-1.5">
              {demos.map(({ role, email: e, color }) => (
                <button key={e} type="button"
                  onClick={() => { setEmail(e); setPassword('password') }}
                  className="w-full text-sm px-3 py-2 rounded-xl border transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-semibold">{role}</span>
                    <span className="text-xs opacity-60" dir="ltr">{e}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login