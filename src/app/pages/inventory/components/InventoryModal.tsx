import {FC, useState, useEffect} from 'react'
import { InventoryItem } from '../core/_model'
import {createInventory, updateInventory, updateInventoryDetails, deleteInventory, getItemsDropdown} from '../core/_requests'
import {KTIcon} from '../../../../_metronic/helpers'
import { MaterialModal } from './MaterialModal'
import { CategoryModal } from './CategoryModal'
import {useAuth} from '../../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../../utils/permissionHelper'
import {ConfirmModal} from '../../../components/ConfirmModal'
import {SuccessModal} from '../../../components/SuccessModal'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [dropdownData, setDropdownData] = useState({
    categories: [] as any[],
    materials: [] as any[],
    suppliers: [] as any[]
  })

  const [formData, setFormData] = useState({
    item_name: '',
    category_id: '',
    material_id: '',
    supplier_ids: [] as string[],
    quantity: 0,
    unit: 'pcs',
    price: 0,
    description: ''
  })

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const data = await getItemsDropdown()
        setDropdownData(data)
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
      }
    }
    fetchDropdownData()
  }, [])

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.name,
        category_id: '', // We don't have IDs in the mapped item, but edit is not supported by backend anyway
        material_id: '',
        supplier_ids: [],
        quantity: item.quantity,
        unit: item.unit,
        price: item.price || 0,
        description: item.description || ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Inline validation
    const newErrors: Record<string, string> = {}
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Semua kolom wajib diisi'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    
    try {
      setLoading(true)
      
      if (item) {
        // Gunakan endpoint /details khusus untuk edit nama, harga, unit
        // (PUT /items/{id} adalah untuk operasi pengambilan stok, bukan edit detail)
        await updateInventoryDetails(item.id, {
          item_name: formData.item_name,
          unit: formData.unit,
          price: formData.price,
        })
        setSuccessMessage('Barang berhasil diperbarui')
      } else {
        await createInventory(formData)
        setSuccessMessage('Barang berhasil ditambahkan')
      }
      setShowSuccess(true)
    } catch (error) {
      console.error('Error saving inventory:', error)
      setErrors({item_name: 'Gagal menyimpan data. Periksa koneksi dan coba lagi.'})
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setErrors({item_name: 'Silakan centang konfirmasi penghapusan barang terlebih dahulu'})
      return
    }
    setErrors({})
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAction = async () => {
    setShowDeleteConfirm(false)
    try {
      setLoading(true)
      if (item) {
        await deleteInventory(item.id)
        setSuccessMessage('Barang berhasil dihapus')
        setShowSuccess(true)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Gagal menghapus barang')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Modal konfirmasi hapus */}
      {showDeleteConfirm && (
        <ConfirmModal
          message='Apakah Anda yakin ingin menghapus barang ini? Data yang dihapus tidak dapat dikembalikan.'
          confirmText='Hapus Barang'
          cancelText='Batal'
          confirmClass='btn-danger'
          onConfirm={confirmDeleteAction}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {/* Modal sukses */}
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
                      className={`form-control form-control-lg ${errors.item_name ? 'is-invalid' : ''}`}
                      placeholder='Kain Sutra Emas'
                      value={formData.item_name}
                      onChange={(e) => {
                        setFormData({...formData, item_name: e.target.value})
                        if (errors.item_name) setErrors(prev => ({...prev, item_name: ''}))
                      }}
                    />
                    {errors.item_name && (
                      <div className='invalid-feedback fw-semibold'>{errors.item_name}</div>
                    )}
                  </div>

                  {!item && (
                    <>
                      {/* Kategori - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Kategori</label>
                        <select
                          className='form-select form-select-lg'
                          value={formData.category_id}
                          onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                          required
                        >
                          <option value=''>Pilih Kategori</option>
                          {dropdownData.categories.map((cat: any) => (
                            <option key={cat.category_id} value={cat.category_id}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Material - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Material</label>
                        <select
                          className='form-select form-select-lg'
                          value={formData.material_id}
                          onChange={(e) => setFormData({...formData, material_id: e.target.value})}
                          required
                        >
                          <option value=''>Pilih Material</option>
                          {dropdownData.materials.map((mat: any) => (
                            <option key={mat.material_id} value={mat.material_id}>
                              {mat.material_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Supplier - Only for Add */}
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>Supplier</label>
                        <select
                          className='form-select form-select-lg'
                          value={formData.supplier_ids[0] || ''}
                          onChange={(e) => setFormData({...formData, supplier_ids: [e.target.value]})}
                          required
                        >
                          <option value=''>Pilih Supplier</option>
                          {dropdownData.suppliers.map((sup: any) => (
                            <option key={sup.supplier_id} value={sup.supplier_id}>
                              {sup.supplier_name}
                            </option>
                          ))}
                        </select>
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
                    Batal
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
                      'Hapus Barang'
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
          onSave={() => setShowMaterialModal(false)}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={() => setShowCategoryModal(false)}
        />
      )}
    </>
  )
}

export {InventoryModal}