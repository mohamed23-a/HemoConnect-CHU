import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../../animations/variants'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
