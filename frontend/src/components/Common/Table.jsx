import React from 'react'
import { motion } from 'framer-motion'
import { TableRowSkeleton } from './SkeletonLoader'
import { staggerContainer, staggerItem } from '../../animations/variants'
import { InboxIcon } from '@heroicons/react/24/outline'

const Table = ({ columns, data, onRowClick, loading = false, skeletonRows = 5 }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 text-center"
      >
        <InboxIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">لا توجد بيانات لعرضها</p>
      </motion.div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-slate-50 bg-white"
        >
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              variants={staggerItem}
              onClick={() => onRowClick?.(row)}
              whileHover={onRowClick ? { backgroundColor: '#f8fafc' } : undefined}
              className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  )
}

export default Table