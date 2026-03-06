import React from 'react'

interface EmptyState404Props {
  title?: string
  subtitle?: string
}

const EmptyState404: React.FC<EmptyState404Props> = ({
  title = 'Data tidak ditemukan',
  subtitle = 'Pastikan kata kunci pencarian Anda benar.',
}) => {
  return (
    <div className='d-flex flex-column align-items-center justify-content-center py-10'>
      <img
        src='/media/svg/splash-screens/error-404.svg'
        alt='Tidak ditemukan'
        style={{ width: '180px', marginBottom: '20px' }}
      />
      <h4 className='fw-bold text-gray-700 mb-2'>{title}</h4>
      <p className='text-muted mb-0'>{subtitle}</p>
    </div>
  )
}

export default EmptyState404
