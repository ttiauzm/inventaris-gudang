import React, {FC, useRef, useState} from 'react'
import API from '../../../../api'
import {SuccessModal} from '../../../components/SuccessModal'
import {KTIcon} from '../../../../_metronic/helpers'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [quantity, setQuantity]       = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile]     = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [saving, setSaving]           = useState(false)
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [lightbox, setLightbox]       = useState(false)

  // ── Photo handler ─────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
    const ALLOWED_EXT   = ['jpg', 'jpeg', 'png']
    const fileExt       = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(fileExt)) {
      setErrors((p) => ({...p, photo: 'Format tidak didukung. Gunakan: JPG, JPEG, PNG'}))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({...p, photo: `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB`}))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      if (errors.photo) setErrors((p) => ({...p, photo: ''}))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    const qty = parseInt(quantity, 10)

    if (!quantity.trim() || isNaN(qty) || qty <= 0)
      newErrors.quantity = 'Jumlah wajib diisi dan harus lebih dari 0'
    else if (qty > (item.quantity || 0))
      newErrors.quantity = `Jumlah tidak boleh melebihi stok (${item.quantity})`

    if (!description.trim())
      newErrors.description = 'Deskripsi kerusakan wajib diisi'

    if (!photoFile)
      newErrors.photo = 'Bukti foto kerusakan wajib disertakan'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('faulty_quantity', String(qty))
      formData.append('description', description)
      if (photoFile) formData.append('image', photoFile)

      await API.post(`/items/${item.id}/faulty`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      })

      setShowSuccess(true)
    } catch (err: any) {
      console.error('Gagal lapor barang rusak:', err)
      setErrors({api: err?.response?.data?.message || 'Gagal memproses laporan. Coba lagi.'})
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

  // ── Shared styles ─────────────────────────────────────────────────────────
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
      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightbox && photoPreview && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1060,
            backgroundColor: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={photoPreview}
            alt='Preview fullsize'
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '88vh',
              borderRadius: '10px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', fontSize: '22px', width: '36px', height: '36px',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 1040,
        }}
      />

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1050,
        backgroundColor: '#fff', borderRadius: '20px',
        width: '92%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.20)', padding: '28px',
      }}>

        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <div>
            <h3 style={{fontSize: '17px', fontWeight: 700, color: '#dc3545', margin: 0}}>Lapor Barang Rusak</h3>
            <p style={{margin: '4px 0 0', fontSize: '12px', color: '#888'}}>
              {item.name}{' '}
              <span style={{color: '#bbb'}}>— Stok: {item.quantity} {item.unit}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{background: 'none', border: 'none', cursor: 'pointer', color: '#b0a89f', fontSize: '20px', lineHeight: 1, padding: '4px'}}
          >×</button>
        </div>

        {/* API error */}
        {errors.api && (
          <div style={{backgroundColor: '#fff5f5', border: '1px solid #f5c6cb', color: '#dc3545', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <KTIcon iconName='cross-circle' className='fs-5' />
            {errors.api}
          </div>
        )}

        {/* Jumlah */}
        <div style={inputRowStyle}>
          <div style={labelCellStyle}>Jumlah</div>
          <input
            type='number' min={1} max={item.quantity || 0}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); if (errors.quantity) setErrors((p) => ({...p, quantity: ''})) }}
            style={{...inputCellStyle, borderBottom: errors.quantity ? '2px solid #dc3545' : 'none'}}
            placeholder='0'
          />
        </div>
        {errors.quantity && (
          <p style={{color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px'}}>
            {errors.quantity}
          </p>
        )}

        {/* Deskripsi */}
        <div style={{...inputRowStyle, alignItems: 'stretch'}}>
          <div style={{...labelCellStyle, lineHeight: 1.4}}>Deskripsi</div>
          <textarea
            rows={3} value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors((p) => ({...p, description: ''})) }}
            style={{...inputCellStyle, resize: 'vertical', borderLeft: errors.description ? '2px solid #dc3545' : 'none'}}
            placeholder='Jelaskan kerusakan yang terjadi...'
          />
        </div>
        {errors.description && (
          <p style={{color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px'}}>
            {errors.description}
          </p>
        )}

        {/* Bukti Foto */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png'
          className='d-none'
          onChange={handlePhotoChange}
        />

        <div style={{...inputRowStyle, alignItems: 'stretch', marginBottom: errors.photo ? '4px' : '20px'}}>
          <div style={{...labelCellStyle, lineHeight: 1.4}}>Bukti Foto</div>
          <div style={{backgroundColor: '#fff', padding: '12px', flex: 1}}>
            {photoPreview ? (
              <div style={{position: 'relative'}}>
                <div style={{width: '100%', height: '130px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ece8e4'}}>
                  <img
                    src={photoPreview}
                    alt='Preview'
                    onClick={() => setLightbox(true)}
                    style={{width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in'}}
                  />
                </div>
                <button
                  type='button'
                  onClick={removePhoto}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    border: 'none', backgroundColor: 'rgba(0,0,0,0.55)',
                    color: '#fff', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', lineHeight: 1,
                  }}
                >×</button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${errors.photo ? '#dc3545' : '#C8B8AE'}`,
                  borderRadius: '8px', padding: '20px', textAlign: 'center',
                  cursor: 'pointer', backgroundColor: errors.photo ? '#fff5f5' : '#faf6f2',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#897870')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = errors.photo ? '#dc3545' : '#C8B8AE')}
              >
                <KTIcon iconName='picture' className='fs-2x text-muted' />
                <p style={{margin: '6px 0 2px', fontSize: '12px', color: '#9e9992'}}>Klik untuk upload foto bukti</p>
                <p style={{margin: 0, fontSize: '11px', color: '#b0a89f'}}>JPG, JPEG, PNG &bull; Maks. 5 MB</p>
              </div>
            )}
          </div>
        </div>
        {errors.photo && (
          <p style={{color: '#dc3545', fontSize: '12px', marginBottom: '20px', paddingLeft: '4px'}}>
            {errors.photo}
          </p>
        )}

        {/* Actions */}
        <div style={{display: 'flex', gap: '10px'}}>
          <button
            onClick={onClose}
            style={{flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e0dbd5', backgroundColor: '#fff', color: '#6c6c6c', fontSize: '13px', fontWeight: 600, cursor: 'pointer'}}
          >Batal</button>
          <button
            onClick={handleSave} disabled={saving}
            className='btn btn-danger'
            style={{flex: 2, padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving ? 0.7 : 1}}
          >
            {saving
              ? <><span className='spinner-border spinner-border-sm' /> Mengirim...</>
              : <><KTIcon iconName='send' className='fs-5' /> Kirim Laporan</>
            }
          </button>
        </div>
      </div>
    </>
  )
}