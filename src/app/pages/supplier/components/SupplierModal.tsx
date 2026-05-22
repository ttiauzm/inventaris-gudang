import {FC, useState, useEffect} from 'react'
import {Supplier} from '../core/_model'
import {createSupplier, updateSupplier, deleteSupplier} from '../core/_requests'
import {KTIcon} from '../../../../_metronic/helpers'
import {useAuth} from '../../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../../utils/permissionHelper'
import {ConfirmModal} from '../../../components/ConfirmModal'
import {SuccessModal} from '../../../components/SuccessModal'

interface SupplierModalProps {
  supplier: Supplier | null
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}

const SupplierModal: FC<SupplierModalProps> = ({supplier, onClose, onSave, onDelete}) => {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        province: supplier.province || '',
        postal_code: supplier.postal_code || '',
        country: supplier.country || '',
      })
    }
  }, [supplier])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}))
    if (errors[field]) setErrors(prev => ({...prev, [field]: ''}))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama supplier wajib diisi'
    }

    // Contact info: wajib diisi, harus nomor telepon atau email yang valid
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact info wajib diisi'
    } else {
      const isPhone = /^[+]?[\d\s\-(). ]{7,20}$/.test(formData.phone.trim())
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.phone.trim())
      if (!isPhone && !isEmail) {
        newErrors.phone = 'Masukkan nomor telepon atau alamat email yang valid'
      }
    }

    if (!formData.address.trim()) newErrors.address = 'Jalan wajib diisi'
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi'
    if (!formData.province.trim()) newErrors.province = 'Provinsi wajib diisi'
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Kode Pos wajib diisi'
    if (!formData.country.trim()) newErrors.country = 'Negara wajib diisi'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    try {
      setLoading(true)

      if (supplier) {
        await updateSupplier(supplier.id, formData)
        setSuccessMessage('Supplier berhasil diperbarui')
      } else {
        await createSupplier(formData)
        setSuccessMessage('Supplier berhasil ditambahkan')
      }
      setShowSuccess(true)
    } catch (error: any) {
      console.error('Error saving supplier:', error)
      const serverMsg: string = error?.response?.data?.message || error?.message || ''

      const backendErrors = error?.response?.data?.errors || {}
      if (Object.keys(backendErrors).length > 0) {
        const parsedErrors: Record<string, string> = {}
        for (const [fieldName, fieldErrors] of Object.entries(backendErrors)) {
          if (Array.isArray(fieldErrors)) {
            parsedErrors[fieldName] = (fieldErrors as string[])[0]
          } else if (typeof fieldErrors === 'string') {
            parsedErrors[fieldName] = fieldErrors
          }
        }
        if (parsedErrors['supplier_name']) {
          parsedErrors['name'] = parsedErrors['supplier_name']
          delete parsedErrors['supplier_name']
        }
        if (parsedErrors['contact_info']) {
          parsedErrors['phone'] = parsedErrors['contact_info']
          delete parsedErrors['contact_info']
        }
        setErrors(parsedErrors)
      } else {
        setErrors({general: serverMsg || 'Gagal menyimpan data supplier. Periksa koneksi dan coba lagi.'})
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setErrors({name: 'Silakan centang konfirmasi penghapusan supplier terlebih dahulu'})
      return
    }
    setErrors({})
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAction = async () => {
    setShowDeleteConfirm(false)
    try {
      setLoading(true)
      if (supplier) {
        await deleteSupplier(supplier.id)
        setSuccessMessage('Supplier berhasil dihapus')
        setShowSuccess(true)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Gagal menghapus supplier')
    } finally {
      setLoading(false)
    }
  }

  const requiredMark = <span className='text-danger ms-1'>*</span>

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmModal
          message='Apakah Anda yakin ingin menghapus supplier ini? Data yang dihapus tidak dapat dikembalikan.'
          confirmText='Hapus'
          cancelText='Batal'
          confirmClass='btn-danger'
          onConfirm={confirmDeleteAction}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showSuccess && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccess(false)
            if (successMessage.includes('dihapus')) {
              onDelete?.()
              onClose()
            } else {
              onSave()
            }
          }}
        />
      )}
      <div className='modal-backdrop fade show' onClick={onClose}></div>

      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: '650px'}}>
          <div className='modal-content' style={{borderRadius: '12px'}}>
            <div className='modal-header border-0'>
              <h3 className='modal-title fw-bold'>
                {supplier ? 'Edit Supplier' : 'Tambah Supplier'}
              </h3>
              <button type='button' className='btn-close' onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='modal-body' style={{padding: '20px 30px'}}>
                {errors.general && (
                  <div className='alert alert-danger' role='alert'>
                    {errors.general}
                  </div>
                )}

                <div className='row g-4'>
                  {/* Nama */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Nama{requiredMark}</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                      placeholder='Jason Tatum'
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                    {errors.name && (
                      <div className='invalid-feedback fw-semibold'>{errors.name}</div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>
                      Contact Info{requiredMark}
                      <span className='text-muted fw-normal ms-2 fs-7'>(Nomor Telepon atau Email)</span>
                    </label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder='08123456789 atau supplier@example.com'
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <div className='invalid-feedback fw-semibold'>{errors.phone}</div>
                    )}
                  </div>

                  {/* Jalan */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Jalan{requiredMark}</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.address ? 'is-invalid' : ''}`}
                      placeholder='Jl. in aja dulu'
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                    {errors.address && (
                      <div className='invalid-feedback fw-semibold'>{errors.address}</div>
                    )}
                  </div>

                  {/* Kota */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Kota{requiredMark}</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.city ? 'is-invalid' : ''}`}
                      placeholder='Yogyakarta'
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                    />
                    {errors.city && (
                      <div className='invalid-feedback fw-semibold'>{errors.city}</div>
                    )}
                  </div>

                  {/* Provinsi */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Provinsi{requiredMark}</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.province ? 'is-invalid' : ''}`}
                      placeholder='DI Yogyakarta'
                      value={formData.province}
                      onChange={(e) => handleChange('province', e.target.value)}
                    />
                    {errors.province && (
                      <div className='invalid-feedback fw-semibold'>{errors.province}</div>
                    )}
                  </div>

                  {/* Kode Pos */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Kode Pos{requiredMark}</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.postal_code ? 'is-invalid' : ''}`}
                      placeholder='55555'
                      value={formData.postal_code}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                    />
                    {errors.postal_code && (
                      <div className='invalid-feedback fw-semibold'>{errors.postal_code}</div>
                    )}
                  </div>

                  {/* Negara */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Negara{requiredMark}</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.country ? 'is-invalid' : ''}`}
                      placeholder='Indonesia'
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                    />
                    {errors.country && (
                      <div className='invalid-feedback fw-semibold'>{errors.country}</div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className='text-end mt-6'>
                  <button
                    type='submit'
                    className='btn btn-lg px-8 btn-inventory-blue'
                    disabled={loading}
                  >
                    {loading ? (
                      <span className='spinner-border spinner-border-sm' />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Delete Section - dinonaktifkan sementara */}
            {false && supplier && isSuperAdmin && (
              <div style={{
                borderTop: '1px solid #e0e0e0',
                padding: '30px',
                backgroundColor: '#f9f9f9',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
              }}>
                <h3 className='fw-bold mb-4'>Hapus Supplier</h3>
                <p className='text-muted mb-4'>
                  We regret to see you leave. Confirm account deletion below. Your data will be permanently removed.
                  Thank you for being part of our community. Please check our{' '}
                  <a href='#' style={{color: '#5C8AE6'}}>Setup Guidelines</a> if you still wish continue.
                </p>

                <div className='form-check mb-6'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id='confirmDeleteSupplier'
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                  />
                  <label className='form-check-label' htmlFor='confirmDeleteSupplier'>
                    Konfirmasi penghapusan Supplier
                  </label>
                </div>

                <div className='d-flex gap-3'>
                  <button type='button' className='btn btn-light' onClick={onClose}>
                    Deactivate instead
                  </button>
                  <button
                    type='button'
                    className='btn btn-danger'
                    onClick={handleDelete}
                    disabled={!confirmDelete || loading}
                  >
                    {loading ? (
                      <span className='spinner-border spinner-border-sm' />
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export {SupplierModal}
