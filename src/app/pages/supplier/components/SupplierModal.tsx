import {FC, useState, useEffect} from 'react'
import {Supplier} from '../core/_model'
import {createSupplier, updateSupplier} from '../core/_requests'
import {KTIcon} from '../../../../_metronic/helpers'

interface SupplierModalProps {
  supplier: Supplier | null
  onClose: () => void
  onSave: () => void
}

const SupplierModal: FC<SupplierModalProps> = ({supplier, onClose, onSave}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        company: supplier.company || '',
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || '',
        postal_code: supplier.postal_code || '',
        notes: supplier.notes || '',
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

  return (
    <>
      <div className='modal-backdrop fade show' onClick={onClose}></div>

      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                {supplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </h5>
              <button type='button' className='btn-close' onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='row g-5'>
                  <div className='col-md-6'>
                    <label className='form-label required'>Nama Supplier</label>
                    <input
                      type='text'
                      className='form-control'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className='col-md-6'>
                    <label className='form-label'>Nama Perusahaan</label>
                    <input
                      type='text'
                      className='form-control'
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  </div>

                  <div className='col-md-6'>
                    <label className='form-label'>Contact Person</label>
                    <input
                      type='text'
                      className='form-control'
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    />
                  </div>

                  <div className='col-md-6'>
                    <label className='form-label'>Telepon</label>
                    <input
                      type='tel'
                      className='form-control'
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className='col-12'>
                    <label className='form-label'>Email</label>
                    <input
                      type='email'
                      className='form-control'
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className='col-12'>
                    <label className='form-label'>Alamat</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className='col-md-6'>
                    <label className='form-label'>Kota</label>
                    <input
                      type='text'
                      className='form-control'
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>

                  <div className='col-md-6'>
                    <label className='form-label'>Kode Pos</label>
                    <input
                      type='text'
                      className='form-control'
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    />
                  </div>

                  <div className='col-12'>
                    <label className='form-label'>Catatan</label>
                    <textarea
                      className='form-control'
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-light'
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </button>
                <button type='submit' className='btn btn-primary' disabled={loading}>
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2'></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <KTIcon iconName='check' className='fs-3' />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export {SupplierModal}