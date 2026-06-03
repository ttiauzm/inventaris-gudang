import React, {FC} from 'react'
import {KTIcon} from '../../../_metronic/helpers'

export interface FaultyReport {
  id: string
  item_id: string
  item_name: string
  quantity: number
  unit?: string
  description: string
  photoBase64?: string
  reported_by: string
  reported_at: string
}

interface Props {
  report: FaultyReport
}

export const FaultyItemCard: FC<Props> = ({report}) => {
  const dateObj = new Date(report.reported_at)
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
  const formattedTime = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className='card mb-5 shadow-sm' style={{ borderRadius: '14px', border: '1px solid #f0ebe6', overflow: 'hidden' }}>
      <div className='card-body p-0' style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Header / Info */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#3a3a3a' }}>{report.item_name}</h4>
              <span style={{ fontSize: '13px', color: '#888' }}>ID: {report.item_id.substring(0, 8)}...</span>
            </div>
            <div style={{ backgroundColor: '#fff5f5', color: '#dc3545', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
              {report.quantity} {report.unit || 'pcs'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>Deskripsi Kerusakan:</div>
            <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
              {report.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888' }}>
              <KTIcon iconName='profile-circle' className='fs-6' />
              <span>{report.reported_by}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888' }}>
              <KTIcon iconName='calendar-8' className='fs-6' />
              <span>{formattedDate} • {formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Photo View */}
        {report.photoBase64 ? (
          <div style={{ width: '100%', height: '180px', backgroundColor: '#f9f9f9', borderTop: '1px solid #f0ebe6' }}>
            <img 
              src={report.photoBase64} 
              alt='Bukti Kerusakan' 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '80px', backgroundColor: '#f9f9f9', borderTop: '1px solid #f0ebe6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '13px' }}>
            <KTIcon iconName='picture' className='fs-2 me-2' /> Tidak ada foto
          </div>
        )}

      </div>
    </div>
  )
}
