import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-14 h-14 border-4',
    xl: 'w-20 h-20 border-4',
  }

  const colors = {
    blue:   'border-blue-500',
    green:  'border-emerald-500',
    red:    'border-red-500',
    yellow: 'border-amber-400',
    white:  'border-white',
    purple: 'border-purple-500',
  }

  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
      />
    </div>
  )
}

// Full-page loader
export const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-4">
    <motion.div
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
    />
    <motion.p
      className="text-slate-500 text-sm font-medium"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      جارٍ التحميل...
    </motion.p>
  </div>
)

export default LoadingSpinner