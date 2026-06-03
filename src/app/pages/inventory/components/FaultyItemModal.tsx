import React, {FC, useState} from 'react'
import {useAuth} from '../../../modules/auth'
import API from '../../../../api'
import {SuccessModal} from '../../../components/SuccessModal'

export interface FaultyItemModalProps {
  item: {
    id: string
    name: string
    quantity?: number
    unit?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export const FaultyItemModal: FC<FaultyItemModalProps> = ({item, onClose, onSuccess}) => {
  const {currentUser} = useAuth()
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        if (errors.photo) setErrors(p => ({...p, photo: ''}))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    const qty = parseInt(quantity, 10)
    
    if (!quantity.trim() || isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Jumlah wajib diisi dan harus lebih dari 0'
    } else if (qty > (item.quantity || 0)) {
      newErrors.quantity = `Jumlah tidak boleh melebihi stok (${item.quantity})`
    }
    
    if (!description.trim()) {
      newErrors.description = 'Deskripsi kerusakan wajib diisi'
    }

    if (!photoPreview) {
      newErrors.photo = 'Bukti foto kerusakan wajib disertakan'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      // 1. Post to backend to deduct stock and log transaction
      await API.post(`/items/${item.id}/faulty`, {
        faulty_quantity: qty,
        description: description
      })
      
      // 2. Save evidence locally via localStorage to fulfill frontend requirement without altering DB schema
      const datetime = new Date().toISOString()
      const newFaultyReport = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        quantity: qty,
        description,
        photoBase64: photoPreview,
        reported_by: currentUser?.fullname || currentUser?.username || 'Unknown',
        reported_at: datetime
      }

      const existingReports = JSON.parse(localStorage.getItem('sim_faulty_reports') || '[]')
      existingReports.unshift(newFaultyReport)
      localStorage.setItem('sim_faulty_reports', JSON.stringify(existingReports))

      setShowSuccess(true)
    } catch (err: any) {
      console.error('Gagal lapor barang rusak:', err)
      
      // check backend error msg
      const errMsg = err?.response?.data?.message || 'Gagal memproses laporan. Coba lagi.'
      setErrors({ api: errMsg })
    } finally {
      setSaving(false)
    }
  }

  if (showSuccess) {
    return (
      <SuccessModal
        message={`Berhasil melaporkan ${quantity} ${item.unit || ''} ${item.name} sebagai barang rusak.`}
        onClose={onSuccess}
      />
    )
  }

  const inputRowStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '130px 1fr',
    border: '1px solid #e0dbd5', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px',
  }
  const labelCellStyle: React.CSSProperties = {
    backgroundColor: '#897870', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 14px', fontSize: '13px', fontWeight: 600, textAlign: 'center',
  }
  const inputCellStyle: React.CSSProperties = {
    border: 'none', outline: 'none', padding: '12px 14px',
    fontSize: '13px', color: '#3a3a3a', backgroundColor: '#fff', width: '100%', fontFamily: 'inherit',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 1040 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050, backgroundColor: '#fff', borderRadius: '20px', width: '92%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.20)', padding: '28px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#dc3545', margin: 0 }}>Lapor Barang Rusak</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{item.name} (Stok: {item.quantity})</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0a89f', fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        {errors.api && (
          <div style={{ backgroundColor: '#fff5f5', border: '1px solid #f5c6cb', color: '#dc3545', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
            {errors.api}
          </div>
        )}

        <div style={inputRowStyle}>
          <div style={labelCellStyle}>Jumlah</div>
          <input
            type='number' min={1} max={item.quantity || 0}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); if (errors.quantity) setErrors(p => ({...p, quantity: ''})) }}
            style={{...inputCellStyle, borderBottom: errors.quantity ? '2px solid #dc3545' : 'none'}}
            placeholder='0'
          />
        </div>
        {errors.quantity && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>{errors.quantity}</p>}

        <div style={{...inputRowStyle, alignItems: 'stretch'}}>
          <div style={{...labelCellStyle, lineHeight: 1.4}}>Deskripsi</div>
          <textarea
            rows={2} value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({...p, description: ''})) }}
            style={{...inputCellStyle, resize: 'vertical', borderLeft: errors.description ? '2px solid #dc3545' : 'none'}}
            placeholder='Penjelasan kerusakan...'
          />
        </div>
        {errors.description && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>{errors.description}</p>}

        {/* Upload Bukti Foto */}
        <div style={{...inputRowStyle, alignItems: 'stretch', marginBottom: errors.photo ? '10px' : '20px'}}>
          <div style={{...labelCellStyle, lineHeight: 1.4}}>Bukti Foto</div>
          <div style={{ backgroundColor: '#fff', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type='file' 
              accept='image/*;capture=camera' 
              onChange={handlePhotoChange} 
              style={{ fontSize: '12px' }}
            />
            {photoPreview && (
              <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ece8e4' }}>
                <img src={photoPreview} alt='Preview' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
        {errors.photo && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '20px', paddingLeft: '4px' }}>{errors.photo}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e0dbd5', backgroundColor: '#fff', color: '#6c6c6c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} className='btn btn-danger' style={{ flex: 2, padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <span className='spinner-border spinner-border-sm' /> : 'Kirim Laporan'}
          </button>
        </div>
      </div>
    </>
  )
}
