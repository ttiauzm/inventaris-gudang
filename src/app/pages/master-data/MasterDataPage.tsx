import {FC, useState, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'
import {getCategoriesData, addCategory, updateCategory as updateCategoryData, deleteCategory, addMaterial, updateMaterial as updateMaterialData, deleteMaterial} from '../../data/dataManager'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'
import {exportMasterDataToExcel, exportMasterDataToPDF} from '../../utils/exportUtils'

interface Item {
  id: number
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

  // Check superadmin - akan otomatis bypass di dev mode
  const isSuperAdmin = checkSuperAdmin(currentUser)

  useEffect(() => {
    fetchCategories()
    fetchMaterials()
  }, [])

  const fetchCategories = () => {
    setLoadingCategories(true)
    const data = getCategoriesData()
    setCategories(data)
    setLoadingCategories(false)
  }

  const fetchMaterials = () => {
    setLoadingMaterials(true)
    const data = getCategoriesData() // Using same data for demo
    setMaterials(data)
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

  const handleSaveCategory = () => {
    if (!formDataCategory.name.trim()) {
      alert('Nama kategori tidak boleh kosong!')
      return
    }

    try {
      if (selectedCategory) {
        updateCategoryData(selectedCategory.id, formDataCategory)
      } else {
        addCategory(formDataCategory)
      }
      setShowModalCategory(false)
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Terjadi kesalahan saat menyimpan kategori. Silakan coba lagi.')
    }
  }

  const handleDeleteCategory = (id: number) => {
    if (window.confirm('Hapus kategori ini?')) {
      deleteCategory(id)
      fetchCategories()
    }
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

  const handleSaveMaterial = () => {
    if (!formDataMaterial.name.trim()) {
      alert('Nama material tidak boleh kosong!')
      return
    }

    try {
      if (selectedMaterial) {
        updateMaterialData(selectedMaterial.id, formDataMaterial)
      } else {
        addMaterial(formDataMaterial)
      }
      setShowModalMaterial(false)
      fetchMaterials()
    } catch (error) {
      console.error('Error saving material:', error)
      alert('Terjadi kesalahan saat menyimpan material. Silakan coba lagi.')
    }
  }

  const handleDeleteMaterial = (id: number) => {
    if (window.confirm('Hapus material ini?')) {
      deleteMaterial(id)
      fetchMaterials()
    }
  }

  // Export Functions
  const handleExportCategory = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportMasterDataToExcel(filteredCategories, 'Category')
    } else {
      exportMasterDataToPDF(filteredCategories, 'Category')
    }
    setShowExportCategory(false)
  }

  const handleExportMaterial = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportMasterDataToExcel(filteredMaterials, 'Material')
    } else {
      exportMasterDataToPDF(filteredMaterials, 'Material')
    }
    setShowExportMaterial(false)
  }

  return (
    <>
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
                          <th className='min-w-100px'>Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.slice(0, 10).map((category, index) => (
                          <tr key={category.id}>
                            <td>{index + 1}</td>
                            <td className='text-dark fw-bold'>{category.id}</td>
                            <td className='text-dark fw-bold'>{category.name}</td>
                            <td>12 pcs</td>
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
                          <th className='min-w-100px'>Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.slice(0, 10).map((material, index) => (
                          <tr key={material.id}>
                            <td>{index + 1}</td>
                            <td className='text-dark fw-bold'>{material.id}</td>
                            <td className='text-dark fw-bold'>{material.name}</td>
                            <td>12 pcs</td>
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
                  <button type='button' className='btn-close' onClick={() => setShowModalCategory(false)} />
                </div>
                <div className='modal-body'>
                  <div className='mb-5'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Kain Sutra Emas'
                      value={formDataCategory.name}
                      onChange={(e) => setFormDataCategory({...formDataCategory, name: e.target.value})}
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
                  <button className='btn btn-light' onClick={() => setShowModalCategory(false)}>
                    Batal
                  </button>
                  <button 
                    className='btn btn-primary' 
                    onClick={handleSaveCategory}
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
                  <button type='button' className='btn-close' onClick={() => setShowModalMaterial(false)} />
                </div>
                <div className='modal-body'>
                  <div className='mb-5'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Kain Sutra Emas'
                      value={formDataMaterial.name}
                      onChange={(e) => setFormDataMaterial({...formDataMaterial, name: e.target.value})}
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
                  <button className='btn btn-light' onClick={() => setShowModalMaterial(false)}>
                    Batal
                  </button>
                  <button 
                    className='btn btn-primary' 
                    onClick={handleSaveMaterial}
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

export {MasterDataPage}
