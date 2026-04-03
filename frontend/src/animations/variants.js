// ─── Shared Framer Motion Variants ──────────────────────────────────────────

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

// Stagger container — animates children one after another
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

// Item for staggered lists
export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// Card hover
export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

// Button press
export const buttonTap = { scale: 0.96 }

// Page transition — used in AnimatePresence
export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

// Dropdown
export const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.15 },
  },
}

// Notification badge pulse
export const pulseBadge = {
  animate: {
    scale: [1, 1.2, 1],
    transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
  },
}
