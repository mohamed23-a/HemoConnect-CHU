import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  const pages = []
  const maxVisible = 5
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(lastPage, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
      
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(lastPage)}
            className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {lastPage}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Pagination