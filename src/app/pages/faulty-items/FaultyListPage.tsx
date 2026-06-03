import React, {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import {FaultyItemCard, FaultyReport} from './FaultyItemCard'
import {useAuth} from '../../modules/auth'

export const FaultyListPage: FC = () => {
  const [reports, setReports] = useState<FaultyReport[]>([])
  const {currentUser} = useAuth()

  useEffect(() => {
    // Load reports from LocalStorage indicating frontend-only proof matching requirement
    const data = localStorage.getItem('sim_faulty_reports')
    if (data) {
      try {
        setReports(JSON.parse(data))
      } catch (e) {
        console.error('Failed to parse faulty reports', e)
      }
    }
  }, [])

  return (
    <div className='card' style={{ borderRadius: '16px', border: 'none', boxShadow: '0 0 40px rgba(0,0,0,0.04)' }}>
      <div className='card-header border-0 pt-6'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>Laporan Barang Rusak</span>
          <span className='text-muted mt-1 fw-semibold fs-7'>Daftar barang yang dilaporkan rusak beserta buktinya.</span>
        </h3>
      </div>
      
      <div className='card-body py-3'>
        {reports.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
            <KTIcon iconName='information-5' className='fs-1 text-muted mb-3' style={{ display: 'block' }} />
            Belum ada laporan barang rusak.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {reports.map((report) => (
              <FaultyItemCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
