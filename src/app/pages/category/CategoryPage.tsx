import {FC, useState, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'
import {getCategoriesData, updateCategory as updateCategoryData, deleteCategory, addCategory} from '../../data/dataManager'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'

interface Category {
  id: number
  name: string
  description: string
}

const CategoryPage: FC = () => {
  const {currentUser} = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({name: '', description: ''})

  // Check superadmin - akan otomatis bypass di dev mode
  const isSuperAdmin = checkSuperAdmin(currentUser)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = () => {
    setLoading(true)
    const data = getCategoriesData()
    setCategories(data)
    setLoading(false)
  }

  if (!isSuperAdmin) {
    return <Navigate to='/apps/categories' replace />
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setSelectedCategory(null)
    setFormData({name: '', description: ''})
    setShowModal(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({name: category.name, description: category.description})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nama kategori tidak boleh kosong!')
      return
    }

    try {
      if (selectedCategory) {
        updateCategoryData(selectedCategory.id, formData)
      } else {
        addCategory(formData)
      }
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Terjadi kesalahan saat menyimpan kategori. Silakan coba lagi.')
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus kategori ini?')) {
      deleteCategory(id)
      fetchCategories()
    }
  }

  return (
    <>
      <div style={{borderRadius: '9px', margin: '10px', padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
        <div className='card'>
          <div className='card-header border-0 pt-6'>
            <div className='card-title'>
              <h3 className='fw-bold mb-0'>Kategori Barang</h3>
            </div>
            
            <div className='card-toolbar gap-3'>
              <div className='d-flex align-items-center position-relative'>
                <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
                <input
                  type='text'
                  className='form-control form-control-solid w-250px ps-13'
                  placeholder='Cari Kategori'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className='btn btn-sm btn-primary' onClick={handleAdd}>
                <KTIcon iconName='plus' className='fs-3' />
                Tambah Kategori
              </button>
            </div>
          </div>

          <div className='card-body py-4'>
            {loading ? (
              <div className='text-center py-10'>
                <span className='spinner-border spinner-border-lg' />
              </div>
            ) : (
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th className='min-w-50px'>No</th>
                      <th className='min-w-200px'>Nama Kategori</th>
                      <th className='min-w-300px'>Deskripsi</th>
                      <th className='text-end min-w-100px'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {filteredCategories.map((category, index) => (
                      <tr key={category.id}>
                        <td>{index + 1}</td>
                        <td className='fw-bold'>{category.name}</td>
                        <td className='text-muted'>{category.description}</td>
                        <td className='text-end'>
                          <button
                            className='btn btn-icon btn-light-primary btn-sm me-2'
                            onClick={() => handleEdit(category)}
                          >
                            <KTIcon iconName='pencil' className='fs-4' />
                          </button>
                          <button
                            className='btn btn-icon btn-light-danger btn-sm'
                            onClick={() => handleDelete(category.id)}
                          >
                            <KTIcon iconName='trash' className='fs-4' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className='modal-backdrop fade show' onClick={() => setShowModal(false)} />
          <div className='modal fade show d-block' tabIndex={-1}>
            <div className='modal-dialog modal-dialog-centered'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    {selectedCategory ? 'Edit Kategori Barang' : 'Tambah Kategori Barang'}
                  </h5>
                  <button type='button' className='btn-close' onClick={() => setShowModal(false)} />
                </div>
                <div className='modal-body'>
                  <div className='mb-5'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Kain Sutra Emas'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className='mb-5'>
                    <label className='form-label'>Deskripsi</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      placeholder='Kain Sutra Emas'
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button className='btn btn-light' onClick={() => setShowModal(false)}>
                    Batal
                  </button>
                  <button 
                    className='btn btn-primary' 
                    onClick={handleSave}
                    style={{backgroundColor: '#007bff', borderColor: '#007bff'}}
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export {CategoryPage}