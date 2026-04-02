import React, { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { buttonTap } from '../../animations/variants'
import LoadingSpinner from './LoadingSpinner'

const Button = ({
  children, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false,
  onClick, className = '', icon: Icon, ...props
}) => {
  const btnRef = useRef(null)

  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200/50',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200/50',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200/50',
    warning:   'bg-amber-500 hover:bg-amber-600 text-white',
    outline:   'border text-sm font-medium transition-colors',
    ghost:     'transition-colors',
  }

  // Outline + ghost use CSS vars for dark mode
  const outlineStyle = variant === 'outline'
    ? { borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }
    : variant === 'ghost'
      ? { color: 'var(--text-muted)', background: 'transparent' }
      : {}

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  }

  const createRipple = useCallback((e) => {
    if (disabled || loading) return
    const btn = btnRef.current
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const ripple = document.createElement('span')
    ripple.className = 'ripple-wave'
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }, [disabled, loading])

  return (
    <motion.button
      ref={btnRef} type={type}
      onClick={(e) => { createRipple(e); onClick?.(e) }}
      disabled={disabled || loading}
      whileTap={(!disabled && !loading) ? buttonTap : undefined}
      style={outlineStyle}
      className={`ripple-container ${variants[variant]} ${sizes[size]} inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading
        ? <LoadingSpinner size="sm" color={['outline','ghost'].includes(variant) ? 'blue' : 'white'} />
        : Icon && <Icon className="w-4 h-4 flex-shrink-0" />
      }
      <span>{children}</span>
    </motion.button>
  )
}

export default Button