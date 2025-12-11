import {FC, useState, useEffect} from 'react'
import { InventoryItem } from '../core/_model'
import {createInventory, updateInventory} from '../core/_requests'
import {KTIcon} from '../../../../_metronic/helpers'
import { MaterialModal } from './MaterialModal'
import { CategoryModal } from './CategoryModal'

interface InventoryModalProps {
  item: InventoryItem | null
  onClose: () => void
  onSave: () => void
}

const InventoryModal: FC<InventoryModalProps> = ({item, onClose, onSave}) => {
  const [loading, setLoading] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  
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

  return (
    <>
      <div className='modal-backdrop fade show' onClick={onClose} />

      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                {item ? 'Edit Barang' : 'Tambah Barang'}
              </h5>
              <button type='button' className='btn-close' onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='row g-5'>
                  {/* Nama Barang */}
                  <div className='col-12'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Kain Sutra Emas'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  {/* Kategori dengan tombol tambah */}
                  <div className='col-md-6'>
                    <label className='form-label required'>Kategori</label>
                    <div className='input-group'>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Kain/Pernak-pernik/Lain-lain...'
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        required
                      />
                      <button
                        type='button'
                        className='btn btn-light-primary'
                        onClick={() => setShowCategoryModal(true)}
                      >
                        <KTIcon iconName='plus' className='fs-3' />
                      </button>
                    </div>
                  </div>

                  {/* Material dengan tombol tambah */}
                  <div className='col-md-6'>
                    <label className='form-label required'>Material</label>
                    <div className='input-group'>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Jl. in aja dulu'
                        value={formData.material}
                        onChange={(e) => setFormData({...formData, material: e.target.value})}
                        required
                      />
                      <button
                        type='button'
                        className='btn btn-light-primary'
                        onClick={() => setShowMaterialModal(true)}
                      >
                        <KTIcon iconName='plus' className='fs-3' />
                      </button>
                    </div>
                  </div>

                  {/* Supplier dengan tombol tambah */}
                  <div className='col-12'>
                    <label className='form-label required'>Supplier</label>
                    <div className='input-group'>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='jogja'
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        required
                      />
                      <button type='button' className='btn btn-light-primary'>
                        <KTIcon iconName='plus' className='fs-3' />
                      </button>
                    </div>
                  </div>

                  {/* Jumlah */}
                  <div className='col-md-6'>
                    <label className='form-label required'>Jumlah</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Jogja'
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div className='col-md-6'>
                    <label className='form-label required'>Unit</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='55555'
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      required
                    />
                  </div>

                  {/* Harga */}
                  <div className='col-12'>
                    <label className='form-label'>Harga</label>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Indonesia'
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
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
                <button
                  type='submit'
                  className='btn btn-primary'
                  style={{backgroundColor: '#5C8AE6'}}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <KTIcon iconName='check' className='fs-3' />
                      Tambah
                    </>
                  )}
                </button>
              </div>
            </form>
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