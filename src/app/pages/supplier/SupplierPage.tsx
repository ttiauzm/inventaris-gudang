import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import {getSuppliers, deleteSupplier, Supplier} from './core/_requests'
import {SupplierModal} from './components/SupplierModal'

const SupplierPage: FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await getSuppliers()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage)

  const handleAdd = () => {
    setSelectedSupplier(null)
    setShowModal(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await deleteSupplier(id)
        fetchSuppliers()
      } catch (error) {
        console.error('Error deleting supplier:', error)
        alert('Gagal menghapus supplier')
      }
    }
  }

  const handleSave = () => {
    setShowModal(false)
    fetchSuppliers()
  }

  return (
    <>
    <div style={{borderRadius: '9px',margin: '10px' ,paddingTop: '2vh',padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
      <div className='card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title'>
            <h3 className='fw-bold mb-0'>Supplier</h3>
          </div>
          
          <div className='card-toolbar gap-3'>
            <div className='d-flex align-items-center position-relative'>
              <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
              <input
                type='text'
                className='form-control form-control-solid w-250px ps-13'
                placeholder='Cari Supplier'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <button className='btn btn-sm btn-primary' onClick={handleAdd}>
              <KTIcon iconName='plus' className='fs-3' />
              Tambah Supplier
            </button>
          </div>
        </div>

        <div className='card-body py-4'>
          {loading ? (
            <div className='text-center py-10'>
              <span className='spinner-border spinner-border-lg'></span>
            </div>
          ) : (
            <>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th className='min-w-50px'>No</th>
                      <th className='min-w-200px'>Nama Supplier</th>
                      <th className='min-w-150px'>Contact Person</th>
                      <th className='min-w-125px'>Telepon</th>
                      <th className='min-w-125px'>Email</th>
                      <th className='min-w-150px'>Alamat</th>
                      <th className='text-end min-w-100px'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((supplier, index) => (
                        <tr key={supplier.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>
                            <div className='d-flex flex-column'>
                              <span className='text-gray-800 fw-bold mb-1'>
                                {supplier.name}
                              </span>
                              {supplier.company && (
                                <span className='text-muted fs-7'>
                                  {supplier.company}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{supplier.contact_person || '-'}</td>
                          <td>{supplier.phone || '-'}</td>
                          <td>{supplier.email || '-'}</td>
                          <td>
                            <span className='text-muted fs-7'>
                              {supplier.address || '-'}
                            </span>
                          </td>
                          <td className='text-end'>
                            <button
                              className='btn btn-icon btn-light-primary btn-sm me-2'
                              onClick={() => handleEdit(supplier)}
                              title='Edit'
                            >
                              <KTIcon iconName='pencil' className='fs-4' />
                            </button>
                            <button
                              className='btn btn-icon btn-light-danger btn-sm'
                              onClick={() => handleDelete(supplier.id)}
                              title='Delete'
                            >
                              <KTIcon iconName='trash' className='fs-4' />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className='text-center py-10'>
                          <KTIcon iconName='file-deleted' className='fs-3x text-muted mb-3' />
                          <p className='text-muted'>Tidak ada supplier</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredSuppliers.length > 0 && (
                <div className='d-flex justify-content-between align-items-center flex-wrap pt-5'>
                  <div className='text-muted'>
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length}
                  </div>

                  <div className='d-flex gap-2'>
                    <button
                      className='btn btn-sm btn-light-primary'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      <KTIcon iconName='arrow-left' className='fs-3' />
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      className='btn btn-sm btn-light-primary'
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      <KTIcon iconName='arrow-right' className='fs-3' />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleSave}
        />
      )}
      </div>
    </>
  )
}

export {SupplierPage}