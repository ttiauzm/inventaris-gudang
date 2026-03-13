import {FC, useState, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import EmptyState404 from '../../components/EmptyState404'
import {useAuth} from '../../modules/auth'
import {getCategories, createCategory, updateCategory, deleteCategory} from '../category/core/_requests'
import {getMaterials, createMaterial, updateMaterial, deleteMaterial} from '../material/core/_requests'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'
import {exportMasterDataToExcel, exportMasterDataToPDF} from '../../utils/exportUtils'
import {ConfirmModal} from '../../components/ConfirmModal'
import {SuccessModal} from '../../components/SuccessModal'

interface Item {
  id: string
  name: string
  description: string
}

const MasterDataPage: FC = () => {
  const {currentUser} = useAuth()
  
  // Categories State
  const [categories, setCategories] = useState<Item[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [searchQueryCategories, setSearchQueryCategories] = useState('')
  const [showModalCategory, setShowModalCategory] = useState(false)
  const [showExportCategory, setShowExportCategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Item | null>(null)
  const [formDataCategory, setFormDataCategory] = useState({name: '', description: ''})
  
  // Materials State
  const [materials, setMaterials] = useState<Item[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [searchQueryMaterials, setSearchQueryMaterials] = useState('')
  const [showModalMaterial, setShowModalMaterial] = useState(false)
  const [showExportMaterial, setShowExportMaterial] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Item | null>(null)
  const [formDataMaterial, setFormDataMaterial] = useState({name: '', description: ''})

  // Confirm & Success State
  const [deleteTarget, setDeleteTarget] = useState<{id: string; type: 'category' | 'material'} | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Inline error state untuk form modal
  const [errorCategory, setErrorCategory] = useState('')
  const [errorMaterial, setErrorMaterial] = useState('')

  // Check superadmin - akan otomatis bypass di dev mode
  const isSuperAdmin = checkSuperAdmin(currentUser)

  useEffect(() => {
    fetchCategories()
    fetchMaterials()
  }, [])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (e) {
      console.error(e)
    }
    setLoadingCategories(false)
  }

  const fetchMaterials = async () => {
    setLoadingMaterials(true)
    try {
      const data = await getMaterials()
      setMaterials(data)
    } catch (e) {
      console.error(e)
    }
    setLoadingMaterials(false)
  }

  if (!isSuperAdmin) {
    return <Navigate to='/dashboard' replace />
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQueryCategories.toLowerCase())
  )

  const filteredMaterials = materials.filter(mat =>
    mat.name.toLowerCase().includes(searchQueryMaterials.toLowerCase())
  )

  // Category Handlers
  const handleAddCategory = () => {
    setSelectedCategory(null)
    setFormDataCategory({name: '', description: ''})
    setShowModalCategory(true)
  }

  const handleEditCategory = (category: Item) => {
    setSelectedCategory(category)
    setFormDataCategory({name: category.name, description: category.description})
    setShowModalCategory(true)
  }

  const handleSaveCategory = async () => {
    if (!formDataCategory.name.trim()) {
      setErrorCategory('Nama kategori tidak boleh kosong!')
      return
    }
    setErrorCategory('')

    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, formDataCategory)
        setSuccessMessage('Kategori berhasil diperbarui')
      } else {
        await createCategory(formDataCategory)
        setSuccessMessage('Kategori berhasil ditambahkan')
      }
      setShowModalCategory(false)
      fetchCategories()
      setShowSuccess(true)
    } catch (error) {
      console.error('Error saving category:', error)
      setErrorCategory('Terjadi kesalahan saat menyimpan kategori. Silakan coba lagi.')
    }
  }

  const handleDeleteCategory = (id: string) => {
    setDeleteTarget({id, type: 'category'})
    setShowDeleteConfirm(true)
  }

  // Material Handlers
  const handleAddMaterial = () => {
    setSelectedMaterial(null)
    setFormDataMaterial({name: '', description: ''})
    setShowModalMaterial(true)
  }

  const handleEditMaterial = (material: Item) => {
    setSelectedMaterial(material)
    setFormDataMaterial({name: material.name, description: material.description})
    setShowModalMaterial(true)
  }

  const handleSaveMaterial = async () => {
    if (!formDataMaterial.name.trim()) {
      setErrorMaterial('Nama material tidak boleh kosong!')
      return
    }
    setErrorMaterial('')

    try {
      if (selectedMaterial) {
        await updateMaterial(selectedMaterial.id, formDataMaterial)
        setSuccessMessage('Material berhasil diperbarui')
      } else {
        await createMaterial(formDataMaterial)
        setSuccessMessage('Material berhasil ditambahkan')
      }
      setShowModalMaterial(false)
      fetchMaterials()
      setShowSuccess(true)
    } catch (error) {
      console.error('Error saving material:', error)
      setErrorMaterial('Terjadi kesalahan saat menyimpan material. Silakan coba lagi.')
    }
  }

  const handleDeleteMaterial = (id: string) => {
    setDeleteTarget({id, type: 'material'})
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return
    setShowDeleteConfirm(false)
    try {
      if (deleteTarget.type === 'category') {
        await deleteCategory(deleteTarget.id)
        fetchCategories()
        setSuccessMessage('Kategori berhasil dihapus')
      } else {
        await deleteMaterial(deleteTarget.id)
        fetchMaterials()
        setSuccessMessage('Material berhasil dihapus')
      }
      setShowSuccess(true)
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setDeleteTarget(null)
    }
  }

  // Export Functions
  const handleExportCategory = async (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportMasterDataToExcel(filteredCategories, 'Category')
    } else {
      await exportMasterDataToPDF(filteredCategories, 'Category')
    }
    setShowExportCategory(false)
  }

  const handleExportMaterial = async (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportMasterDataToExcel(filteredMaterials, 'Material')
    } else {
      await exportMasterDataToPDF(filteredMaterials, 'Material')
    }
    setShowExportMaterial(false)
  }

  return (
    <>
      {/* Modal konfirmasi hapus */}
      {showDeleteConfirm && (
        <ConfirmModal
          message={`Hapus ${deleteTarget?.type === 'category' ? 'kategori' : 'material'} ini? Data yang dihapus tidak dapat dikembalikan.`}
          confirmText='Hapus'
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
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div style={{borderRadius: '9px',margin: '10px' ,paddingTop: '2vh',padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
        <div className='row g-3'>
          {/* Category Section */}
          <div className='col-lg-6'>
            <div className='card'>
              <div className='card-header border-0 pt-6'>
                <div className='card-title'>
                  <h3 className='fw-bold mb-0'>List Kategori Barang</h3>
                </div>
                
                <div className='card-toolbar gap-2'>
                  {/* Export Dropdown */}
                  {isSuperAdmin && (
                  <div className='position-relative'>
                    <button
                      className='btn btn-sm btn-light-success'
                      onClick={() => setShowExportCategory(!showExportCategory)}
                    >
                      <KTIcon iconName='file-down' className='fs-3' />
                      Export
                    </button>
                    {showExportCategory && (
                      <div className='menu menu-sub menu-sub-dropdown show position-absolute' style={{top: '100%', right: 0, zIndex: 105}}>
                        <div className='menu-item px-3'>
                          <button className='menu-link px-3' onClick={() => handleExportCategory('excel')}>
                            <KTIcon iconName='file-sheet' className='fs-3 me-2' />
                            Export Excel
                          </button>
                        </div>
                        <div className='menu-item px-3'>
                          <button className='menu-link px-3' onClick={() => handleExportCategory('pdf')}>
                            <KTIcon iconName='file' className='fs-3 me-2' />
                            Export PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  <button className='btn btn-sm btn-primary' onClick={handleAddCategory}>
                    <KTIcon iconName='plus' className='fs-3' />
                    Tambah
                  </button>
                </div>
              </div>

              <div className='card-body py-4'>
                <div className='mb-3'>
                  <div className='d-flex align-items-center position-relative'>
                    <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3' />
                    <input
                      type='text'
                      className='form-control form-control-sm ps-10'
                      placeholder='Cari Kategori'
                      value={searchQueryCategories}
                      onChange={(e) => setSearchQueryCategories(e.target.value)}
                    />
                  </div>
                </div>

                {loadingCategories ? (
                  <div className='text-center py-10'>
                    <span className='spinner-border spinner-border-sm' />
                  </div>
                ) : (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th className='min-w-50px'>No</th>
                          <th className='min-w-100px'>ID</th>
                          <th className='min-w-150px'>Nama Kategori</th>
                          <th className='min-w-200px'>Deskripsi</th>
                          <th className='min-w-100px text-end'>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <EmptyState404
                                title='Tidak ada kategori ditemukan'
                                subtitle='Pastikan kata kunci pencarian Anda benar.'
                              />
                            </td>
                          </tr>
                        ) : filteredCategories.slice(0, 10).map((category, index) => (
                          <tr key={category.id}>
                            <td>{index + 1}</td>
                            <td className='text-dark fw-bold'>{category.id}</td>
                            <td className='text-dark fw-bold'>{category.name}</td>
                            <td className='text-muted'>{category.description || '-'}</td>
                            <td className='text-end'>
                              <button
                                className='btn btn-icon btn-sm btn-light-primary me-2'
                                onClick={() => handleEditCategory(category)}
                                title='Edit'
                              >
                                <KTIcon iconName='pencil' className='fs-4' />
                              </button>
                              <button
                                className='btn btn-icon btn-sm btn-light-danger'
                                onClick={() => handleDeleteCategory(category.id)}
                                title='Hapus'
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

                <div className='d-flex justify-content-between align-items-center mt-4'>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='text-muted'>Show</span>
                    <select className='form-select form-select-sm w-auto'>
                      <option value='10'>10</option>
                      <option value='25'>25</option>
                      <option value='50'>50</option>
                    </select>
                    <span className='text-muted'>per page</span>
                  </div>
                  <div>
                    <span className='text-muted'>1-10 of 52</span>
                    <button className='btn btn-sm btn-icon btn-light ms-2'>
                      <KTIcon iconName='arrow-left' className='fs-3' />
                    </button>
                    {[1, 2, 3, 4, 5].map(page => (
                      <button key={page} className={`btn btn-sm btn-icon ${page === 1 ? 'btn-primary' : 'btn-light'} ms-1`}>
                        {page}
                      </button>
                    ))}
                    <button className='btn btn-sm btn-icon btn-light ms-1'>
                      <KTIcon iconName='arrow-right' className='fs-3' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Material Section */}
          <div className='col-lg-6'>
            <div className='card'>
              <div className='card-header border-0 pt-6'>
                <div className='card-title'>
                  <h3 className='fw-bold mb-0'>List Jenis Material</h3>
                </div>
                
                <div className='card-toolbar gap-2'>
                  {/* Export Dropdown */}
                  {isSuperAdmin && (
                  <div className='position-relative'>
                    <button
                      className='btn btn-sm btn-light-success'
                      onClick={() => setShowExportMaterial(!showExportMaterial)}
                    >
                      <KTIcon iconName='file-down' className='fs-3' />
                      Export
                    </button>
                    {showExportMaterial && (
                      <div className='menu menu-sub menu-sub-dropdown show position-absolute' style={{top: '100%', right: 0, zIndex: 105}}>
                        <div className='menu-item px-3'>
                          <button className='menu-link px-3' onClick={() => handleExportMaterial('excel')}>
                            <KTIcon iconName='file-sheet' className='fs-3 me-2' />
                            Export Excel
                          </button>
                        </div>
                        <div className='menu-item px-3'>
                          <button className='menu-link px-3' onClick={() => handleExportMaterial('pdf')}>
                            <KTIcon iconName='file' className='fs-3 me-2' />
                            Export PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  <button className='btn btn-sm btn-primary' onClick={handleAddMaterial}>
                    <KTIcon iconName='plus' className='fs-3' />
                    Tambah
                  </button>
                </div>
              </div>

              <div className='card-body py-4'>
                <div className='mb-3'>
                  <div className='d-flex align-items-center position-relative'>
                    <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3' />
                    <input
                      type='text'
                      className='form-control form-control-sm ps-10'
                      placeholder='Cari Jenis Material'
                      value={searchQueryMaterials}
                      onChange={(e) => setSearchQueryMaterials(e.target.value)}
                    />
                  </div>
                </div>

                {loadingMaterials ? (
                  <div className='text-center py-10'>
                    <span className='spinner-border spinner-border-sm' />
                  </div>
                ) : (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th className='min-w-50px'>No</th>
                          <th className='min-w-100px'>ID</th>
                          <th className='min-w-150px'>Nama Material</th>
                          <th className='min-w-200px'>Deskripsi</th>
                          <th className='min-w-100px text-end'>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <EmptyState404
                                title='Tidak ada material ditemukan'
                                subtitle='Pastikan kata kunci pencarian Anda benar.'
                              />
                            </td>
                          </tr>
                        ) : filteredMaterials.slice(0, 10).map((material, index) => (
                          <tr key={material.id}>
                            <td>{index + 1}</td>
                            <td className='text-dark fw-bold'>{material.id}</td>
                            <td className='text-dark fw-bold'>{material.name}</td>
                            <td className='text-muted'>{material.description || '-'}</td>
                            <td className='text-end'>
                              <button
                                className='btn btn-icon btn-sm btn-light-primary me-2'
                                onClick={() => handleEditMaterial(material)}
                                title='Edit'
                              >
                                <KTIcon iconName='pencil' className='fs-4' />
                              </button>
                              <button
                                className='btn btn-icon btn-sm btn-light-danger'
                                onClick={() => handleDeleteMaterial(material.id)}
                                title='Hapus'
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

                <div className='d-flex justify-content-between align-items-center mt-4'>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='text-muted'>Show</span>
                    <select className='form-select form-select-sm w-auto'>
                      <option value='10'>10</option>
                      <option value='25'>25</option>
                      <option value='50'>50</option>
                    </select>
                    <span className='text-muted'>per page</span>
                  </div>
                  <div>
                    <span className='text-muted'>1-10 of 52</span>
                    <button className='btn btn-sm btn-icon btn-light ms-2'>
                      <KTIcon iconName='arrow-left' className='fs-3' />
                    </button>
                    {[1, 2, 3, 4, 5].map(page => (
                      <button key={page} className={`btn btn-sm btn-icon ${page === 1 ? 'btn-primary' : 'btn-light'} ms-1`}>
                        {page}
                      </button>
                    ))}
                    <button className='btn btn-sm btn-icon btn-light ms-1'>
                      <KTIcon iconName='arrow-right' className='fs-3' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showModalCategory && (
        <>
          <div className='modal-backdrop fade show' onClick={() => setShowModalCategory(false)} />
          <div className='modal fade show d-block' tabIndex={-1}>
            <div className='modal-dialog modal-dialog-centered'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    {selectedCategory ? 'Edit Kategori Barang' : 'Tambah Kategori Barang'}
                  </h5>
                  <button type='button' className='btn-close' onClick={() => { setShowModalCategory(false); setErrorCategory('') }} />
                </div>
                <div className='modal-body'>
                  {errorCategory && (
                    <div className='alert alert-danger py-3 mb-4'>{errorCategory}</div>
                  )}
                  <div className='mb-5'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className={`form-control ${errorCategory && !formDataCategory.name.trim() ? 'is-invalid' : ''}`}
                      placeholder='Kain Sutra Emas'
                      value={formDataCategory.name}
                      onChange={(e) => { setFormDataCategory({...formDataCategory, name: e.target.value}); if (errorCategory) setErrorCategory('') }}
                    />
                  </div>
                  <div className='mb-5'>
                    <label className='form-label'>Deskripsi</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      placeholder='Kain Sutra Emas'
                      value={formDataCategory.description}
                      onChange={(e) => setFormDataCategory({...formDataCategory, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button className='btn btn-product-light' onClick={() => setShowModalCategory(false)}>
                    Batal
                  </button>
                  <button 
                    className='btn btn-product' 
                    onClick={handleSaveCategory}
                  >
                    {selectedCategory ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Material Modal */}
      {showModalMaterial && (
        <>
          <div className='modal-backdrop fade show' onClick={() => setShowModalMaterial(false)} />
          <div className='modal fade show d-block' tabIndex={-1}>
            <div className='modal-dialog modal-dialog-centered'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    {selectedMaterial ? 'Edit Jenis Material' : 'Tambah Jenis Material'}
                  </h5>
                  <button type='button' className='btn-close' onClick={() => { setShowModalMaterial(false); setErrorMaterial('') }} />
                </div>
                <div className='modal-body'>
                  {errorMaterial && (
                    <div className='alert alert-danger py-3 mb-4'>{errorMaterial}</div>
                  )}
                  <div className='mb-5'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className={`form-control ${errorMaterial && !formDataMaterial.name.trim() ? 'is-invalid' : ''}`}
                      placeholder='Kain Sutra Emas'
                      value={formDataMaterial.name}
                      onChange={(e) => { setFormDataMaterial({...formDataMaterial, name: e.target.value}); if (errorMaterial) setErrorMaterial('') }}
                    />
                  </div>
                  <div className='mb-5'>
                    <label className='form-label'>Deskripsi</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      placeholder='Kain Sutra Emas'
                      value={formDataMaterial.description}
                      onChange={(e) => setFormDataMaterial({...formDataMaterial, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button className='btn btn-product-light' onClick={() => setShowModalMaterial(false)}>
                    Batal
                  </button>
                  <button 
                    className='btn btn-product' 
                    onClick={handleSaveMaterial}
                  >
                    {selectedMaterial ? 'Simpan' : 'Tambah'}
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

export {MasterDataPage}
