import {FC, useState, useEffect} from 'react'
import { InventoryItem } from '../core/_model'
import {createInventory, updateInventory, deleteInventory} from '../core/_requests'
import {KTIcon} from '../../../../_metronic/helpers'
import { MaterialModal } from './MaterialModal'
import { CategoryModal } from './CategoryModal'
import {useAuth} from '../../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../../utils/permissionHelper'

interface InventoryModalProps {
  item: InventoryItem | null
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}

const InventoryModal: FC<InventoryModalProps> = ({item, onClose, onSave, onDelete}) => {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)
  const [loading, setLoading] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDeleteSection, setShowDeleteSection] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    material: '',
    supplier: '',
    quantity: 0,
    unit: 'pcs',
    price: 0,
    description: ''
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category || '',
        material: item.description || '',
        supplier: item.supplier,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price || 0,
        description: item.description || ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    const {validateInventoryForm, showValidationErrors} = await import('../../../utils/validationHelper')

    // Validasi form
    const validationErrors = validateInventoryForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showValidationErrors(validationErrors)
      return
    }

    // Ini aslinya di try-catch biar bisa nampung error dari server
    try {
      setLoading(true)
      
      if (item) {
        await updateInventory(item.id, formData)
      } else {
        await createInventory(formData)
      }
      
      onSave()
    } catch (error) {
      console.error('Error saving inventory:', error)
      alert('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleMaterialSave = (material: {name: string, description: string}) => {
    setFormData({...formData, material: material.name})
    setShowMaterialModal(false)
  }

  const handleCategorySave = (category: {name: string, description: string}) => {
    setFormData({...formData, category: category.name})
    setShowCategoryModal(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      alert('Silakan centang konfirmasi penghapusan barang')
      return
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        setLoading(true)
        if (item) {
          await deleteInventory(item.id)
          onDelete?.()
          onClose()
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Gagal menghapus barang')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <div className='modal-backdrop fade show' onClick={onClose} />

      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: '650px'}}>
          <div className='modal-content' style={{borderRadius: '12px'}}>
            {/* Edit Barang Section */}
            <div className='modal-header border-0'>
              <h3 className='modal-title fw-bold'>
                {item ? 'Edit Barang' : 'Tambah Barang'}
              </h3>
              <button type='button' className='btn-close' onClick={onClose} />
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
                      placeholder='Kain Sutra Emas'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  {!item && (
                    <>
                      {/* Kategori - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Kategori</label>
                        <input
                          type='text'
                          className='form-control form-control-lg'
                          placeholder='Kain/Pernak-pernik/Lain-lain...'
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          required
                        />
                      </div>

                      {/* Material - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Material</label>
                        <input
                          type='text'
                          className='form-control form-control-lg'
                          placeholder='Jl. in aja dulu'
                          value={formData.material}
                          onChange={(e) => setFormData({...formData, material: e.target.value})}
                        />
                      </div>

                      {/* Supplier - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Supplier</label>
                        <input
                          type='text'
                          className='form-control form-control-lg'
                          placeholder='jogja'
                          value={formData.supplier}
                          onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                          required
                        />
                      </div>

                      {/* Jumlah - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Jumlah</label>
                        <input
                          type='text'
                          className='form-control form-control-lg'
                          placeholder='Jogja'
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Unit - Show for both Add and Edit */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Unit</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='per cm/item/'
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      required
                    />
                  </div>

                  {/* Harga - Show for both Add and Edit */}
                  <div className='col-12'>
                    <label className='form-label fw-semibold'>Harga</label>
                    <input
                      type='text'
                      className='form-control form-control-lg'
                      placeholder='Jl. in aja dulu'
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
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
                      item ? 'Simpan' : 'Tambah'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Delete Section - Only show when editing */}
            {item && isSuperAdmin && (
              <div style={{
                borderTop: '1px solid #e0e0e0',
                padding: '30px',
                backgroundColor: '#f9f9f9',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
              }}>
                <h3 className='fw-bold mb-4'>Hapus Barang</h3>
                <p className='text-muted mb-4'>
                  Apakah kamu yakin ingin menghapus barang ini ?
                </p>

                <div className='form-check mb-6'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id='confirmDelete'
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                  />
                  <label className='form-check-label' htmlFor='confirmDelete'>
                    Konfirmasi penghapusan barang
                  </label>
                </div>

                <div className='d-flex gap-3'>
                  <button
                    type='button'
                    className='btn btn-light'
                    onClick={onClose}
                  >
                    Deactivate Instead
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

      {/* Sub Modals */}
      {showMaterialModal && (
        <MaterialModal
          onClose={() => setShowMaterialModal(false)}
          onSave={handleMaterialSave}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={handleCategorySave}
        />
      )}
    </>
  )
}

export {InventoryModal}