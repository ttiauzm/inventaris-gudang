import {FC, useState} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import { InventoryItem } from '../core/_model'
import {useAuth} from '../../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../../utils/permissionHelper'

interface ItemDetailModalProps {
  item: InventoryItem
  onClose: () => void
  onEdit: (item: InventoryItem) => void
  onTakeItem: (quantity: number, description: string) => Promise<void>
}

const ItemDetailModal: FC<ItemDetailModalProps> = ({item, onClose, onEdit, onTakeItem}) => {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)
  const [takeQuantity, setTakeQuantity] = useState(0)
  const [takeDescription, setTakeDescription] = useState('')
  const [showTakeForm, setShowTakeForm] = useState(false)
  const [takeLoading, setTakeLoading] = useState(false)
  const [takeStatus, setTakeStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [takeErrorMsg, setTakeErrorMsg] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleTake = async () => {
    if (takeQuantity <= 0) {
      alert('Jumlah harus lebih dari 0')
      return
    }
    if (takeQuantity > item.quantity) {
      alert(`Jumlah tidak boleh lebih dari stok tersedia (${item.quantity})`)
      return
    }
    if (!takeDescription.trim()) {
      alert('Deskripsi pengambilan barang wajib diisi')
      return
    }

    setTakeLoading(true)
    setTakeStatus('idle')
    setTakeErrorMsg('')
    try {
      await onTakeItem(takeQuantity, takeDescription)
      setTakeStatus('success')
      // Tutup modal otomatis setelah 2 detik
      setTimeout(() => onClose(), 2000)
    } catch (error: any) {
      setTakeStatus('error')
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Gagal mengambil barang. Periksa koneksi dan coba lagi.'
      setTakeErrorMsg(msg)
    } finally {
      setTakeLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className='modal-backdrop fade show' 
        style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
        onClick={onClose}
      />

      {/* Modal */}
      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: showTakeForm ? '800px' : '650px'}}>
          <div className='modal-content' style={{borderRadius: '12px'}}>
            {/* Header */}
            <div className='modal-header border-0 pb-0'>
              <div>
                <h2 className='modal-title fw-bold mb-0'>{item.name}</h2>
                <p className='text-muted mb-0'>{item.supplier}</p>
              </div>
              <button
                type='button'
                className='btn-close'
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className='modal-body pt-3' style={{padding: '20px 30px'}}>
              {!showTakeForm ? (
                /* Detail View */
                <>
                  {/* Large Image */}
                  <div className='mb-4'>
                    <img
                      src={item.image || '/media/svg/material/material-dummy.svg'}
                      alt={item.name}
                      className='w-100 rounded'
                      style={{
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  </div>

                  {/* Edit Barang Button - Only for SuperAdmin */}
                  {isSuperAdmin && (
                    <div className='mb-4'>
                      <button
                        className='btn btn-lg w-100'
                        style={{
                          backgroundColor: '#5C8AE6',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '14px'
                        }}
                        onClick={() => onEdit(item)}
                      >
                        Edit Barang
                      </button>
                    </div>
                  )}

                  {/* Ambil Barang Section Header */}
                  <h3 className='fw-bold mb-4'>Ambil barang</h3>

                  {/* Take Form Trigger Button */}
                  <button
                    className='btn btn-outline-primary btn-lg w-100'
                    style={{borderRadius: '8px'}}
                    onClick={() => setShowTakeForm(true)}
                  >
                    Masukkan jumlah untuk mengambil barang
                  </button>
                </>
              ) : (
                /* Take Form View */
                <>
                  {/* Image (smaller) */}
                  <div className='mb-4'>
                    <img
                      src={item.image || '/media/svg/material/material-dummy.svg'}
                      alt={item.name}
                      className='w-100 rounded'
                      style={{
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  </div>

                  {/* Edit Barang Button - Only for SuperAdmin */}
                  {isSuperAdmin && (
                    <div className='mb-4'>
                      <button
                        className='btn btn-lg w-100'
                        style={{
                          backgroundColor: '#5C8AE6',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '14px'
                        }}
                        onClick={() => onEdit(item)}
                      >
                        Edit Barang
                      </button>
                    </div>
                  )}

                  {/* Ambil Barang Form */}
                  <h3 className='fw-bold mb-4'>Ambil barang</h3>

                  {/* Quantity Input */}
                  <div className='mb-4'>
                    <label className='form-label fw-semibold mb-3'>
                      Masukkan jumlah:
                    </label>
                    <input
                      type='number'
                      className='form-control form-control-lg text-center'
                      value={takeQuantity}
                      onChange={(e) => setTakeQuantity(parseInt(e.target.value) || 0)}
                      min={0}
                      max={item.quantity}
                      style={{fontSize: '1.5rem', padding: '20px'}}
                    />
                    <small className='text-muted'>
                      Stok tersedia: {item.quantity} {item.unit}
                    </small>
                  </div>

                  {/* Description Input */}
                  <div className='mb-4'>
                    <label className='form-label fw-semibold mb-3'>
                      Masukkan deskripsi: <span className='text-danger'>*</span>
                    </label>
                    <textarea
                      className='form-control form-control-lg'
                      rows={4}
                      placeholder='Masukkan deskripsi pengambilan barang...'
                      value={takeDescription}
                      onChange={(e) => setTakeDescription(e.target.value)}
                      style={{resize: 'none'}}
                    />
                  </div>

                  {/* Status Banner */}
                  {takeStatus === 'success' && (
                    <div className='alert alert-success d-flex align-items-center mb-4 p-4' style={{borderRadius: '10px'}}>
                      <KTIcon iconName='check-circle' className='fs-2 text-success me-3' />
                      <div>
                        <div className='fw-bold'>Berhasil!</div>
                        <div className='fs-7'>Berhasil mengambil {takeQuantity} {item.unit} <strong>{item.name}</strong>. Modal akan ditutup otomatis...</div>
                      </div>
                    </div>
                  )}
                  {takeStatus === 'error' && (
                    <div className='alert alert-danger d-flex align-items-center mb-4 p-4' style={{borderRadius: '10px'}}>
                      <KTIcon iconName='cross-circle' className='fs-2 text-danger me-3' />
                      <div>
                        <div className='fw-bold'>Gagal mengambil barang</div>
                        <div className='fs-7'>{takeErrorMsg}</div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='d-flex gap-3'>
                    <button
                      type='button'
                      className='btn btn-lg btn-light flex-fill'
                      style={{borderRadius: '8px', padding: '14px'}}
                      onClick={() => setShowTakeForm(false)}
                      disabled={takeLoading || takeStatus === 'success'}
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      className='btn btn-lg flex-fill'
                      style={{
                        backgroundColor: takeStatus === 'success' ? '#28a745' : '#5C8AE6',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '14px'
                      }}
                      onClick={handleTake}
                      disabled={takeLoading || takeStatus === 'success'}
                    >
                      {takeLoading ? (
                        <><span className='spinner-border spinner-border-sm me-2' />Memproses...</>
                      ) : takeStatus === 'success' ? (
                        'Berhasil ✓'
                      ) : (
                        'Oke'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export {ItemDetailModal}