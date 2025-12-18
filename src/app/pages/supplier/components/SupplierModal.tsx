import {FC, useState, useEffect} from 'react'
import {Supplier} from '../core/_model'
import {createSupplier, updateSupplier, deleteSupplier} from '../core/_requests'
import {KTIcon} from '../../../../_metronic/helpers'
import {useAuth} from '../../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../../utils/permissionHelper'

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
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
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
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        province: supplier.province || '',
        postal_code: supplier.postal_code || '',
        country: supplier.country || '',
      })
    }
  }, [supplier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (supplier) {
        await updateSupplier(supplier.id, formData)
      } else {
        await createSupplier(formData)
      }
      
      onSave()
    } catch (error) {
      console.error('Error saving supplier:', error)
      alert('Gagal menyimpan data supplier')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      alert('Silakan centang konfirmasi penghapusan supplier')
      return
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        setLoading(true)
        if (supplier) {
          await deleteSupplier(supplier.id)
          onDelete?.()
          onClose()
        }
      } catch (error) {
        console.error('Error deleting supplier:', error)
        alert('Gagal menghapus supplier')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <div className='modal-backdrop fade show' onClick={onClose}></div>

      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: '650px'}}>
          <div className='modal-content' style={{borderRadius: '12px'}}>
            {/* Edit Supplier Section */}
            <div className='modal-header border-0'>
              <h3 className='modal-title fw-bold'>
                {supplier ? 'Edit Supplier' : 'Tambah Supplier'}
              </h3>
              <button type='button' className='btn-close' onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='modal-body' style={{padding: '20px 30px'}}>
                <div className='row g-4'>
                  {/* Nama */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Nama</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='Jason Tatum'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  {/* Contact Info */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Contact Info</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='0812389016'
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  {/* Jalan */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Jalan</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='Jl. in aja dulu'
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  {/* Kota */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Kota</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='jogja'
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>

                  {/* Provinsi */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Provinsi</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='Jogja'
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                    />
                  </div>

                  {/* Kode Pos */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Kode Pos</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='55555'
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    />
                  </div>

                  {/* Negara */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Negara</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='Indonesia'
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className='text-end mt-6'>
                  <button
                    type='submit'
                    className='btn btn-lg px-8'
                    style={{
                      backgroundColor: '#5C8AE6',
                      color: 'white',
                      borderRadius: '8px'
                    }}
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

            {/* Delete Section - Only show when editing and user is SuperAdmin */}
            {supplier && isSuperAdmin && (
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
                  <button
                    type='button'
                    className='btn btn-light'
                    onClick={onClose}
                  >
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